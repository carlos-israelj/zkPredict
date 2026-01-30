#!/bin/bash

# Test script for Wave 5 claim_winnings with bet_id
# This tests the new claim_winnings functionality

echo "============================================"
echo "Testing zkPredict Wave 5: claim_winnings with bet_id"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test parameters
MARKET_ID="1769800000000field"
END_TIME="1900000000u32"  # Future timestamp
NUM_OUTCOMES="2u8"
CATEGORY="2u8"  # Crypto
AUTO_RESOLVE="false"
BET_AMOUNT="1000000u64"  # 1 credit
NONCE="123456789field"
WINNING_OUTCOME="1u8"  # YES wins
CURRENT_TIME="1769900000u32"

echo "${YELLOW}Step 1: Create Market${NC}"
echo "leo run create_market $MARKET_ID $END_TIME $NUM_OUTCOMES $CATEGORY $AUTO_RESOLVE"
leo run create_market $MARKET_ID $END_TIME $NUM_OUTCOMES $CATEGORY $AUTO_RESOLVE
if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Market created successfully${NC}"
else
    echo "${RED}✗ Failed to create market${NC}"
    exit 1
fi
echo ""

echo "${YELLOW}Step 2: Place Bet (Outcome YES = 1u8)${NC}"
echo "leo run place_bet $MARKET_ID $WINNING_OUTCOME $BET_AMOUNT $NONCE"
leo run place_bet $MARKET_ID $WINNING_OUTCOME $BET_AMOUNT $NONCE > bet_output.txt 2>&1
if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Bet placed successfully${NC}"
    echo ""
    echo "Bet output:"
    cat bet_output.txt
    echo ""
else
    echo "${RED}✗ Failed to place bet${NC}"
    cat bet_output.txt
    exit 1
fi
echo ""

echo "${YELLOW}Step 3: Resolve Market (Winner: YES = 1u8)${NC}"
echo "leo run resolve_market $MARKET_ID $WINNING_OUTCOME $CURRENT_TIME"
leo run resolve_market $MARKET_ID $WINNING_OUTCOME $CURRENT_TIME
if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Market resolved successfully${NC}"
else
    echo "${RED}✗ Failed to resolve market${NC}"
    exit 1
fi
echo ""

echo "${YELLOW}Step 4: Claim Winnings (using bet_id = nonce)${NC}"
echo "leo run claim_winnings $NONCE"
leo run claim_winnings $NONCE
if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Winnings claimed successfully!${NC}"
    echo ""
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo "${RED}✗ Failed to claim winnings${NC}"
    exit 1
fi
echo ""

# Cleanup
rm -f bet_output.txt

echo ""
echo "${YELLOW}Summary:${NC}"
echo "1. Created market with ID: $MARKET_ID"
echo "2. Placed bet on outcome YES (1u8) with bet_id: $NONCE"
echo "3. Resolved market with winner: YES (1u8)"
echo "4. Claimed winnings using bet_id: $NONCE"
echo ""
echo "${GREEN}The new claim_winnings(bet_id: field) function works correctly!${NC}"
