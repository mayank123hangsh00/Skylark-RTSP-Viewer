# ── Build stage ───────────────────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy module file and source
COPY go.mod ./
COPY . .

# Download dependencies and generate go.sum inside docker
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o skylark-server .

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM alpine:3.19

# Install FFmpeg (required for RTSP processing)
RUN apk add --no-cache ffmpeg ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/skylark-server .

EXPOSE 8000

CMD ["./skylark-server"]
