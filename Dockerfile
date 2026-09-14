# Multi-stage production build for phanda web on Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native addons if needed
RUN apk add --no-cache python3 make g++

# Install dependencies using legacy peer deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy full source
COPY . .

# Accept build arguments from Railway environment
ARG EXPO_PUBLIC_API_BASE_URL=https://iphande-production.up.railway.app
ARG EXPO_PUBLIC_DEPLOYMENT_MODE=pilot
ARG EXPO_PUBLIC_SUPABASE_URL=https://igylucodtqosgngsoozg.supabase.co
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneWx1Y29kdHFvc2duZ3Nvb3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODMzNDAsImV4cCI6MjEwNDg1OTM0MH0.eu5cLfxRs_p0ivOU1NO8lf7_t62K2DWRnFSTEuDdNcQ

ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL \
    EXPO_PUBLIC_DEPLOYMENT_MODE=$EXPO_PUBLIC_DEPLOYMENT_MODE \
    EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL \
    EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY \
    NODE_ENV=production

# Validate types and architecture
RUN npm run build

# Export static web bundle
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
