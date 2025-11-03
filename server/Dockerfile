# Use lightweight Node.js
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your backend source code
COPY . .

# Set environment variables
ENV PORT=8080

# Expose Cloud Run port
EXPOSE 8080

# Start your app
CMD ["node", "index.js"]
