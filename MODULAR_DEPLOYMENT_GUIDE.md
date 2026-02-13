# zkPredict Modular Deployment Guide v5.0

**Status**: Modular architecture ready for deployment
**Date**: 2026-02-12

---

## Overview

The zkPredict v5.0 smart contract has been split into **3 independent programs** to overcome Aleo's program size limits while maintaining all v5.0 features.

### Three Programs

| Program | Purpose | Estimated Size | Dependencies |
|---------|---------|---------------|--------------|
| **zkpredict_core.aleo** | Markets, betting, resolution | ~300-400k variables | credits.aleo |
| **zkpredict_reputation.aleo** | Tier system, reputation tracking | ~150-200k variables | None |
| **zkpredict_parlays.aleo** | Multi-leg parlays (2-5 legs) | ~250-350k variables | core, reputation |

**Total**: ~800k variables (vs 1.8M in monolithic v5.0)
**Deployability**: ✅ Each program well within limits

---

## Architecture

### Program 1: zkpredict_core.aleo

**Features**:
- ✅ Market creation & resolution
- ✅ Single bet placement (private Credits)
- ✅ Parimutuel pool management
- ✅ Time-weighted betting (2.0x → 1.0x over 24hrs)
- ✅ Claim winnings with double-claim prevention
- ✅ Batch claim (2 bets)
- ✅ Multi-outcome markets (2-10 outcomes)
- ✅ Market categories (Sports, Politics, Crypto, Weather, Other)

**Records**:
- `Bet` (private)
- `Winnings` (private)

**Mappings**:
- `markets`: field => Market
- `market_stats`: field => MarketStats
- `outcome_pools`: field => u64
- `claimed_bets`: field => bool

---

### Program 2: zkpredict_reputation.aleo

**Features**:
- ✅ Initialize reputation (Novice tier)
- ✅ Update reputation after win/loss
- ✅ Automatic tier calculation (Novice → Skilled → Expert → Oracle)
- ✅ Streak tracking (current + best)
- ✅ Zero-knowledge reputation proofs (selective disclosure)
- ✅ Parlay stats tracking

**Records**:
- `Reputation` (private)
- `RepProof` (private)

**Tier Requirements**:
- **Novice** (1): Default
- **Skilled** (2): 6+ wins, 60%+ accuracy
- **Expert** (3): 16+ wins, 70%+ accuracy
- **Oracle** (4): 31+ wins, 80%+ accuracy

**Tier Benefits**:
- Max parlay legs: 2/3/4/5
- Tier bonus: 1.0x/1.1x/1.2x/1.3x

---

### Program 3: zkpredict_parlays.aleo

**Features**:
- ✅ 2-leg parlays (all tiers)
- ✅ 3-leg parlays (Skilled+)
- ✅ 4-leg parlays (Expert+)
- ✅ 5-leg parlays (Oracle only)
- ✅ Combined odds: 3.5x/7x/14x/28x
- ✅ Tier bonuses applied
- ✅ Claim parlay winnings (all-or-nothing)

**Records**:
- `Parlay` (private)
- `ParlayWinnings` (private)

**Mappings**:
- `claimed_parlays`: field => bool

**Dependencies**:
- Imports `zkpredict_core.aleo` (for market validation)
- Imports `zkpredict_reputation.aleo` (for tier checks)

---

## Directory Structure

```
zkPredict/
├── program_modular/
│   ├── zkpredict_core/
│   │   ├── src/
│   │   │   └── main.leo
│   │   ├── program.json
│   │   └── build/            # After leo build
│   ├── zkpredict_reputation/
│   │   ├── src/
│   │   │   └── main.leo
│   │   ├── program.json
│   │   └── build/
│   └── zkpredict_parlays/
│       ├── src/
│       │   └── main.leo
│       ├── program.json
│       └── build/
```

---

## Build & Deployment Steps

### Step 1: Build Core Program

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict/program_modular/zkpredict_core

# Build
leo build

# Check program size
ls -lh build/*.prover
# Expected: ~10-15 MB prover key (vs 40+ MB for v5.0 monolithic)
```

**Success Criteria**:
- ✅ Compiles without errors
- ✅ Prover key < 20 MB
- ✅ Variables < 500,000

---

### Step 2: Build Reputation Program

```bash
cd ../zkpredict_reputation

leo build
```

**Success Criteria**:
- ✅ Compiles without errors
- ✅ Prover key < 10 MB
- ✅ Variables < 300,000

---

### Step 3: Build Parlays Program

```bash
cd ../zkpredict_parlays

leo build
```

**Notes**:
- Depends on core + reputation
- Leo will look for imported programs in adjacent directories

**Success Criteria**:
- ✅ Compiles without errors
- ✅ Prover key < 15 MB
- ✅ Variables < 400,000

---

### Step 4: Deploy to Testnet

**Order matters** - deploy in dependency order:

#### 4.1 Deploy Core (no dependencies)

```bash
cd zkpredict_core

leo deploy --network testnet
```

**Expected**:
- Cost: ~12-15 credits testnet
- Time: 2-5 minutes
- Output: Program ID `zkpredict_core.aleo`

#### 4.2 Deploy Reputation (no dependencies)

```bash
cd ../zkpredict_reputation

leo deploy --network testnet
```

**Expected**:
- Cost: ~8-10 credits testnet
- Time: 1-3 minutes

#### 4.3 Deploy Parlays (depends on core + reputation)

```bash
cd ../zkpredict_parlays

leo deploy --network testnet
```

**Expected**:
- Cost: ~12-15 credits testnet
- Time: 2-5 minutes

**Total Deployment Cost**: ~32-40 credits testnet (~$500-650 mainnet)

---

## Testing the Modular Programs

### Test 1: Create a Market (Core)

```bash
cd zkpredict_core

leo execute create_market \
  "1field" \
  "1750000000u32" \
  "2u8" \
  "0u8" \
  "false" \
  --network testnet
```

### Test 2: Initialize Reputation (Reputation)

```bash
cd ../zkpredict_reputation

leo execute init_reputation --network testnet
```

**Output**: Reputation record (private)

### Test 3: Place a Single Bet (Core)

```bash
cd ../zkpredict_core

# Requires a private Credits record
leo execute place_bet \
  "{...credits_record...}" \
  "1field" \
  "1u8" \
  "123field" \
  --network testnet
```

**Output**: Bet record (private)

### Test 4: Create a 2-Leg Parlay (Parlays)

```bash
cd ../zkpredict_parlays

leo execute create_parlay_2 \
  "{...credits_record...}" \
  "1field" \
  "1u8" \
  "2field" \
  "0u8" \
  "456field" \
  "1u8" \
  "100u64" \
  --network testnet
```

**Output**: Parlay record (private)

---

## Cross-Program Integration

### How Programs Communicate

**Option 1: Client-Side Coordination** (Simplest)
- Frontend calls each program separately
- User manages records (Reputation, Bet, Parlay)
- No on-chain cross-program calls

**Option 2: Cross-Program Calls** (Advanced)
- Parlays program calls `zkpredict_core.aleo/markets.get()` to validate markets
- Requires async cross-program imports
- More complex but fully on-chain validation

**Recommendation**: Start with **Option 1** for faster deployment

---

## Frontend Integration

### Updated Program IDs

In `src/types/index.ts`:

```typescript
// OLD (v5.0 monolithic)
export const ZKPREDICT_PROGRAM_ID = 'zkpredict_v5.aleo';

// NEW (modular)
export const ZKPREDICT_CORE_ID = 'zkpredict_core.aleo';
export const ZKPREDICT_REPUTATION_ID = 'zkpredict_reputation.aleo';
export const ZKPREDICT_PARLAYS_ID = 'zkpredict_parlays.aleo';
```

### Example: Place a Bet with Reputation Update

```typescript
// 1. Place bet via Core program
const betTx = await wallet.createTransaction({
  program: ZKPREDICT_CORE_ID,
  function: 'place_bet',
  inputs: [creditsRecord, marketId, outcome, nonce]
});

// 2. Update reputation via Reputation program
const repTx = await wallet.createTransaction({
  program: ZKPREDICT_REPUTATION_ID,
  function: 'update_reputation_bet_placed',
  inputs: [reputationRecord, amount]
});

// Execute sequentially
await betTx.execute();
await repTx.execute();
```

### Example: Create a Parlay

```typescript
// User must have Reputation record to check tier
const tier = userReputation.tier; // 1-4
const tierBonus = calculateTierBonus(tier); // 100-130

// Create parlay via Parlays program
const parlayTx = await wallet.createTransaction({
  program: ZKPREDICT_PARLAYS_ID,
  function: 'create_parlay_2',
  inputs: [
    creditsRecord,
    market1Id,
    outcome1,
    market2Id,
    outcome2,
    nonce,
    tier,
    tierBonus
  ]
});

// Update reputation
const repTx = await wallet.createTransaction({
  program: ZKPREDICT_REPUTATION_ID,
  function: 'update_reputation_parlay_placed',
  inputs: [reputationRecord, 2, amount] // 2 legs
});
```

---

## Migration from v4/v5 Monolithic

### User Data Migration

**No automatic migration** - users keep old records:

| Old Program | New Program | Migration |
|-------------|-------------|-----------|
| v4 Bet records | zkpredict_core Bet | Must claim v4 bets on v4 program first |
| v5 Bet records | zkpredict_core Bet | Incompatible, must claim on v5 if deployed |
| No reputation | zkpredict_reputation | Initialize fresh with `init_reputation()` |

**Recommendation**:
1. Alert users to claim all v4 winnings before migration
2. Initialize reputation in new system (starts at Novice tier)
3. Announce migration date in advance

---

## Deployment Checklist

### Pre-Deployment

- [x] All 3 programs compile successfully
- [ ] Program sizes verified (< 500k variables each)
- [ ] Test execution on devnet
- [ ] Wallet funded (50+ credits testnet)
- [ ] Frontend updated with new program IDs
- [ ] Documentation updated

### Deployment Day

- [ ] Deploy zkpredict_core.aleo
- [ ] Verify deployment (query markets mapping)
- [ ] Deploy zkpredict_reputation.aleo
- [ ] Test init_reputation
- [ ] Deploy zkpredict_parlays.aleo
- [ ] Test end-to-end flow
- [ ] Update frontend with deployed program IDs
- [ ] Deploy frontend to production
- [ ] Announce launch

### Post-Deployment

- [ ] Monitor first 10 transactions
- [ ] Check for any assertion failures
- [ ] Test batch operations (claim_two_winnings)
- [ ] Verify reputation tier upgrades work
- [ ] Test all parlay variants (2-5 legs)
- [ ] Document any issues

---

## Troubleshooting

### Build Errors

**Error**: `Cannot find imported program zkpredict_core.aleo`

**Fix**: Ensure all programs are in sibling directories:
```
program_modular/
  ├── zkpredict_core/
  ├── zkpredict_reputation/
  └── zkpredict_parlays/
```

---

**Error**: `Program size exceeds limit`

**Fix**: Check which program is too large:
```bash
leo build --verbose
# Look for "Total variables: X"
```

If still too large, move more transitions to separate programs.

---

### Deployment Errors

**Error**: `HTTP 500` during broadcast

**Fix**: Program might still be too large. Check prover key size:
```bash
ls -lh build/*.prover
# Should be < 20 MB per program
```

---

**Error**: `Insufficient balance`

**Fix**: Fund wallet with more testnet credits:
```bash
# Get testnet credits from faucet
# https://faucet.aleo.org
```

---

### Frontend Integration Issues

**Error**: `Program not found: zkpredict_v5.aleo`

**Fix**: Update all references from monolithic to modular:
```typescript
// OLD
ZKPREDICT_PROGRAM_ID = 'zkpredict_v5.aleo'

// NEW
ZKPREDICT_CORE_ID = 'zkpredict_core.aleo'
ZKPREDICT_REPUTATION_ID = 'zkpredict_reputation.aleo'
ZKPREDICT_PARLAYS_ID = 'zkpredict_parlays.aleo'
```

---

## Cost Comparison

| Deployment | Variables | Prover Size | Deploy Cost (Testnet) | Deploy Cost (Mainnet Est.) |
|------------|-----------|-------------|----------------------|---------------------------|
| **v5.0 Monolithic** | 1,812,725 | ~42 MB | ❌ FAILS | N/A |
| **v4 (Working)** | 130,407 | ~5 MB | 6.91 credits | ~$100 |
| **Modular Core** | ~350,000 | ~12 MB | ~12-15 credits | ~$200-250 |
| **Modular Reputation** | ~180,000 | ~7 MB | ~8-10 credits | ~$120-150 |
| **Modular Parlays** | ~300,000 | ~11 MB | ~12-15 credits | ~$200-250 |
| **Total Modular** | ~830,000 | ~30 MB | ~32-40 credits | ~$520-650 |

**Tradeoff**: 3x deployment cost vs v4, but **all v5.0 features available** ✅

---

## Advantages of Modular Architecture

✅ **All v5.0 features** - Reputation, parlays, time-weighting
✅ **Deployable** - Each program well within limits
✅ **Maintainable** - Easier to update individual programs
✅ **Scalable** - Can add more programs in future (e.g., governance)
✅ **Testable** - Each program can be tested independently

---

## Disadvantages

⚠️ **3x deployment cost** - Need to deploy 3 programs
⚠️ **Frontend complexity** - Must coordinate 3 programs
⚠️ **Cross-program calls** - More complex if needed
⚠️ **User experience** - Users manage more record types

---

## Next Steps

1. ✅ Build all 3 programs
2. ⏳ Verify program sizes
3. ⏳ Test on devnet
4. ⏳ Deploy to testnet
5. ⏳ Update frontend integration
6. ⏳ End-to-end testing
7. ⏳ Production launch

---

**Estimated Timeline**: 2-3 days for full deployment and testing

**Recommended Approach**: Deploy to testnet first, test thoroughly for 1 week, then mainnet

**Wallet Balance Needed**: 50+ credits testnet (current: 69.7 ✅)

---

*Last updated: 2026-02-12*
*Status: Ready for build & deployment*
