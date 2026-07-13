FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package.json to leverage Docker caching
COPY pnpm-lock.yaml package.json ./

# Set pnpm home directory and store path for better caching behavior
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Fetch dependencies into the virtual store based only on the lockfile
RUN pnpm fetch --prod

# Copy the rest of the files (including package.json again if needed, though already copied)
COPY . .

# Install dependencies from the virtual store (offline mode, production only)
RUN pnpm install --frozen-lockfile --prod --offline

# Expose the port your Express app listens on
EXPOSE 3000

# Start the Express server
CMD ["pnpm", "run", "serve"]