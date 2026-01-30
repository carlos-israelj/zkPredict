#!/bin/bash

# Deployment script for zkpredict2.aleo to testnet
# This deploys the NEW program ID to avoid wallet caching issues

echo "============================================"
echo "Deploying zkpredict2.aleo to Aleo Testnet"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Network: testnet${NC}"
echo -e "${BLUE}Program: zkpredict2.aleo${NC}"
echo -e "${YELLOW}New program ID to avoid wallet adapter caching issues${NC}"
echo ""

echo -e "${YELLOW}Building contract...${NC}"
leo build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
    echo ""
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying to testnet...${NC}"
echo -e "${YELLOW}(This will prompt for confirmation)${NC}"
echo ""
echo -e "${BLUE}Expected cost: ~16 credits${NC}"
echo ""

leo deploy --network testnet

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Program deployed: zkpredict2.aleo${NC}"
    echo -e "${BLUE}Network: testnet${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Wait for Vercel to deploy the frontend updates (2-3 minutes)"
    echo "2. Test the complete flow on https://zkpredict.lat"
    echo "3. Create a market, place bets, resolve, and claim winnings"
    echo "4. The wallet adapter should now recognize the new contract properly"
    echo ""
    echo -e "${GREEN}The new program ID (zkpredict2.aleo) will avoid caching issues!${NC}"
else
    echo ""
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi
