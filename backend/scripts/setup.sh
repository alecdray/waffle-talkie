#!/bin/bash

set -e

echo "Setting up Waffle Talkie backend..."
echo ""

# Create .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
else
    echo "⚠ .env already exists, skipping..."
fi

# Create directories
mkdir -p tmp/audio
echo "✓ Created tmp/audio directory"

# Install dependencies
echo "Installing Go dependencies..."
go mod download
echo "✓ Dependencies installed"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your settings (especially JWT_SECRET for production)"
echo "  2. Run 'make run' to start the server"
