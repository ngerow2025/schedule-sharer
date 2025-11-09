# syntax=docker/dockerfile:1

FROM golang:1.25-alpine AS dev

WORKDIR /app

# Install Air for live reloading of go code
RUN apk add --no-cache git curl bash
RUN go install github.com/air-verse/air@latest

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Expose the port your Go app listens on
EXPOSE 8080
# Start Air for live reloading
CMD ["air", "-c", ".air.toml"]