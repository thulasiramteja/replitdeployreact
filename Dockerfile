# Use a base image compatible with Railway's environment
FROM ubuntu:22.04

# Set working directory for the app
WORKDIR /app

# Install necessary tools and Node.js 20
RUN apt-get update \
    && apt-get install -y curl gnupg build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable to fix OpenSSL error in Node.js 20
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Copy backend and frontend dependency files first for caching
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy the rest of the backend and frontend project files
WORKDIR /app
COPY backend ./backend/
COPY frontend ./frontend/

# Ensure the .env file is copied to the appropriate location
COPY .env ./backend/

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose necessary ports
EXPOSE 3000 5000

# Start the backend server
WORKDIR /app/backend
CMD ["node", "server.js"]
