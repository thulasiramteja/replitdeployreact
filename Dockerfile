# Use a base image compatible with Railway's environment
FROM ubuntu:22.04

# Set working directory
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

# Copy all project files to the working directory
COPY . .

# Install dependencies for backend
WORKDIR /app/backend
RUN npm install

# Install dependencies and build the frontend
WORKDIR /app/frontend
RUN npm install \
    && npm run build

# Set up the backend to serve the application
WORKDIR /app/backend
ENV PORT=3000
CMD ["npm", "start"]
