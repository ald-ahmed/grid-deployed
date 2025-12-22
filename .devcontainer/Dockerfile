FROM node:22-alpine

# Install essential runtime tools and Playwright dependencies
RUN apk add --no-cache \
    bash \
    git \
    rsync \
    sudo \
    shadow \
    openssh-client \
    # Playwright browser dependencies for Alpine
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    # Additional libs that might be needed
    libc6-compat \
    libstdc++ \
    && rm -rf /var/cache/apk/*

# The node user already exists in node:22-alpine, just add sudo
RUN echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install yarn globally to avoid Corepack download messages
RUN npm install -g corepack

# Create workspace directory structure
RUN mkdir -p /workspaces/grid/backend /workspaces/grid/frontend /workspaces/grid/test-harness \
    && chown -R node:node /workspaces

# Always use 'grid' as the build workspace to ensure consistency between prebuild and runtime  
WORKDIR /workspaces/grid

# Copy package files for dependency installation  
COPY package.json .yarnrc.yml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY test-harness/package.json ./test-harness/

# Install dependencies with build tools, then clean up
RUN apk add --no-cache --virtual .build-deps \
        python3 \
        make \
        g++ && \
    yarn install && \
    yarn cache clean && \
    rm -rf /usr/local/share/.cache/yarn/* && \
    rm -rf /tmp/* && \
    apk del .build-deps && \
    chown -R node:node /workspaces/grid

# Switch to node user for runtime
USER node

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
