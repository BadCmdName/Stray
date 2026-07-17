FROM oven/bun:1.0-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json index.ts ./
RUN bun install
RUN bun run build

FROM alpine:3.18
RUN apk add --no-cache libstdc++ gcompat
WORKDIR /app
COPY --from=builder /app/dist/stray-skeletal /app/stray-skeletal
CMD ["./stray-skeletal"]
