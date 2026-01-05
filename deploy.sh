#!/bin/bash
set -e

# Confirm export was run
read -p "Have you run 'npm run export'? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please run 'npm run export' first."
    exit 1
fi

# Store the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Create a temporary directory
TEMP_DIR=$(mktemp -d)

# Copy out/ contents to temp directory
echo "Copying build output..."
cp -r out/. "$TEMP_DIR/"

# Switch to gh-pages branch (create if doesn't exist)
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
else
    git checkout --orphan gh-pages
    git rm -rf .
fi

# Remove all existing files (except .git)
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

# Copy new content from temp directory
cp -r "$TEMP_DIR"/* .

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Add and commit
git add -A
git commit -m "Deploy site" || echo "No changes to commit"

# Push to remote
git push origin gh-pages --force

# Switch back to original branch
git checkout "$CURRENT_BRANCH"

echo "Deployed successfully!"
