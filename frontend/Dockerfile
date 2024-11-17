# Use Node.js slim image for development
FROM node:22-slim AS development

# Set working directory inside the container
WORKDIR /usr/src/app/banh-mi-i18n/frontend

# Copy package files and install dependencies
COPY package*.json ./
RUN npm config set strict-ssl false && npm ci

# Copy the rest of the source code
COPY . .

# Expose the application port for development
EXPOSE 5173

# Run the dev server using Vite for Svelte, bind it to 0.0.0.0 to make it accessible from outside the container
CMD ["npx", "vite", "dev", "--port", "5173", "--host", "0.0.0.0"]
