/*
Package handlers contains the WebSocket stream handler.

Flow:
 1. Browser connects: GET /ws/stream/{streamId} → upgraded to WebSocket
 2. Client sends:   {"action":"start","url":"rtsp://..."}
 3. Server spawns FFmpeg subprocess, reads JPEG frames from stdout
 4. Each complete JPEG frame is base64-encoded and sent as:
    {"type":"frame","data":"<base64>"}
 5. Status/error messages follow the same protocol as the Python original
 6. On disconnect or stop, the FFmpeg process is killed and resources freed
*/
package handlers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// ── WebSocket upgrader ────────────────────────────────────────────────────────

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 65536,
	CheckOrigin:     func(_ *http.Request) bool { return true }, // CORS handled by middleware
}

// ── JPEG frame delimiters ─────────────────────────────────────────────────────

var (
	jpegSOI = []byte{0xFF, 0xD8} // Start of Image
	jpegEOI = []byte{0xFF, 0xD9} // End of Image
)

// ── Global concurrency limit ──────────────────────────────────────────────────

var (
	activeStreamsMu sync.Mutex
	activeStreams   = make(map[string]struct{})
)

func maxConcurrent() int { return envInt("STREAM_MAX_CONCURRENT", 6) }

// ── FFmpeg discovery ──────────────────────────────────────────────────────────

// findFFmpeg locates the ffmpeg binary, preferring a local ./bin/ copy.
func findFFmpeg() string {
	// 1. Relative bin/ directory (works in local dev and Docker)
	ext := ""
	if runtime.GOOS == "windows" {
		ext = ".exe"
	}
	relPaths := []string{
		filepath.Join("bin", "ffmpeg"+ext),
		filepath.Join("..", "bin", "ffmpeg"+ext),
	}
	for _, p := range relPaths {
		if _, err := os.Stat(p); err == nil {
			abs, _ := filepath.Abs(p)
			log.Printf("FFmpeg found at: %s", abs)
			return abs
		}
	}

	// 2. Next to the running executable
	exe, err := os.Executable()
	if err == nil {
		candidate := filepath.Join(filepath.Dir(exe), "bin", "ffmpeg"+ext)
		if _, err := os.Stat(candidate); err == nil {
			log.Printf("FFmpeg found at: %s", candidate)
			return candidate
		}
	}

	// 3. System PATH
	if path, err := exec.LookPath("ffmpeg"); err == nil {
		log.Printf("FFmpeg found in PATH: %s", path)
		return path
	}

	log.Println("WARNING: ffmpeg not found — stream processing will fail")
	return "ffmpeg" // will produce a clear FileNotFoundError at runtime
}

var ffmpegPath = findFFmpeg()

// ── WebSocket message types ───────────────────────────────────────────────────

type clientMsg struct {
	Action string `json:"action"`
	URL    string `json:"url"`
}

// ── Stream session ────────────────────────────────────────────────────────────

// streamSession manages one active RTSP → WebSocket bridge.
type streamSession struct {
	streamID string
	rtspURL  string
	conn     *websocket.Conn
	writeMu  sync.Mutex

	cmd       *exec.Cmd
	streaming atomic.Bool
}

// NewStreamWSHandler returns the HTTP handler for WebSocket stream connections.
func NewStreamWSHandler() http.HandlerFunc {
	log.Printf("Using FFmpeg: %s", ffmpegPath)

	return func(w http.ResponseWriter, r *http.Request) {
		streamID := mux.Vars(r)["streamId"]

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WS upgrade error stream_id=%s: %v", streamID, err)
			return
		}
		defer conn.Close()

		log.Printf("WS connected stream_id=%s", streamID)

		sess := &streamSession{streamID: streamID, conn: conn}
		sess.sendStatus("connected", "WebSocket connection established.")

		// ── Message loop ───────────────────────────────────────────────────────
		for {
			_, raw, err := conn.ReadMessage()
			if err != nil {
				if !websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
					log.Printf("WS read error stream_id=%s: %v", streamID, err)
				}
				break
			}

			var msg clientMsg
			if err := json.Unmarshal(raw, &msg); err != nil {
				sess.sendError("Invalid JSON message.")
				continue
			}

			switch msg.Action {
			case "start":
				if msg.URL == "" {
					sess.sendError("RTSP URL is required.")
					continue
				}
				go sess.startStream(msg.URL)
			case "stop":
				sess.stopStream()
				sess.sendStatus("stopped", "Stream paused.")
			case "restart":
				sess.stopStream()
				if sess.rtspURL != "" {
					go sess.startStream(sess.rtspURL)
				}
			default:
				sess.sendError(fmt.Sprintf("Unknown action: %s", msg.Action))
			}
		}

		// ── Cleanup ────────────────────────────────────────────────────────────
		sess.stopStream()
		log.Printf("WS disconnected stream_id=%s", streamID)
	}
}

// ── startStream ───────────────────────────────────────────────────────────────

var rtspURLPattern = regexp.MustCompile(`(?i)^rtsp://\S+$`)

func (s *streamSession) startStream(rtspURL string) {
	s.stopStream() // stop any previous stream on this session

	if !rtspURLPattern.MatchString(rtspURL) {
		s.sendError("Invalid RTSP URL. Must start with rtsp:// and contain a valid host.")
		return
	}

	// Enforce concurrency limit
	activeStreamsMu.Lock()
	if len(activeStreams) >= maxConcurrent() {
		activeStreamsMu.Unlock()
		s.sendError(fmt.Sprintf(
			"Maximum concurrent streams (%d) reached. Please stop another stream first.",
			maxConcurrent(),
		))
		return
	}
	activeStreams[s.streamID] = struct{}{}
	activeStreamsMu.Unlock()

	s.rtspURL = rtspURL
	s.sendStatus("connecting", "Connecting to RTSP stream...")

	frameRate := envInt("STREAM_FRAME_RATE", 15)
	quality := envInt("STREAM_QUALITY", 5)
	width := envInt("STREAM_WIDTH", 640)

	args := buildFFmpegArgs(rtspURL, frameRate, quality, width)
	cmd := exec.Command(ffmpegPath, args...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		s.removeFromActive()
		s.sendError(fmt.Sprintf("Stdout pipe error: %v", err))
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		s.removeFromActive()
		s.sendError(fmt.Sprintf("Stderr pipe error: %v", err))
		return
	}

	if err := cmd.Start(); err != nil {
		s.removeFromActive()
		if os.IsNotExist(err) || strings.Contains(err.Error(), "not found") {
			s.sendError("FFmpeg is not installed on the server. Please install FFmpeg to enable stream processing.")
		} else {
			s.sendError(fmt.Sprintf("Failed to start stream: %v", err))
		}
		return
	}

	s.cmd = cmd
	s.streaming.Store(true)
	log.Printf("FFmpeg started stream_id=%s pid=%d", s.streamID, cmd.Process.Pid)
	s.sendStatus("streaming", "Stream started successfully.")

	// Read stderr asynchronously so it doesn't block stdout reads
	go func() {
		data, _ := io.ReadAll(stderr)
		if s.streaming.Load() && len(data) > 0 {
			text := strings.TrimSpace(string(data))
			if text != "" {
				log.Printf("FFmpeg stderr stream_id=%s: %s", s.streamID, truncate(text, 500))
				s.sendError(parseFFmpegError(text))
			}
		}
	}()

	// Block until FFmpeg closes stdout (stream ends or is stopped)
	s.readFrames(stdout)

	s.removeFromActive()
	if s.streaming.Load() {
		s.streaming.Store(false)
		s.sendStatus("disconnected", "Stream ended. The RTSP source may have disconnected.")
	}
}

// ── buildFFmpegArgs ───────────────────────────────────────────────────────────

func buildFFmpegArgs(rtspURL string, frameRate, quality, width int) []string {
	lower := strings.ToLower(rtspURL)
	isDemo := strings.Contains(lower, "demo") ||
		strings.Contains(lower, "testsrc") ||
		strings.Contains(lower, "synthetic")

	if isDemo {
		return []string{
			"-re",
			"-f", "lavfi",
			"-i", fmt.Sprintf("testsrc=size=%dx360:rate=%d", width, frameRate),
			"-f", "image2pipe",
			"-vcodec", "mjpeg",
			"-q:v", strconv.Itoa(quality),
			"-r", strconv.Itoa(frameRate),
			"-an",
			"-nostdin",
			"-loglevel", "error",
			"pipe:1",
		}
	}

	return []string{
		"-rtsp_transport", "tcp",
		"-timeout", "5000000",
		"-i", rtspURL,
		"-f", "image2pipe",
		"-vcodec", "mjpeg",
		"-q:v", strconv.Itoa(quality),
		"-r", strconv.Itoa(frameRate),
		"-vf", fmt.Sprintf("scale=%d:-1", width),
		"-an",
		"-nostdin",
		"-loglevel", "error",
		"pipe:1",
	}
}

// ── readFrames ────────────────────────────────────────────────────────────────

// readFrames extracts complete JPEG frames from FFmpeg stdout and sends them
// as base64 JSON over the WebSocket connection.
func (s *streamSession) readFrames(r io.Reader) {
	buf := make([]byte, 0, 1<<20) // 1 MB initial capacity
	tmp := make([]byte, 65536)    // 64 KB read chunks
	framesSent := 0

	for s.streaming.Load() {
		n, err := r.Read(tmp)
		if n > 0 {
			buf = append(buf, tmp[:n]...)

			// Extract all complete JPEG frames from buf
			for {
				soiIdx := bytes.Index(buf, jpegSOI)
				if soiIdx == -1 {
					// No SOI — keep only last 2 bytes as they might be start of next SOI
					if len(buf) > 2 {
						buf = buf[len(buf)-2:]
					}
					break
				}
				if soiIdx > 0 {
					buf = buf[soiIdx:]
				}

				eoiIdx := bytes.Index(buf[2:], jpegEOI)
				if eoiIdx == -1 {
					break // incomplete frame — wait for more data
				}
				eoiIdx += 2 // adjust for the 2-byte offset

				frame := buf[:eoiIdx+2]
				buf = buf[eoiIdx+2:]

				encoded := base64.StdEncoding.EncodeToString(frame)
				msg, _ := json.Marshal(map[string]string{
					"type": "frame",
					"data": encoded,
				})
				s.sendRaw(msg)
				framesSent++
			}
		}
		if err != nil {
			break
		}
	}

	log.Printf("Frame reader stopped stream_id=%s frames_sent=%d", s.streamID, framesSent)
}

// ── stopStream ────────────────────────────────────────────────────────────────

func (s *streamSession) stopStream() {
	s.streaming.Store(false)
	if s.cmd != nil && s.cmd.Process != nil {
		_ = s.cmd.Process.Kill()
		_ = s.cmd.Wait()
		s.cmd = nil
		log.Printf("FFmpeg stopped stream_id=%s", s.streamID)
	}
	s.removeFromActive()
}

func (s *streamSession) removeFromActive() {
	activeStreamsMu.Lock()
	delete(activeStreams, s.streamID)
	activeStreamsMu.Unlock()
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func (s *streamSession) sendStatus(status, message string) {
	msg, _ := json.Marshal(map[string]string{
		"type":    "status",
		"status":  status,
		"message": message,
	})
	s.sendRaw(msg)
}

func (s *streamSession) sendError(message string) {
	msg, _ := json.Marshal(map[string]string{
		"type":    "error",
		"message": message,
	})
	s.sendRaw(msg)
}

func (s *streamSession) sendRaw(data []byte) {
	s.writeMu.Lock()
	defer s.writeMu.Unlock()
	_ = s.conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
	_ = s.conn.WriteMessage(websocket.TextMessage, data)
}

func parseFFmpegError(text string) string {
	switch {
	case strings.Contains(text, "Connection refused"):
		return "Connection refused. The RTSP server may be offline."
	case strings.Contains(strings.ToLower(text), "timeout") ||
		strings.Contains(text, "Connection timed out"):
		return "Connection timed out. Check the RTSP URL and network."
	case strings.Contains(text, "401") || strings.Contains(text, "Unauthorized"):
		return "Authentication failed. Check the stream credentials."
	case strings.Contains(text, "404") || strings.Contains(text, "Not Found"):
		return "Stream not found. Check the RTSP URL path."
	case strings.Contains(text, "No route to host"):
		return "No route to host. The server may be unreachable."
	case strings.Contains(text, "Invalid data found"):
		return "Invalid stream data. The URL may not be a valid RTSP stream."
	default:
		return fmt.Sprintf("FFmpeg error: %s", truncate(text, 200))
	}
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}
