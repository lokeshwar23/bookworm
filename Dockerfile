# Use Red Hat UBI 9 minimal Node.js 20 image (non-root, enterprise-ready)
FROM registry.redhat.io/ubi9/nodejs-20-minimal:latest

# Run as non-root user (uid 1001 is the default in UBI node images)
USER 1001

WORKDIR /app

# Copy dependency files
COPY --chown=1001:1001 package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY --chown=1001:1001 . .

# Build the Next.js application
RUN npm run build

# Expose port 3000
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start the production server
CMD ["node", "node_modules/.bin/next", "start"]
