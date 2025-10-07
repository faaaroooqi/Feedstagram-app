FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose app port
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
