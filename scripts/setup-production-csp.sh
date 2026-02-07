#!/bin/bash

# Setup Production CSP
# Builds frontend and copies to static directory for CSP to work

set -e

echo "🔒 Setting up Production CSP"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Build frontend
echo "1️⃣  Building frontend..."
cd frontend
if npm run build; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..

# Step 2: Create static directory if it doesn't exist
echo ""
echo "2️⃣  Preparing static directory..."
if [ ! -d "static" ]; then
    mkdir -p static
    echo -e "${YELLOW}⚠️  Created static/ directory${NC}"
fi

# Step 3: Copy build to static
echo ""
echo "3️⃣  Copying build to static directory..."
if [ -d "frontend/dist" ]; then
    cp -r frontend/dist/* static/
    echo -e "${GREEN}✅ Build copied to static/${NC}"
    
    # Verify index.html exists
    if [ -f "static/index.html" ]; then
        echo -e "${GREEN}✅ Verified: static/index.html exists${NC}"
    else
        echo -e "${RED}❌ ERROR: static/index.html not found after copy${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ ERROR: frontend/dist/ directory not found${NC}"
    exit 1
fi

# Step 4: Summary
echo ""
echo "📊 Summary"
echo "=========="
echo -e "${GREEN}✅ Production CSP setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start backend: make api"
echo "  2. Check logs for: '✅ CSP: Production mode detected'"
echo "  3. Verify CSP header:"
echo "     curl -sIL http://localhost:8007/ | grep -i content-security-policy"
echo ""

