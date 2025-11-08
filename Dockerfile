# ============================
# 1️⃣ Frontend build stage
# ============================
FROM docker.io/node:22 AS frontend-build

WORKDIR /frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm i -g pnpm
RUN pnpm install

COPY frontend/ ./
RUN pnpm run build

# The build will output files into /backend/dist
# just make sure to copy them from there in the next stage.


# ============================
# 2️⃣ Backend build stage
# ============================
FROM docker.io/golang:1.25.4 AS backend-build

WORKDIR /backend
COPY backend/go.* ./
RUN go mod download

# Copy the Go source
COPY backend/ ./

# Copy the frontend build output into backend/dist
COPY --from=frontend-build /backend/dist ./dist

# Build the Go server
RUN go build -o server .


# ============================
# 3️⃣ Final minimal runtime image
# ============================
FROM gcr.io/distroless/base-debian12

WORKDIR /app
COPY --from=backend-build /backend/server .

# Port your Go app listens on (change if needed)
EXPOSE 8080

# Run the server
ENTRYPOINT ["./server"]
