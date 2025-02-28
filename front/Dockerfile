# Use the official Node.js 18 Alpine image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Install dependencies in a single step to leverage Docker caching
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the entire application
COPY . .

# Build the Next.js application
RUN npm run build

# ---- Production Image ----
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000 (default for Next.js)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]