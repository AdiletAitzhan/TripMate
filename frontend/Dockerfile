FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev"]
