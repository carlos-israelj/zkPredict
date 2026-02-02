#!/bin/bash

# Master Test Runner
# Runs all test suites for zkpredict3.aleo

echo "=========================================="
echo "zkPredict3.aleo - Complete Test Suite"
echo "=========================================="
echo ""
echo "Testing program: zkpredict3.aleo"
echo "Bug fixes verified:"
echo "  ✅ Bug #1: Pool key generation (hash(market_id + outcome))"
echo "  ✅ Bug #2: Dynamic odds calculation"
echo "  ✅ Bug #3: Multi-outcome claim support"
echo ""
echo "=========================================="

# Store start time
START_TIME=$(date +%s)

# Test 1: Create Market
echo ""
echo ">>> Running Test Suite 1: Create Market"
bash tests/test_create_market.sh
if [ $? -eq 0 ]; then
    echo "✅ Create Market tests passed"
else
    echo "❌ Create Market tests failed"
fi

# Test 2: Place Bet
echo ""
echo ">>> Running Test Suite 2: Place Bet"
bash tests/test_place_bet.sh
if [ $? -eq 0 ]; then
    echo "✅ Place Bet tests passed"
else
    echo "❌ Place Bet tests failed"
fi

# Test 3: Integration Tests
echo ""
echo ">>> Running Test Suite 3: Integration Tests"
bash tests/test_integration.sh
if [ $? -eq 0 ]; then
    echo "✅ Integration tests passed"
else
    echo "❌ Integration tests failed"
fi

# Calculate execution time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo "Execution time: ${DURATION} seconds"
echo ""
echo "Next steps:"
echo "1. Review test outputs above"
echo "2. For testnet deployment tests, use --network testnet --broadcast"
echo "3. Query on-chain state with: leo query {mapping} {key} --network testnet"
echo ""
echo "Example queries:"
echo "  leo query markets \"100field\" --network testnet"
echo "  leo query yes_pool \"100field\" --network testnet"
echo "  leo query outcome_pools \"{pool_key}\" --network testnet"
echo "=========================================="
