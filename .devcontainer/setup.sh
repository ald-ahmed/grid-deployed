#!/bin/bash
set -e

echo "Starting development environment setup..."

# Enable corepack and prepare yarn
echo "Enabling corepack..."
corepack enable

echo "Preparing yarn..."
corepack prepare yarn@4.0.2 --activate

# Only run seeding if we're not in the grid workspace
if [ "$(basename "$PWD")" != "grid" ]; then
    echo "Seeding node_modules from /workspaces/grid..."
    
    # Fix permissions
    sudo chown -R node:node /workspaces/grid 2>/dev/null || true
    
    # Ensure directories exist
    mkdir -p ./node_modules ./backend/node_modules ./frontend/node_modules ./test-harness/node_modules
    
    # Copy node_modules using rsync for better performance
    if [ -d "/workspaces/grid/node_modules" ]; then
        echo "  Copying root node_modules..."
        rsync -a /workspaces/grid/node_modules/ ./node_modules/
    fi
    
    if [ -d "/workspaces/grid/backend/node_modules" ]; then
        echo "  Copying backend node_modules..."
        rsync -a /workspaces/grid/backend/node_modules/ ./backend/node_modules/
    fi
    
    if [ -d "/workspaces/grid/frontend/node_modules" ]; then
        echo "  Copying frontend node_modules..."
        rsync -a /workspaces/grid/frontend/node_modules/ ./frontend/node_modules/
    fi
    
    if [ -d "/workspaces/grid/test-harness/node_modules" ]; then
        echo "  Copying test-harness node_modules..."
        rsync -a /workspaces/grid/test-harness/node_modules/ ./test-harness/node_modules/
    fi
fi

echo "Running seed..."
yarn seed

echo "Starting application..."
yarn start