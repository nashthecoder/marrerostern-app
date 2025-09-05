#!/bin/bash

# Pull Local Changes Script (Bash version)
# This script helps pull and sync the latest changes from local development.
# Usage: ./scripts/pull-local.sh

set -e

echo "🔄 Starting local pull and sync process..."
echo ""

# Check if we're in a git repository
echo "📋 Checking git repository status..."
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Working directory has uncommitted changes:"
    git status --porcelain
    echo "Please commit or stash changes before pulling."
    echo ""
    exit 1
fi

# Fetch latest changes from remote
echo "📡 Fetching latest changes from remote..."
git fetch origin

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current branch: $CURRENT_BRANCH"

# Pull latest changes
echo "⬇️  Pulling latest changes..."
if git pull origin "$CURRENT_BRANCH"; then
    echo "✅ Successfully pulled changes"
else
    echo "ℹ️  No changes to pull or already up to date"
fi

# Install/update dependencies if needed
echo "📦 Checking for dependency updates..."
if [[ -f package-lock.json ]] && [[ -d node_modules ]]; then
    if [[ package-lock.json -nt node_modules ]]; then
        echo "🔧 Installing updated dependencies..."
        npm install
    else
        echo "✅ Dependencies are up to date"
    fi
fi

# Build the project to ensure everything works
echo "🏗️  Building project to verify changes..."
npm run build

echo ""
echo "✅ Local pull and sync completed successfully!"
echo "🚀 Run 'npm run dev' to start development server"