#!/bin/bash

# CookieToWindow Extension - Distribution Builder
# This script creates a distribution-ready ZIP file

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  CookieToWindow Extension - Build Distribution${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Get version from manifest.json
VERSION=$(grep -o '"version": *"[^"]*"' manifest.json | grep -o '[0-9.]*')
echo -e "${GREEN}Version:${NC} $VERSION"

# Create dist directory if it doesn't exist
DIST_DIR="dist"
if [ ! -d "$DIST_DIR" ]; then
    mkdir -p "$DIST_DIR"
    echo -e "${GREEN}Created${NC} $DIST_DIR/ directory"
fi

# Set output filename
OUTPUT_FILE="$DIST_DIR/CookieToWindow-v${VERSION}.zip"

# Remove old zip if exists
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo -e "${YELLOW}Removed${NC} old $OUTPUT_FILE"
fi

echo ""
echo -e "${BLUE}Packaging files...${NC}"

# Create the ZIP file with only necessary files
zip -q "$OUTPUT_FILE" \
    manifest.json \
    background.js \
    content.js \
    popup.html \
    popup.css \
    popup.js \
    icons/icon16.png \
    icons/icon48.png \
    icons/icon128.png \
    README.md \
    LICENSE

echo -e "${GREEN}✓${NC} manifest.json"
echo -e "${GREEN}✓${NC} background.js"
echo -e "${GREEN}✓${NC} content.js"
echo -e "${GREEN}✓${NC} popup.html"
echo -e "${GREEN}✓${NC} popup.css"
echo -e "${GREEN}✓${NC} popup.js"
echo -e "${GREEN}✓${NC} icons/ (3 PNG files)"
echo -e "${GREEN}✓${NC} README.md"
echo -e "${GREEN}✓${NC} LICENSE"

# Get file size
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
else
    # Linux
    SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✓ Distribution package created successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "  File: ${GREEN}$OUTPUT_FILE${NC}"
echo -e "  Size: ${GREEN}$SIZE${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Test the package by extracting and loading in Chrome"
echo -e "  2. Share $OUTPUT_FILE with recipients"
echo -e "  3. Recipients should follow README.md for installation"
echo ""

