# 🎬 Skylark Stream Viewer (RTSP Viewer)

A high-performance, full-stack web application for viewing RTSP camera live streams directly in the browser. Built with **React + TypeScript** (frontend), **Go / Golang + Gorilla WebSockets + FFmpeg** (backend), and **MediaMTX** (RTSP Media Server).

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Go](https://img.shields.io/badge/Go-1.21-00ADD8)
![React](https://img.shields.io/badge/React-19-blue)
![MediaMTX](https://img.shields.io/badge/MediaMTX-RTSP-green)
![FFmpeg](https://img.shields.io/badge/FFmpeg-required-orange)

---

## 🌐 Live Demo & Endpoints

- **Backend Service (Render)**: `https://skylark-rtsp-viewer.onrender.com`
- **Backend Health Check**: `https://skylark-rtsp-viewer.onrender.com/health`
- **WebSocket Endpoint**: `wss://skylark-rtsp-viewer.onrender.com/ws?url=<RTSP_URL>`

## ✨ Features

- 📹 **Live RTSP Streaming** — Decodes RTSP video streams via FFmpeg and streams base64 JPEG frames over WebSockets.
- 🖥️ **Multi-Stream Grid** — View multiple RTSP streams simultaneously with customizable responsive multi-column layouts.
- ⏯️ **Stream Controls** — Play, pause, and remove individual camera feeds.
- 🔄 **Auto-Reconnect & Resilience** — Automatic reconnection with exponential backoff on network dropouts.
- 📊 **Real-time FPS Counter** — Monitor stream framerate directly on each stream card.
- 🎨 **Glassmorphism Dark UI** — Responsive, modern dark interface with smooth micro-animations and status badges.
- 📡 **MediaMTX RTSP Server Integration** — Built-in support for MediaMTX test RTSP streams.

---

## 🏗️ Architecture & Technology Stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  Browser (React + TypeScript)               │
   │  Renders JPEG frames via HTML5 Canvas (Off-thread Decode)  │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ WebSocket (JSON / base64 JPEG)
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                       Go Backend Server                     │
   │             (Gorilla Mux + Gorilla WebSockets)              │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Exec / Stderr Pipe
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                      FFmpeg Subprocess                      │
   │       Decodes RTSP stream to stdout JPEG image stream       │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ RTSP Protocol
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                   MediaMTX RTSP Stream Server               │
   │                  (rtsp://mediamtx:8554/live/stream)         │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Docker Compose)

The fastest way to spin up the full stack (MediaMTX server, test stream generator, Go backend, and React TS frontend):

```bash
# Clone repository
git clone https://github.com/mayank123hangsh00/Skylark-RTSP-Viewer.git
cd Skylark-RTSP-Viewer

# Start all services with Docker Compose
docker-compose up --build
```

- **Frontend Application**: `http://localhost:5173`
- **Go Backend API & WebSocket**: `http://localhost:8000`
- **MediaMTX RTSP Server**: `rtsp://localhost:8554/live/stream`

---

## 🛠️ Local Development (Manual Setup)

### Prerequisites

- **Go 1.21+**
- **Node.js 18+** & **npm**
- **FFmpeg** installed and added to system PATH
- **MediaMTX** (optional, for hosting local RTSP streams)

### 1. Backend Setup (Go)

```bash
cd backend

# Install dependencies
go mod tidy

# Run the Go server
go run main.go
```

The server starts on `http://localhost:8000`.

### 2. Frontend Setup (React + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend application runs on `http://localhost:5173`.

---

## 🧪 Testing RTSP Streams

You can test streaming in two ways:

1. **Local MediaMTX Test Stream (via Docker)**:
   - RTSP URL: `rtsp://localhost:8554/live/stream`
   - Click **"Use Demo Stream"** in the web interface to automatically fill in the test stream URL.

2. **Public RTSP Cameras**:
   - Enter any public or RTSP camera URL starting with `rtsp://` or `rtsps://`.

---

## 📁 Repository Structure

```
Skylark/
├── backend/                    # Go Backend Service
├── backend/main.go             # Application entry point & router setup
├── backend/handlers/           # REST API & WebSocket HTTP handlers
├── backend/models/             # Stream data models
├── backend/store/              # Thread-safe in-memory stream store
├── backend/go.mod              # Go module definition
├── backend/Dockerfile          # Multi-stage Alpine Go + FFmpeg build
│
├── frontend/                   # React + TypeScript Frontend
├── frontend/src/App.tsx        # Main application component
├── frontend/src/types/stream.ts# TypeScript type definitions
├── frontend/src/hooks/         # Custom React hooks (WebSocket stream reader)
├── frontend/src/components/    # React TypeScript UI components
├── frontend/tsconfig.json      # TypeScript compiler options
├── frontend/Dockerfile          # Multi-stage Node + Nginx build
│
├── mediamtx.yml                # MediaMTX RTSP Server configuration
├── docker-compose.yml          # Docker composition (MediaMTX, Generator, Go, React)
└── README.md                   # Project documentation
```

---

## 🌐 Deployment Instructions

### Frontend (Vercel / Netlify)
1. Import `frontend/` directory.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set Environment Variables:
   - `VITE_API_URL` = `https://your-backend.up.railway.app`
   - `VITE_WS_URL` = `wss://your-backend.up.railway.app`

### Backend (Railway / Render / Fly.io)
1. Deploy using the included `backend/Dockerfile` (which includes Alpine + FFmpeg + compiled Go binary).
2. Set Port: `8000`

---

## 📄 License

MIT License. Built for Skylark Labs Full-Stack Engineer Coding Test.
