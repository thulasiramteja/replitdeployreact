# Backend Dockerfile
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the backend port
EXPOSE 5000

# Run the app
CMD ["node", "server.js"]
