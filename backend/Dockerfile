# ── Build stage ───────────────────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Download dependencies first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source and compile a static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o skylark-server .

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM alpine:3.19

# Install FFmpeg (required for RTSP processing)
RUN apk add --no-cache ffmpeg ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/skylark-server .

EXPOSE 8000

CMD ["./skylark-server"]
