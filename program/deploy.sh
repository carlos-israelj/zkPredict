#!/bin/bash

# Deployment script for zkPredict to testnet
# Run this manually from your terminal: bash deploy.sh

echo "============================================"
echo "Deploying zkPredict to Aleo Testnet"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Network: testnet${NC}"
echo -e "${BLUE}Program: zkpredict.aleo${NC}"
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

leo deploy --network testnet

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Program deployed: zkpredict.aleo${NC}"
    echo -e "${BLUE}Network: testnet${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Test the contract with the frontend"
    echo "2. Create a market, place bets, resolve, and claim winnings"
    echo "3. Verify the bet_id flow works end-to-end"
else
    echo ""
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi
