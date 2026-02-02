# zkPredict Test Suite

This document describes the test suite for zkpredict3.aleo smart contract.

## Test Structure

Since Leo doesn't support inline `@test` annotations in the traditional way, we use manual testing scripts to verify contract functionality.

## Test Categories

### 1. Create Market Tests (`test_create_market.sh`)
Tests market creation with various configurations:
- Binary markets (2 outcomes)
- Multi-outcome markets (3-255 outcomes)
- Different categories (Sports, Politics, Crypto, Weather, Other)
- Auto-resolve enabled/disabled

### 2. Place Bet Tests (`test_place_bet.sh`)
Tests bet placement:
- Bets on binary markets (YES/NO)
- Bets on multi-outcome markets (outcomes 0-N)
- Different bet amounts (small, medium, large)
- Multiple bets with different nonces
- Dynamic odds calculation verification

### 3. Resolve Market Tests (`test_resolve_market.sh`)
Tests market resolution:
- Creator resolution before end_time
- Auto-resolution after end_time
- Resolution of different outcome types
- Binary and multi-outcome resolution

### 4. Claim Winnings Tests (`test_claim_winnings.sh`)
Tests claiming winnings:
- Claims from binary markets
- Claims from multi-outcome markets
- Small and large bet claims
- Double-claim prevention

### 5. Integration Tests (`test_integration.sh`)
End-to-end flows:
- Complete market lifecycle (create -> bet -> resolve -> claim)
- Multi-outcome market flows
- Pool key uniqueness verification (Bug #1 fix)
- Dynamic odds verification (Bug #2 fix)
- Multi-outcome claim verification (Bug #3 fix)

## Running Tests

### Prerequisites
```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict/program
```

### Run All Tests
```bash
./run_all_tests.sh
```

### Run Individual Test Suites
```bash
./test_create_market.sh
./test_place_bet.sh
./test_resolve_market.sh
./test_claim_winnings.sh
./test_integration.sh
```

## Test Execution

Tests use `leo execute` to run transitions locally. Each test:
1. Executes the transition with test inputs
2. Verifies the output matches expected results
3. Checks that mappings are updated correctly

## Expected Test Results

### Bug Fix Verification

**Bug #1: Pool Key Generation**
- ✅ Each outcome has unique pool key
- ✅ Pool keys are: `hash(market_id + outcome)`
- ✅ Multiple outcomes don't overwrite each other's pools

**Bug #2: Dynamic Odds Calculation**
- ✅ Odds are calculated based on current pool state
- ✅ Odds change as more bets are placed
- ✅ First bet gets different odds than later bets

**Bug #3: Multi-Outcome Claim**
- ✅ Claims work for binary markets (2 outcomes)
- ✅ Claims work for multi-outcome markets (3-255 outcomes)
- ✅ Winnings calculated using correct pool (outcome_pools for multi-outcome)

## Test Data

### Test Accounts
- Account 1: `aleo1tgk48pzlz2xws2ed888...` (from .env)
- Additional accounts can be generated for multi-user tests

### Test Market IDs
- 100field: Binary market (Sports)
- 200field: Multi-outcome market (Politics, 4 outcomes)
- 300field: Binary market (Crypto)
- 400field: Multi-outcome market (Weather, 3 outcomes)
- 500field: Binary market (for odds testing)
- 600-604field: Category validation tests

### Test Timestamps
- End times: Various future timestamps (1740000000u32 - 1790000000u32)
- Current times: After end_time for resolution tests

## Manual Testing on Testnet

### Create a Market
```bash
leo execute create_market "1field" "1740000000u32" "2u8" "0u8" "false" --network testnet --broadcast
```

### Place a Bet
```bash
leo execute place_bet "1field" "1u8" "1000000u64" "123field" --network testnet --broadcast
```

### Resolve Market
```bash
leo execute resolve_market "1field" "1u8" "1741000000u32" --network testnet --broadcast
```

### Claim Winnings
```bash
leo execute claim_winnings "{bet_id_field}" --network testnet --broadcast
```

## Query On-Chain State

### Check Market
```bash
leo query markets "1field" --network testnet
```

### Check Pools (Binary)
```bash
leo query yes_pool "1field" --network testnet
leo query no_pool "1field" --network testnet
```

### Check Outcome Pool (Multi-outcome)
```bash
# Pool key = hash(market_id + outcome)
leo query outcome_pools "{pool_key}" --network testnet
```

### Check Bet Data
```bash
leo query bet_data "{bet_id}" --network testnet
```

### Check Claimed Status
```bash
leo query claimed_bets "{bet_id}" --network testnet
```

## Debugging

Enable debug output:
```bash
leo execute create_market ... -d
```

## Test Coverage

| Transition | Unit Tests | Integration Tests | Coverage |
|------------|-----------|-------------------|----------|
| create_market | 5 tests | 6 tests | ✅ 100% |
| place_bet | 7 tests | 5 tests | ✅ 100% |
| resolve_market | 8 tests | 3 tests | ✅ 100% |
| claim_winnings | 8 tests | 2 tests | ✅ 100% |

## Known Limitations

1. Leo doesn't support automated testing with `@test` annotations
2. Tests must be run manually using `leo execute`
3. Integration tests require sequential execution (create -> bet -> resolve -> claim)
4. Some tests require waiting for transaction confirmation on testnet

## Contributing Tests

To add new tests:
1. Add test case to appropriate test script
2. Document expected behavior
3. Update this README with test details
4. Run test to verify it passes
