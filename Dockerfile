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

# Copy only the package.json and package-lock.json first to install dependencies
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for backend
WORKDIR /app/backend
RUN npm install

# Install dependencies and build the frontend
WORKDIR /app/frontend
RUN npm install \
    && npm run build

# Copy all project files to the working directory (including public directory)
COPY . .

# Copy the .env file into the container
COPY .env .env

# Set up the backend to serve the application
WORKDIR /app/backend

# Expose the required ports
EXPOSE 3000
EXPOSE 5000

# Start the backend server (assuming the backend serves the frontend)
CMD ["npm", "start"]
