# zkPredict v5.0 Migration & Deployment Guide

> **Target Audience**: Developers migrating from v4 to v5 or deploying v5 for the first time
> **Estimated Time**: 2-3 hours (including testing)
> **Last Updated**: 2026-02-10

---

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [Pre-Migration Checklist](#pre-migration-checklist)
4. [Smart Contract Migration](#smart-contract-migration)
5. [Frontend Migration](#frontend-migration)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Steps](#deployment-steps)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Plan](#rollback-plan)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What's Changing

**v4 → v5 Major Updates**:
- ✅ Reputation system (4-tier progression)
- ✅ Parlay betting (2-5 leg multi-market bets)
- ✅ Time-weighted betting (early bettor rewards)
- ✅ Enhanced privacy (removed `bet_data` mapping)
- ✅ Credits integration (private payments)

### Migration Impact

**Non-Breaking** (Compatible):
- Market creation
- Market resolution
- Basic market querying

**Breaking** (Requires Changes):
- Bet placement (now uses Credits)
- Winnings claiming (requires full Bet record)
- Program ID (`zkpredict4.aleo` → `zkpredict_v5.aleo`)

### User Impact

**Existing Users**:
- ⚠️ **v4 bets must be claimed before migration**
- ⚠️ **v4 markets will remain on old contract**
- ⚠️ **Reputation starts fresh (no historical data)**

**New Features Available**:
- ✨ Reputation tracking
- ✨ Parlay betting
- ✨ Early betting bonuses

---

## Breaking Changes

### 1. Program ID Change
```diff
- 'zkpredict4.aleo'
+ 'zkpredict_v5.aleo'
```

**Impact**: All transaction calls must update program ID

### 2. Bet Placement Signature
```diff
// v4
- async transition place_bet(
-     public market_id: field,
-     outcome: u8,
-     amount: u64,
-     nonce: field
- ) -> (Bet, Future)

// v5
+ async transition place_bet(
+     payment: credits.aleo/credits,
+     public market_id: field,
+     outcome: u8,
+     nonce: field
+ ) -> (Bet, credits.aleo/credits, Future)
```

**Impact**: Frontend must construct Credits payment record

### 3. Claim Winnings Signature
```diff
// v4
- async transition claim_winnings(
-     public bet_id: field
- ) -> (Winnings, Future)

// v5
+ async transition claim_winnings(
+     bet: Bet,
+     reputation: Reputation
+ ) -> (Winnings, Reputation, Future)
```

**Impact**: Users need full Bet record (not just bet_id)

### 4. Bet Record Structure
```diff
record Bet {
    owner: address,
    market_id: field,
    bet_id: field,
    outcome: u8,
    amount: u64,
-   odds_at_bet: u64,
+   odds_snapshot: u64,
+   time_multiplier: u64,
+   placed_at: u32,
}
```

**Impact**: Bet records from v4 cannot be used in v5

### 5. Removed Mappings
```diff
- mapping bet_data: field => BetData;
```

**Impact**: Can no longer claim with just bet_id, must have Bet record

---

## Pre-Migration Checklist

### 1. Backup v4 State
```bash
# Export all v4 markets
curl "https://api.provable.com/v2/testnet/program/zkpredict4.aleo/mapping/markets" > v4_markets_backup.json

# Save v4 deployment address
echo "v4 program: zkpredict4.aleo" > deployment_log.txt
```

### 2. Notify Users
**Email/Discord Announcement**:
```
🚨 zkPredict v5.0 Upgrade Notice

We're upgrading to v5.0 with exciting new features:
- Reputation system with tiered rewards
- Multi-leg parlay betting
- Early bettor bonuses

ACTION REQUIRED:
1. Claim any pending v4 winnings by [DATE]
2. After [DATE], create new bets on v5.0
3. Your reputation will start fresh

Questions? Join our Discord: [LINK]
```

### 3. Test Environment Setup
```bash
# Clone repository
git clone <repo-url>
cd zkPredict

# Install dependencies
yarn install

# Setup Leo environment
cd program
leo clean
leo build
```

### 4. Fund Test Accounts
```bash
# Get testnet credits from faucet
# https://faucet.aleo.org

# Verify balance
leo query credits.aleo account <your-address> --network testnet
```

---

## Smart Contract Migration

### Step 1: Build v5 Contract
```bash
cd zkPredict/program

# Clean previous builds
leo clean

# Build v5 contract
leo build

# Verify output
ls -la build/
# Should see main.aleo, main.prover, main.verifier
```

### Step 2: Deploy to Devnet (Testing)
```bash
# Start local devnet
leo devnet start

# Deploy
leo deploy --network devnet --program zkpredict_v5.aleo

# Test transitions
leo execute create_market \
  "1field" \
  "1750000000u32" \
  "2u8" \
  "0u8" \
  "false" \
  --network devnet

# Stop devnet
leo devnet stop
```

### Step 3: Run Test Suite
```bash
# Run all v5 tests
cd program/tests
leo test

# Expected output:
# ✓ test_time_multiplier_early
# ✓ test_tier_novice
# ✓ test_tier_skilled
# ✓ test_parlay_2_legs_payout
# ... (22 tests total)
```

### Step 4: Deploy to Testnet
```bash
cd zkPredict/program

# Deploy to testnet
leo deploy --network testnet --program zkpredict_v5.aleo

# SAVE THE DEPLOYMENT TRANSACTION ID
# Example: at1abc123...

# Verify deployment
leo query markets "1field" --network testnet
```

### Step 5: Verify Deployment
```bash
# Check program exists
curl "https://api.provable.com/v2/testnet/program/zkpredict_v5.aleo"

# Should return program details
```

---

## Frontend Migration

### Step 1: Update Dependencies
```bash
cd zkPredict

# Ensure latest Aleo wallet adapter
yarn add @demox-labs/aleo-wallet-adapter-react@latest
yarn add @demox-labs/aleo-wallet-adapter-base@latest

# Install
yarn install
```

### Step 2: Update Type Definitions
**File**: `src/types/index.ts`

```diff
- export const ZKPREDICT_PROGRAM_ID = 'zkpredict4.aleo';
+ export const ZKPREDICT_PROGRAM_ID = 'zkpredict_v5.aleo';

// Add new v5 types
+ export type Reputation = {
+   owner: string;
+   totalBets: number;
+   totalWins: number;
+   ...
+ };

+ export type Parlay = {
+   owner: string;
+   parlayId: string;
+   ...
+ };
```

### Step 3: Update Component Program IDs

**Files to Update**:
- `src/components/markets/PlaceBet.tsx`
- `src/components/markets/CreateMarket.tsx`
- `src/components/markets/ClaimWinnings.tsx`
- `src/components/markets/ClaimTwoWinnings.tsx`
- `src/components/markets/ResolveMarket.tsx`
- `src/lib/aleo.ts`

**Find and Replace**:
```bash
# In all .tsx and .ts files
find src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -exec sed -i 's/zkpredict4\.aleo/zkpredict_v5.aleo/g' {} +
```

**Manual Verification**:
```bash
# Search for any remaining v4 references
grep -r "zkpredict4" src/
# Should return 0 results
```

### Step 4: Add New v5 Components

**Already Created** (if following this guide):
- ✅ `src/components/reputation/ReputationProfile.tsx`
- ✅ `src/components/reputation/TierBadge.tsx`
- ✅ `src/components/parlay/ParlayBuilder.tsx`

**Integrate into UI**:

**File**: `src/pages/index.tsx`
```tsx
import ReputationProfile from '@/components/reputation/ReputationProfile';

// In user dashboard section
{reputation && <ReputationProfile reputation={reputation} />}
```

**File**: `src/pages/markets.tsx`
```tsx
import ParlayBuilder from '@/components/parlay/ParlayBuilder';

// Add tab for parlay betting
<Tab label="Parlay Builder">
  <ParlayBuilder availableMarkets={markets} reputation={reputation} />
</Tab>
```

### Step 5: Update PlaceBet Component

**File**: `src/components/markets/PlaceBet.tsx`

```diff
// Update transaction creation
const transaction = Transaction.createTransaction(
  publicKey,
  'testnetbeta',
- 'zkpredict4.aleo',
+ 'zkpredict_v5.aleo',
  'place_bet',
  inputs,
  100000,
  false
);
```

### Step 6: Update ClaimWinnings Component

**File**: `src/components/markets/ClaimWinnings.tsx`

```diff
// v5 requires full Bet record
- const inputs = [betId];
+ const inputs = [betRecord];  // Full record from user's wallet

// Update program ID
const transaction = Transaction.createTransaction(
  publicKey,
  WalletAdapterNetwork.TestnetBeta,
- 'zkpredict4.aleo',
+ 'zkpredict_v5.aleo',
  'claim_winnings',
  inputs,
  100000,
  false
);
```

---

## Testing Strategy

### Unit Tests (Smart Contract)
```bash
cd zkPredict/program/tests

# Run all tests
leo test

# Test specific functionality
leo test test_time_multiplier_early
leo test test_tier_oracle
leo test test_parlay_5_legs_oracle_payout
```

### Integration Tests (Frontend)
```bash
cd zkPredict

# Start dev server
yarn dev

# Manual testing checklist:
```

**Test Checklist**:
- [ ] Wallet connects successfully
- [ ] Create market (2-outcome binary)
- [ ] Create market (3+ outcomes)
- [ ] Place bet on market
- [ ] View reputation stats
- [ ] Build 2-leg parlay (Novice tier)
- [ ] Attempt 5-leg parlay (should fail if Novice)
- [ ] Resolve market as creator
- [ ] Claim winnings with Bet record
- [ ] Check reputation updated after claim

### E2E Testing Script
```bash
#!/bin/bash
# test_v5_flow.sh

NETWORK="testnet"
PROGRAM="zkpredict_v5.aleo"

echo "1. Creating market..."
leo execute create_market \
  "$(date +%s)field" \
  "1750000000u32" \
  "2u8" \
  "0u8" \
  "false" \
  --network $NETWORK

echo "2. Placing bet..."
leo execute place_bet \
  "payment_record_here" \
  "market_id_here" \
  "1u8" \
  "$(date +%s)field" \
  --network $NETWORK

echo "3. Resolving market..."
leo execute resolve_market \
  "market_id_here" \
  "1u8" \
  "$(date +%s)u32" \
  --network $NETWORK

echo "4. Claiming winnings..."
leo execute claim_winnings \
  "bet_record_here" \
  "reputation_record_here" \
  --network $NETWORK

echo "✅ E2E test completed"
```

---

## Deployment Steps

### Production Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing
- [ ] v4 users notified
- [ ] Backup v4 state
- [ ] Testnet deployment successful
- [ ] Frontend tested on staging

### Step 1: Deploy Smart Contract to Mainnet

```bash
cd zkPredict/program

# Switch to mainnet in .env
echo "NETWORK=mainnet" > .env

# Build for mainnet
leo build

# Deploy (REQUIRES MAINNET CREDITS)
leo deploy --network mainnet --program zkpredict_v5.aleo

# SAVE DEPLOYMENT TX
# Example: at1mainnet123...
```

### Step 2: Update Frontend Environment Variables

**Vercel Dashboard** → **Settings** → **Environment Variables**:

```bash
# Update for mainnet
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_RPC_URL=https://mainnet.aleorpc.com
NEXT_PUBLIC_PROGRAM_ID=zkpredict_v5.aleo
```

**File**: `src/types/index.ts`
```typescript
export const CURRENT_NETWORK = WalletAdapterNetwork.MainnetBeta;
export const CURRENT_RPC_URL = "https://mainnet.aleorpc.com";
export const EXPLORER_URL = "https://explorer.provable.com";
```

### Step 3: Deploy Frontend to Vercel

```bash
cd zkPredict

# Build production bundle
yarn build

# Deploy to Vercel
vercel --prod

# Or via GitHub integration (push to main branch)
git push origin main
```

### Step 4: Database Setup (Supabase)

**Create Production Database**:
```sql
-- In Supabase SQL Editor
CREATE TABLE markets_metadata (
  market_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  outcome_labels TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add v5-specific columns
ALTER TABLE markets_metadata
ADD COLUMN program_version TEXT DEFAULT 'v5.0';

-- Enable RLS
ALTER TABLE markets_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON markets_metadata FOR SELECT
  USING (true);

CREATE POLICY "Authenticated write access"
  ON markets_metadata FOR INSERT
  WITH CHECK (true);
```

### Step 5: DNS & SSL Configuration

**Vercel Domains**:
- Add custom domain (if applicable)
- Verify SSL certificate auto-provisioned
- Test HTTPS access

---

## Post-Deployment Verification

### Smart Contract Verification
```bash
# 1. Check program exists on explorer
curl "https://api.provable.com/v2/mainnet/program/zkpredict_v5.aleo"

# 2. Test read operations
curl "https://api.provable.com/v2/mainnet/program/zkpredict_v5.aleo/mapping/markets/1field"

# 3. Verify transitions available
# Visit: https://explorer.provable.com/program/zkpredict_v5.aleo
```

### Frontend Verification
```bash
# 1. Load production URL
curl -I https://zkpredict.com

# 2. Check bundle size
curl https://zkpredict.com/_next/static/... | wc -c

# 3. Test API endpoints
curl https://zkpredict.com/api/markets

# 4. Verify WASM loading
# Open browser console, check for WASM errors
```

### Functional Testing (Production)
**Test Account** (Use separate test wallet with small amounts):
1. Connect wallet
2. Create test market
3. Place small bet
4. Verify transaction on explorer
5. Check reputation initialized
6. Attempt parlay (if tier allows)

### Monitoring Setup

**Vercel Analytics**:
- Enable Real-time analytics
- Set up error tracking
- Configure performance monitoring

**Smart Contract Monitoring**:
```bash
# Watch for failed transactions
watch -n 60 'curl https://api.provable.com/v2/mainnet/program/zkpredict_v5.aleo | jq .'
```

---

## Rollback Plan

### If Deployment Fails

**Frontend Rollback** (Instant):
```bash
# In Vercel dashboard
# Deployments → [Previous successful deployment] → "Promote to Production"
```

**Smart Contract Rollback** (Not Possible):
- ⚠️ **Aleo contracts are immutable**
- Cannot rollback deployed contract
- Must deploy patched version as new program

**Mitigation Strategies**:
1. Keep v4 contract active for 30 days
2. Update frontend to support both v4 and v5
3. Add version selector in UI
4. Migrate users gradually

### Emergency Contact
```
Team Lead: [NAME]
Discord: [LINK]
GitHub Issues: [LINK]
Emergency Email: [EMAIL]
```

---

## Troubleshooting

### Common Issues

#### 1. Transaction Fails: "Insufficient balance"
**Solution**:
```bash
# Check wallet balance
leo query credits.aleo account <address> --network mainnet

# Ensure at least 1 credit for fees
```

#### 2. "Program not found: zkpredict_v5.aleo"
**Solution**:
```bash
# Verify deployment
curl "https://api.provable.com/v2/mainnet/program/zkpredict_v5.aleo"

# If not found, redeploy
leo deploy --network mainnet
```

#### 3. "Bet record not found in wallet"
**Problem**: Users claim v4 wins using bet_id, but v5 needs full record

**Solution**:
```typescript
// Add migration helper in ClaimWinnings component
if (betId && !betRecord) {
  alert('v5 requires full Bet record. Please check your wallet records.');
  // Provide link to v4 claiming UI
}
```

#### 4. "Parlay fails: tier too low"
**Solution**:
```typescript
// Add validation in ParlayBuilder
if (selectedLegs.length > TIER_MAX_LEGS[userTier]) {
  alert(`Your ${TIER_LABELS[userTier]} tier allows max ${TIER_MAX_LEGS[userTier]} legs`);
  return;
}
```

#### 5. "Time multiplier not applying"
**Diagnosis**:
```bash
# Check market creation block height
leo query markets "market_id_field" --network mainnet

# Compare with current block height
leo query block --network mainnet

# Time multiplier should decrease as blocks increase
```

**Solution**: Ensure `created_at` field is properly set in Market struct

---

## Migration Timeline

### Recommended Schedule

**Week 1: Preparation**
- Day 1-2: Deploy to devnet, run tests
- Day 3-4: Deploy to testnet, internal testing
- Day 5-7: Beta testing with select users

**Week 2: Staged Rollout**
- Day 1: Notify all users (7-day notice)
- Day 2-3: Deploy frontend v5 (read-only mode)
- Day 4: Deploy smart contract to mainnet
- Day 5: Enable v5 betting
- Day 6-7: Monitor, fix issues

**Week 3: Full Migration**
- Day 1-7: Gradually migrate users from v4
- Keep v4 active for claims only

**Week 4: Deprecation**
- Disable v4 market creation
- Keep v4 claiming active indefinitely

---

## Success Criteria

**Deployment Successful When**:
- ✅ Smart contract deployed and verified on explorer
- ✅ Frontend loading without errors
- ✅ Users can create markets
- ✅ Users can place bets and parlays
- ✅ Reputation tracking working
- ✅ Time multipliers applying correctly
- ✅ Winnings claimable
- ✅ No critical bugs reported in first 24 hours

**KPIs to Track**:
- Transaction success rate (target: >95%)
- Average bet placement time (target: <30s)
- Parlay usage rate (target: >10% of users)
- Reputation tier distribution
- Time-weighted bet distribution (early vs late)

---

## Additional Resources

**Documentation**:
- [ARCHITECTURE_V5.md](./ARCHITECTURE_V5.md) - Technical architecture
- [V4_VS_V5_ANALYSIS.md](./V4_VS_V5_ANALYSIS.md) - Detailed comparison
- [CLAUDE.md](./CLAUDE.md) - Development guide

**External Links**:
- Aleo Documentation: https://developer.aleo.org
- Leo Language Guide: https://developer.aleo.org/leo
- Provable Explorer: https://explorer.provable.com

**Support**:
- Discord: [YOUR_DISCORD]
- GitHub Issues: https://github.com/[YOUR_REPO]/issues
- Email: [YOUR_EMAIL]

---

**End of Migration & Deployment Guide**

*Good luck with your v5.0 deployment! 🚀*
