# Stage 1: Build
FROM node:22-alpine AS builder

# Build tools needed for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# Capture git version before .git is discarded in runtime stage
RUN TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo ""); \
    COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo ""); \
    echo "{\"tag\":\"$TAG\",\"commit\":\"$COMMIT\"}" > server/version.json

# Install & compile server deps (including better-sqlite3)
RUN cd server && npm ci --omit=dev --legacy-peer-deps

# Stage 2: Runtime
FROM node:22-alpine

RUN apk add --no-cache nginx

WORKDIR /app

# Angular static files
COPY --from=builder /app/dist/wahl-o-mat/browser /usr/share/nginx/html

# Nginx config
COPY nginx/site.conf /etc/nginx/http.d/default.conf

# Server (with compiled native deps from builder)
COPY server/ /app/server/
COPY --from=builder /app/server/version.json /app/server/version.json
COPY --from=builder /app/server/node_modules /app/server/node_modules

# Writable data directory for SQLite
RUN mkdir -p /app/data

# Startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

ENV DB_PATH=/app/data/config.sqlite

EXPOSE 80

CMD ["/start.sh"]
