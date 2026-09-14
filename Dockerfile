# Multi-stage production build for phanda web on Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies with legacy peer deps for container build
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy full source
COPY . .

# Build static web export
ENV NODE_ENV=production
RUN npm run build
RUN npx expo export --platform web

# Production static server stage
FROM nginx:alpine

# Custom nginx configuration for SPA routing
RUN cat <<'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }
}
EOF

# Copy exported static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
