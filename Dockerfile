# Use a base image with Ubuntu
FROM ghcr.io/railwayapp/nixpacks:ubuntu-1731369831

# Set the working directory
WORKDIR /app/

# Copy all files to the container
COPY . /app/.

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl \
  && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get install -y nodejs \
  && npm install -g npm@latest

# Install frontend dependencies and build
RUN cd frontend && npm install && npm run build

# Install backend dependencies
RUN cd backend && npm install

# Expose the application port
EXPOSE 3000

# Start the backend server
CMD ["npm", "start", "--prefix", "backend"]
