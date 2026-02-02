#!/bin/bash

# Test Suite: Create Market
# Tests various market creation scenarios

echo "=================================="
echo "Test Suite: Create Market"
echo "=================================="

# Test 1: Create binary market (2 outcomes)
echo ""
echo "Test 1: Create binary market (Sports, 2 outcomes)"
leo execute create_market "100field" "1740000000u32" "2u8" "0u8" "false"

# Test 2: Create multi-outcome market (4 outcomes)
echo ""
echo "Test 2: Create multi-outcome market (Politics, 4 outcomes)"
leo execute create_market "200field" "1750000000u32" "4u8" "1u8" "true"

# Test 3: Create crypto market with auto-resolve
echo ""
echo "Test 3: Create crypto market with auto-resolve"
leo execute create_market "300field" "1735689599u32" "2u8" "2u8" "true"

# Test 4: Create weather market (3 outcomes)
echo ""
echo "Test 4: Create weather market (3 outcomes)"
leo execute create_market "400field" "1745000000u32" "3u8" "3u8" "false"

# Test 5: Create max outcomes market (255)
echo ""
echo "Test 5: Create max outcomes market (255)"
leo execute create_market "500field" "1760000000u32" "255u8" "4u8" "false"

echo ""
echo "=================================="
echo "Create Market Tests Complete"
echo "=================================="
