#!/bin/bash

# Deploy zkpredict2.aleo using snarkos developer deploy
# Based on official Aleo documentation

echo "============================================"
echo "Deploy zkpredict2.aleo with snarkOS"
echo "============================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Your wallet details
PRIVATEKEY="APrivateKey1zkpB98A7HsGFRVintBKwNoJXVQRitHiCfsJDbVTXKAFWkR6"
VIEWKEY="AViewKey1mSnpFFC8Mj4fXbK5YiWgZ3mjiV8CxA79bYNa8ymUpTrw"
ADDRESS="aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war"

echo -e "${BLUE}Address: $ADDRESS${NC}"
echo ""

echo -e "${YELLOW}Step 1: Building the program...${NC}"
leo build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo -e "${YELLOW}Step 2: Choose deployment method...${NC}"
echo ""
echo -e "${BLUE}You have 16.29 credits in public balance${NC}"
echo ""
echo -e "${YELLOW}Option 1: Deploy without record (uses public balance - RECOMMENDED)${NC}"
echo -e "${YELLOW}Option 2: Deploy with fee record (requires record from transaction)${NC}"
echo ""
echo -e "${BLUE}Choose option (1 or 2):${NC}"
read -r OPTION

if [ "$OPTION" = "1" ]; then
    echo ""
    echo -e "${YELLOW}Step 3: Deploying zkpredict2.aleo (using public balance)...${NC}"
    echo -e "${BLUE}This will cost approximately 6.9 credits${NC}"
    echo ""

    snarkos developer deploy "zkpredict2.aleo" \
        --private-key "$PRIVATEKEY" \
        --query "https://api.explorer.provable.com/v1" \
        --path "./build/" \
        --broadcast "https://api.explorer.provable.com/v1/testnet3/transaction/broadcast" \
        --fee 7000000 \
        --priority-fee 0

elif [ "$OPTION" = "2" ]; then
    echo ""
    echo -e "${YELLOW}Getting a fee record...${NC}"
    echo ""
    echo -e "${BLUE}Option A: Use aleo.tools${NC}"
    echo "1. Go to https://aleo.tools/"
    echo "2. Enter your Private Key and View Key"
    echo "3. Look for a record with at least 7 credits"
    echo "4. Copy the FULL record (starting with 'record1...')"
    echo ""
    echo -e "${BLUE}Option B: Get from faucet transaction${NC}"
    echo "If you have a faucet TX with record output, get the transaction ID and run:"
    echo "  CIPHERTEXT=\$(curl -s https://api.provable.com/v2/testnet/transaction/YOUR_TX_ID | jq -r '.execution.transitions[0].outputs[] | select(.type==\"record\") | .value')"
    echo "  RECORD=\$(snarkos developer decrypt --ciphertext \$CIPHERTEXT --view-key $VIEWKEY)"
    echo "  echo \$RECORD"
    echo ""
    echo -e "${YELLOW}Enter your fee RECORD:${NC}"
    read -r RECORD

    if [ -z "$RECORD" ]; then
        echo -e "${RED}No record provided. Exiting.${NC}"
        exit 1
    fi

    echo ""
    echo -e "${YELLOW}Step 3: Deploying zkpredict2.aleo (using fee record)...${NC}"
    echo -e "${BLUE}This will cost approximately 6.9 credits${NC}"
    echo ""

    snarkos developer deploy "zkpredict2.aleo" \
        --private-key "$PRIVATEKEY" \
        --query "https://api.explorer.provable.com/v1" \
        --path "./build/" \
        --broadcast "https://api.explorer.provable.com/v1/testnet3/transaction/broadcast" \
        --fee 7000000 \
        --record "$RECORD"
else
    echo -e "${RED}Invalid option. Exiting.${NC}"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Verify at: https://testnet.explorer.provable.com/program/zkpredict2.aleo${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Deployment failed${NC}"
    echo "Check the error message above"
    exit 1
fi
