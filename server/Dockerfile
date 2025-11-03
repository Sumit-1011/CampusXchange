# Use lightweight Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /server

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of your source code
COPY . .

# Set environment variables
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
