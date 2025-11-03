FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the entire server directory
COPY server/ ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Health check (optional but recommended for Cloud Run)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if(r.statusCode !== 200) process.exit(1)})"

# Start the application
CMD ["node", "index.js"]
