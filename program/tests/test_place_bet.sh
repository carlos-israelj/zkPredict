#!/bin/bash

# Test Suite: Place Bet
# Tests bet placement with various scenarios

echo "=================================="
echo "Test Suite: Place Bet"
echo "=================================="

# Test 1: Place bet on binary market (YES)
echo ""
echo "Test 1: Place bet on binary market (YES - outcome 1)"
leo execute place_bet "100field" "1u8" "1000000u64" "123field"

# Test 2: Place bet on binary market (NO)
echo ""
echo "Test 2: Place bet on binary market (NO - outcome 0)"
leo execute place_bet "100field" "0u8" "2000000u64" "456field"

# Test 3: Place bet on multi-outcome market (outcome 0)
echo ""
echo "Test 3: Place bet on multi-outcome market (outcome 0)"
leo execute place_bet "200field" "0u8" "5000000u64" "789field"

# Test 4: Place bet on multi-outcome market (outcome 2)
echo ""
echo "Test 4: Place bet on multi-outcome market (outcome 2)"
leo execute place_bet "200field" "2u8" "3000000u64" "101112field"

# Test 5: Place small bet
echo ""
echo "Test 5: Place small bet (minimum amount)"
leo execute place_bet "100field" "1u8" "1u64" "131415field"

# Test 6: Place large bet
echo ""
echo "Test 6: Place large bet (100 credits)"
leo execute place_bet "300field" "1u8" "100000000u64" "161718field"

# Test 7: Place multiple bets with different nonces
echo ""
echo "Test 7a: First bet with nonce 111"
leo execute place_bet "100field" "1u8" "1000000u64" "111field"

echo ""
echo "Test 7b: Second bet with nonce 222 (should have different bet_id)"
leo execute place_bet "100field" "1u8" "1000000u64" "222field"

# Test 8: Verify dynamic odds (Bug #2 fix)
echo ""
echo "Test 8a: First bet on new market (better odds)"
leo execute place_bet "500field" "1u8" "1000000u64" "500500field"

echo ""
echo "Test 8b: Second bet on same market (odds should change)"
leo execute place_bet "500field" "1u8" "1000000u64" "500501field"

echo ""
echo "=================================="
echo "Place Bet Tests Complete"
echo "=================================="
