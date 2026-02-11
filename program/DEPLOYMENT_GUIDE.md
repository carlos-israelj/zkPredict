# zkPredict v5.0 Deployment Guide

## 🚀 Pre-Deployment Checklist

- ✅ Contract compiles successfully (`leo build`)
- ✅ Program ID configured: `zkpredict_v5.aleo`
- ✅ `credits.aleo` dependency added
- ✅ `.env` file configured with testnet credentials
- ✅ Frontend types updated to match contract

---

## 📋 Deployment Steps

### 1. Verify Build

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict/program
leo build
```

**Expected output**: `✅ Compiled 'zkpredict_v5.aleo' into Aleo instructions`

### 2. Check Account Balance

```bash
# Check your testnet balance (need credits for deployment)
leo account
```

**Note**: Deployment requires testnet credits. Get free testnet credits from:
- Aleo Faucet: https://faucet.aleo.org

### 3. Deploy to Testnet

```bash
leo deploy --network testnet
```

**Deployment time**: ~2-5 minutes depending on network congestion

**Expected output**:
```
✅ Successfully deployed 'zkpredict_v5.aleo' to testnet
📍 Program ID: zkpredict_v5.aleo
🔗 Transaction: https://testnet.explorer.provable.com/transaction/[TX_ID]
```

---

## 🧪 Post-Deployment Testing

### Test 1: Create Binary Market

```bash
leo execute create_market \
  "1field" \
  "1740000000u32" \
  "2u8" \
  "0u8" \
  "false" \
  --network testnet
```

**Parameters**:
- `market_id`: `1field`
- `end_time`: `1740000000u32` (Unix timestamp)
- `num_outcomes`: `2u8` (binary: YES/NO)
- `category`: `0u8` (Sports)
- `auto_resolve`: `false`

### Test 2: Place a Bet

```bash
leo execute place_bet \
  "1field" \
  "1u8" \
  "1000000u64" \
  "123field" \
  --network testnet
```

**Parameters**:
- `market_id`: `1field`
- `outcome`: `1u8` (YES = 1, NO = 0)
- `amount`: `1000000u64` (1 credit = 1,000,000 microcredits)
- `nonce`: `123field` (unique nonce for bet_id)

**Save the Bet record** from the output - you'll need it to claim winnings!

### Test 3: Initialize Reputation

```bash
leo execute init_reputation --network testnet
```

**Expected**: Returns a Reputation record starting at Novice tier

### Test 4: Create 2-Leg Parlay

```bash
leo execute init_2leg_parlay \
  "1field" \
  "1u8" \
  "2field" \
  "0u8" \
  "2000000u64" \
  "456field" \
  --network testnet
```

**Parameters**:
- `market_id_1`: `1field`
- `outcome_1`: `1u8`
- `market_id_2`: `2field`
- `outcome_2`: `0u8`
- `amount`: `2000000u64` (2 credits)
- `nonce`: `456field`

### Test 5: Resolve Market

```bash
# Wait until end_time has passed, then resolve:
leo execute resolve_market \
  "1field" \
  "1u8" \
  "1740000001u32" \
  --network testnet
```

**Parameters**:
- `market_id`: `1field`
- `winning_outcome`: `1u8`
- `current_time`: `1740000001u32` (must be after end_time)

**Note**: Only the market creator can resolve (unless auto_resolve is enabled)

### Test 6: Claim Winnings

```bash
leo execute claim_winnings \
  "{owner: aleo1..., market_id: 1field, bet_id: ..., outcome: 1u8, amount: 1000000u64, odds_snapshot: 10000u64, time_multiplier: 200u64, placed_at: 0u32}" \
  --network testnet
```

**Parameters**:
- `bet`: The Bet record from Test 2 (paste full record)

**Expected**: Returns a Winnings record with payout amount

---

## 🔍 Querying On-Chain State

### Check Market Status

```bash
leo query markets "1field" --network testnet
```

### Check Outcome Pool

```bash
# For binary markets (legacy)
leo query yes_pool "1field" --network testnet
leo query no_pool "1field" --network testnet

# For multi-outcome markets
# Pool key = BHP256::hash_to_field(market_id + outcome)
leo query outcome_pools "[pool_key]" --network testnet
```

### Check if Bet Already Claimed

```bash
leo query claimed_bets "[bet_id]" --network testnet
```

---

## 📊 Advanced Testing Scenarios

### Scenario A: Multi-Outcome Market (3 outcomes)

```bash
# Create market with 3 outcomes
leo execute create_market \
  "2field" \
  "1750000000u32" \
  "3u8" \
  "2u8" \
  "false" \
  --network testnet

# Place bets on different outcomes
leo execute place_bet "2field" "0u8" "1000000u64" "201field" --network testnet
leo execute place_bet "2field" "1u8" "2000000u64" "202field" --network testnet
leo execute place_bet "2field" "2u8" "1500000u64" "203field" --network testnet

# Resolve with outcome 1 as winner
leo execute resolve_market "2field" "1u8" "1750000001u32" --network testnet
```

### Scenario B: Full Reputation Flow

```bash
# 1. Initialize reputation
leo execute init_reputation --network testnet

# 2. Win a bet (requires market resolution + claim)
# ... place bet, resolve market, claim winnings ...

# 3. Update reputation after win
leo execute update_reputation_win \
  "{...reputation_record...}" \
  --network testnet

# 4. Prove reputation tier (requires current block height)
leo execute prove_reputation \
  "{...reputation_record...}" \
  "2u8" \
  "70u8" \
  "10u32" \
  "3u32" \
  "123456u32" \
  --network testnet
```

### Scenario C: 5-Leg Parlay (Oracle Tier Only)

```bash
# Requires Oracle tier (tier 4)
leo execute init_5leg_parlay \
  "1field" "1u8" \
  "2field" "0u8" \
  "3field" "1u8" \
  "4field" "0u8" \
  "5field" "1u8" \
  "5000000u64" \
  "789field" \
  --network testnet
```

---

## 🐛 Troubleshooting

### Error: "Insufficient balance"
- **Solution**: Get more testnet credits from https://faucet.aleo.org

### Error: "Program already exists"
- **Solution**: Program ID `zkpredict_v5.aleo` is already deployed. Either:
  1. Use the existing deployment
  2. Change the program name in `program.json` (e.g., `zkpredict_v5_test.aleo`)

### Error: "Market already exists"
- **Solution**: Use a different `market_id` field value

### Error: "Market has not ended yet"
- **Solution**: Wait until `current_time > end_time` before resolving

### Error: "Only creator can resolve"
- **Solution**: Resolve the market using the same private key that created it

### Error: "Bet already claimed"
- **Solution**: Each bet can only be claimed once (double-claim prevention)

### Error: "Wrong outcome"
- **Solution**: You bet on the losing outcome; only winning bets can claim

---

## 📈 Monitoring Deployment

### Check Transaction Status

```bash
# Get transaction details
leo query transaction [TX_ID] --network testnet
```

### Check Program State

```bash
# List all mappings
leo query mappings --network testnet

# Check specific mapping
leo query [mapping_name] [key] --network testnet
```

### View in Explorer

- **Testnet Explorer**: https://testnet.explorer.provable.com
- **Search by**: Program ID, Transaction ID, or Address

---

## 🔄 Redeployment (If Needed)

If you need to redeploy with changes:

```bash
# 1. Update program name in program.json
# Change "zkpredict_v5.aleo" to "zkpredict_v5_v2.aleo"

# 2. Update program name in main.leo
# Change: program zkpredict_v5.aleo {
# To:     program zkpredict_v5_v2.aleo {

# 3. Rebuild
leo build

# 4. Deploy
leo deploy --network testnet
```

---

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] Save deployment transaction ID
- [ ] Update frontend `ZKPREDICT_PROGRAM_ID` in `src/types/index.ts`
- [ ] Test all core transitions (create, bet, resolve, claim)
- [ ] Test reputation system flows
- [ ] Test parlay creation and settlement
- [ ] Document any issues or edge cases found
- [ ] Update API endpoints if needed
- [ ] Verify frontend integration works

---

## 🎯 Next Steps After Deployment

1. **Frontend Integration**
   - Update contract address in frontend config
   - Test wallet connection with deployed contract
   - Verify all UI components work with real contract

2. **Create Test Markets**
   - Create sample markets for each category
   - Add off-chain metadata to Supabase
   - Test full user flows end-to-end

3. **Community Testing**
   - Share testnet deployment with beta testers
   - Gather feedback on UX and functionality
   - Monitor for any issues or exploits

4. **Mainnet Preparation**
   - Audit contract thoroughly
   - Test all edge cases
   - Prepare mainnet deployment strategy
   - Set up monitoring and alerts

---

## 🆘 Support

- **Documentation**: See `MIGRATION_V5.md` and `ARCHITECTURE.md`
- **Compilation Issues**: See `V5_COMPILATION_SUMMARY.md`
- **Testing Issues**: See `TEST_STATUS.md`
- **Leo Docs**: https://developer.aleo.org/leo
- **Discord**: Aleo Community Discord

---

*Last updated: 2026-02-10*
