FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy project files
COPY . .

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose necessary ports (if required by the app)
EXPOSE 4000

# Set entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
