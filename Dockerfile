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

# Copy the backend and frontend package files first to install dependencies
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install \
    && npm run build

# Copy the rest of the project files into the container
WORKDIR /app
COPY . .

# Set up environment variables (adjust based on your requirements)
ENV NODE_ENV=production
ENV PORT=3000

# Expose necessary ports
EXPOSE 3000 5000

# Start the backend server (adjust if the backend serves the frontend build)
WORKDIR /app/backend
CMD ["node", "server.js"]
