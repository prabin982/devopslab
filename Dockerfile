# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd backend && npm install

# Copy all source code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "backend/server.js"]
