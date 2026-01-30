#!/bin/bash

# Manual deployment script for zkpredict2.aleo
# This saves the transaction and broadcasts it manually

echo "============================================"
echo "Manual Deployment for zkpredict2.aleo"
echo "============================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Building contract...${NC}"
leo build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo -e "${YELLOW}Step 2: Creating deployment directory...${NC}"
mkdir -p deployments

echo -e "${YELLOW}Step 3: Please run this command manually:${NC}"
echo ""
echo "  snarkos developer deploy zkpredict2.aleo \\"
echo "    --private-key APrivateKey1zkpB98A7HsGFRVintBKwNoJXVQRitHiCfsJDbVTXKAFWkR6 \\"
echo "    --query https://api.explorer.provable.com/v1 \\"
echo "    --path . \\"
echo "    --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \\"
echo "    --fee 1000000 \\"
echo "    --record \"{...fee_record...}\""
echo ""
echo -e "${YELLOW}Or try using the Aleo SDK via web interface:${NC}"
echo "https://aleo.tools"
echo ""
