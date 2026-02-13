# zkPredict Architecture v5.0

> **Last Updated:** 2026-02-13
> **Version:** 5.0.0 (Reputation, Parlays, Time-Weighted Betting + Enhanced Privacy)
> **Deployment Status:** ✅ Live on Aleo Testnet

## Table of Contents

- [Overview](#overview)
- [What's New in v5.0](#whats-new-in-v50)
- [Architecture Philosophy](#architecture-philosophy)
- [Tech Stack](#tech-stack)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Data Flow](#data-flow)
- [Key Components Reference](#key-components-reference)
- [Privacy Model](#privacy-model)
- [Network Configuration](#network-configuration)
- [Development Workflow](#development-workflow)
- [Migration from v4](#migration-from-v4)
- [Deployment](#deployment)

---

## Overview

**zkPredict** is a full-stack decentralized prediction market platform built on the Aleo blockchain. Version 5.0 introduces gamification through a reputation system, multi-leg parlay betting, and time-weighted rewards for early bettors—all while maintaining zero-knowledge privacy.

### Core Capabilities

- **Private Betting**: Individual bet amounts and choices hidden using zero-knowledge proofs
- **Reputation System**: 4-tier progression (Novice → Skilled → Expert → Oracle) with private tracking
- **Parlay Betting**: Combine 2-5 markets with tier-gated access and bonus multipliers
- **Time-Weighted Rewards**: 2.0x multiplier for early bets, decreasing to 1.0x over 24 hours
- **Multi-Outcome Markets**: Support for 2-255 outcomes per market
- **Market Categories**: Sports, Politics, Crypto, Weather, and Other
- **Auto-Resolution**: Optional automatic market resolution after deadline
- **Parimutuel Pools**: Dynamic odds based on pool distribution
- **Double-Claim Prevention**: On-chain tracking to prevent duplicate winnings claims

---

## What's New in v5.0

### 1. Reputation System
**Tracks betting performance privately with tier progression**

- **4 Tiers**: Novice (1) → Skilled (2) → Expert (3) → Oracle (4)
- **Progression Criteria**:
  - Skilled: 6+ wins AND 60%+ accuracy
  - Expert: 16+ wins AND 70%+ accuracy
  - Oracle: 31+ wins AND 80%+ accuracy
- **Tier Benefits**:
  - Max parlay legs: 2/3/4/5 (by tier)
  - Parlay bonuses: 1.0x/1.1x/1.2x/1.3x (by tier)
- **Privacy**: Reputation data stored in private records, only owner can see stats

### 2. Parlay Betting
**Multi-leg bets with combined odds and tier bonuses**

- **Leg Range**: 2-5 markets per parlay (tier-gated)
- **Base Odds**: 3.5x (2-leg), 7x (3-leg), 14x (4-leg), 28x (5-leg)
- **Tier Bonus**: Applied on top of base odds
- **Win Condition**: ALL legs must win for payout
- **Privacy**: Individual parlay details private, only aggregate pool data public

### 3. Time-Weighted Betting
**Early bettor rewards with dynamic multipliers**

- **Multipliers**:
  - First 6 hours: 2.0x
  - 6-12 hours: 1.5x
  - 12-24 hours: 1.2x
  - After 24 hours: 1.0x
- **Calculation**: Based on block height elapsed since market creation
- **Purpose**: Incentivizes liquidity provision and rewards market discovery

### 4. Enhanced Privacy
**Critical improvements to prevent data leakage**

- **Removed**: `bet_data` mapping (was exposing bet amounts and choices)
- **Added**: Private Credits integration (`credits.aleo/transfer_private_to_public`)
- **Result**: Bet placement now fully private - amount and choice never visible on-chain

---

## Architecture Philosophy

zkPredict v5.0 maintains the **hybrid on-chain/off-chain architecture** with enhanced privacy:

### On-Chain (Aleo Blockchain)
**Purpose:** Critical state requiring cryptographic guarantees

- **Private Records**: Bet, Parlay, Reputation, Winnings, ReputationProof (visible only to owner)
- **Public Mappings**: Market state, pool balances, resolution status, aggregate stats
- **Business Logic**: All betting rules, reputation calculations, parlay validation

### Off-Chain (Supabase/In-Memory)
**Purpose:** Metadata and discoverability

- Market titles, descriptions, images
- Outcome labels
- Search and filtering
- Caching for faster UI

---

## Tech Stack

### Smart Contract Layer
- **Language**: Leo 1.13+
- **Program ID**: `zkpredict_v5.aleo`
- **Network**: Aleo TestnetBeta
- **Features**: Private records, public mappings, async transitions

### Frontend Layer
- **Framework**: Next.js 16.1.6 (Pages Router)
- **UI Library**: React 19.0.0
- **Styling**: TailwindCSS 4.1.18 + DaisyUI 5.5.14
- **Fonts**: Syne (display) + JetBrains Mono (monospace)
- **State Management**: React Query 3.39.3
- **Wallet Integration**: @demox-labs/aleo-wallet-adapter
- **Database**: Supabase (with in-memory fallback)

---

## Smart Contract Architecture

### Program: `zkpredict_v5.aleo`

Location: `zkPredict/program/src/main.leo`

#### Private State (Records)

**1. Bet Record**
```leo
record Bet {
    owner: address,
    market_id: field,
    bet_id: field,
    outcome: u8,
    amount: u64,
    odds_snapshot: u64,      // v5: Renamed from odds_at_bet
    time_multiplier: u64,    // v5: Early bet bonus (100-200)
    placed_at: u32,          // v5: Block height when placed
}
```

**2. Parlay Record** ⭐ NEW
```leo
record Parlay {
    owner: address,
    parlay_id: field,
    market1: field,
    outcome1: u8,
    market2: field,
    outcome2: u8,
    market3: field,          // Optional
    outcome3: u8,
    market4: field,          // Optional
    outcome4: u8,
    market5: field,          // Optional
    outcome5: u8,
    num_legs: u8,            // 2-5
    amount: u64,
    combined_odds: u64,      // Scaled by 10000
    tier_bonus: u64,         // 100-130 (1.0x-1.3x)
    placed_at: u32,          // Block height
}
```

**3. Reputation Record** ⭐ NEW
```leo
record Reputation {
    owner: address,
    total_bets: u32,
    total_wins: u32,
    total_parlays: u32,
    parlay_wins: u32,
    current_streak: u32,
    best_streak: u32,
    tier: u8,                // 1=Novice, 2=Skilled, 3=Expert, 4=Oracle
    total_wagered: u64,
    total_won: u64,
    last_updated: u32,
}
```

**4. Winnings Record**
```leo
record Winnings {
    owner: address,
    amount: u64,
    source_id: field,        // v5: bet_id or parlay_id
    source_type: u8,         // v5: 1=single bet, 2=parlay
    market_id: field,
    claimed_at: u32,         // v5: Block height when claimed
}
```

**5. ReputationProof Record** ⭐ NEW
```leo
record ReputationProof {
    owner: address,
    proof_id: field,
    tier_proven: u8,
    min_accuracy_proven: u64,
    min_wins_proven: u32,
    min_streak_proven: u32,
    valid_until: u32,        // Block height expiration
    created_at: u32,
}
```

#### Public State (Mappings)

**1. Markets Mapping**
```leo
mapping markets: field => Market;

struct Market {
    creator: address,
    created_at: u32,         // v5: For time-weighting
    end_time: u32,
    resolved: bool,
    winning_outcome: u8,
    num_outcomes: u8,
    category: u8,
    auto_resolve: bool,
    total_pool: u64,         // v5: Aggregate pool size
}
```

**2. Outcome Pools Mapping**
```leo
mapping outcome_pools: field => u64;
```
- Key: `BHP256::hash_to_field(market_id + outcome_index)`
- Value: Total microcredits (with time-weighted amounts)

**3. Claimed Tracking** ⭐ v5 ENHANCED
```leo
mapping claimed_bets: field => bool;
mapping claimed_parlays: field => bool;
```

**4. Market Statistics** ⭐ NEW
```leo
mapping market_stats: field => MarketStats;

struct MarketStats {
    total_bets: u64,
    total_bettors: u32,      // Estimated
    last_bet_block: u32,
}
```

#### Key Transitions (Public Functions)

**Creating Markets**
```leo
async transition create_market(
    public market_id: field,
    public end_time: u32,
    public num_outcomes: u8,
    public category: u8,
    public auto_resolve: bool
) -> Future
```

**Placing Single Bets** ⭐ v5 ENHANCED
```leo
async transition place_bet(
    payment: credits.aleo/credits,  // v5: Private Credits payment
    public market_id: field,
    outcome: u8,                    // PRIVATE
    nonce: field                    // PRIVATE
) -> (Bet, credits.aleo/credits, Future)
```
- **New**: Uses Credits program for private payments
- **New**: Calculates time_multiplier based on block height
- **New**: Updates Reputation record automatically

**Placing Parlays** ⭐ NEW
```leo
async transition place_parlay(
    payment: credits.aleo/credits,
    public nonce: field,
    public market1: field,
    outcome1: u8,                   // PRIVATE
    public market2: field,
    outcome2: u8,                   // PRIVATE
    // ... up to market5/outcome5
    public num_legs: u8
) -> (Parlay, credits.aleo/credits, Future)
```
- **Validation**: num_legs matches user's tier max
- **Odds**: Combined base odds + tier bonus
- **Updates**: Reputation.total_parlays++

**Reputation Management** ⭐ NEW
```leo
// Initialize reputation for new user
async transition init_reputation() -> Reputation

// Update reputation after bet resolution
async transition update_reputation_after_win(
    old_rep: Reputation,
    amount_won: u64,
    was_parlay: bool
) -> Reputation

// Create verifiable proof of reputation
async transition create_reputation_proof(
    rep: Reputation,
    valid_blocks: u32
) -> ReputationProof
```

**Claiming Winnings** ⭐ v5 ENHANCED
```leo
async transition claim_winnings(
    bet: Bet,
    reputation: Reputation
) -> (Winnings, Reputation, Future)
```
- **New**: Returns updated Reputation with win stats
- **New**: Calculates winnings with time_multiplier applied

**Claiming Parlay Winnings** ⭐ NEW
```leo
async transition claim_parlay_winnings(
    parlay: Parlay,
    reputation: Reputation
) -> (Winnings, Reputation, Future)
```
- **Validation**: ALL parlay legs must be winning outcomes
- **Payout**: (amount × combined_odds × tier_bonus) / 10000

#### Helper Functions

**Time Multiplier Calculation**
```leo
function calculate_time_multiplier(
    created_at: u32,
    current_block: u32
) -> u64 {
    let elapsed: u32 = current_block - created_at;

    if elapsed < 21600u32 { return 200u64; }      // 2.0x (0-6 hrs)
    if elapsed < 43200u32 { return 150u64; }      // 1.5x (6-12 hrs)
    if elapsed < 86400u32 { return 120u64; }      // 1.2x (12-24 hrs)
    return 100u64;                                  // 1.0x (24+ hrs)
}
```

**Tier Calculation**
```leo
function calculate_tier_from_stats(
    wins: u32,
    total_bets: u32
) -> u8 {
    if total_bets == 0u32 { return 1u8; }

    let accuracy: u32 = (wins * 100u32) / total_bets;

    if wins >= 31u32 && accuracy >= 80u32 { return 4u8; }  // Oracle
    if wins >= 16u32 && accuracy >= 70u32 { return 3u8; }  // Expert
    if wins >= 6u32 && accuracy >= 60u32 { return 2u8; }   // Skilled
    return 1u8;                                              // Novice
}
```

**Tier Benefits**
```leo
function get_tier_max_legs(tier: u8) -> u8 {
    if tier == 4u8 { return 5u8; }  // Oracle: 5 legs
    if tier == 3u8 { return 4u8; }  // Expert: 4 legs
    if tier == 2u8 { return 3u8; }  // Skilled: 3 legs
    return 2u8;                     // Novice: 2 legs
}

function calculate_tier_bonus(tier: u8) -> u64 {
    if tier == 4u8 { return 130u64; }  // Oracle: 1.3x
    if tier == 3u8 { return 120u64; }  // Expert: 1.2x
    if tier == 2u8 { return 110u64; }  // Skilled: 1.1x
    return 100u64;                     // Novice: 1.0x
}
```

---

## Frontend Architecture

### New v5.0 Components

#### Reputation Components

**1. ReputationProfile** (`src/components/reputation/ReputationProfile.tsx`)
- **Compact Mode**: Inline tier badge + accuracy for market lists
- **Full Mode**: Detailed stats dashboard
  - Tier badge with progress to next tier
  - Circular progress indicator
  - Stats grid: Accuracy, Streak, Parlays, Total Won
  - ROI calculation
  - Parlay win rate

**2. TierBadge** (`src/components/reputation/TierBadge.tsx`)
- **Visual Design**: Color-coded badges with tier icons
  - Novice: Gray + 🌱
  - Skilled: Blue + ⚡
  - Expert: Purple + 💎
  - Oracle: Amber + 👑
- **Sizes**: small, medium, large
- **Styling**: rgba backgrounds, glow effects, uppercase labels

#### Parlay Components

**3. ParlayBuilder** (`src/components/parlay/ParlayBuilder.tsx`)
- **Market Selection**: Multi-select from available markets (tier-gated)
- **Outcome Selection**: Radio buttons for each selected market
- **Odds Display**: Base odds + tier bonus + combined total
- **Bet Amount**: Input with quick-bet buttons
- **Validation**: Enforces max legs by tier, checks all markets open
- **Success Screen**: Shows all legs, combined odds, potential payout

### Updated v5.0 Components

**PlaceBet** - Now uses `zkpredict_v5.aleo` program ID
**CreateMarket** - Updated for v5 program
**ClaimWinnings** - Updated to return updated Reputation
**ClaimTwoWinnings** - Updated for v5 program
**ResolveMarket** - Updated for v5 program

### Design System

**Fonts**:
- Display: Syne (400-800 weight)
- Monospace: JetBrains Mono (300-700 weight)

**Colors**:
- Primary: Cyan (#06b6d4)
- Accent: Amber (#fbbf24)
- Success: Emerald (#10b981)
- Error: Red (#ef4444)

**Patterns**:
- Card-based layouts with `bg-base-200 border-2 border-base-300`
- Hover effects with `hover-lift` class
- Stagger animations for list items
- Gradient text for emphasis
- Touch-optimized with `min-h-[44px]` buttons

---

## Data Flow

### Placing a Bet (v5.0)

```
User (Browser)
  │
  ├─> PlaceBet Component
  │     │
  │     ├─ User selects outcome and amount
  │     │
  │     └─> Transaction.createTransaction(
  │           program: 'zkpredict_v5.aleo',
  │           function: 'place_bet',
  │           inputs: [payment (Credits), market_id, outcome, nonce]
  │         )
  │
  ├─> Leo Wallet
  │     │
  │     └─ Creates zero-knowledge proof
  │           └─ Amount and outcome remain FULLY PRIVATE
  │
  ├─> Aleo Blockchain
  │     │
  │     ├─ Executes place_bet
  │     │   ├─ Transfers Credits privately
  │     │   ├─ Calculates time_multiplier
  │     │   ├─ Returns Bet record (private)
  │     │   └─ Updates outcome_pools (time-weighted)
  │     │
  │     └─ User receives:
  │           ├─ Bet record (with time_multiplier)
  │           └─ bet_id for claiming
  │
  └─> UI Success Screen
        └─ Shows bet summary + save bet_id warning
```

### Placing a Parlay (v5.0)

```
User (Browser)
  │
  ├─> ParlayBuilder Component
  │     │
  │     ├─ User selects 2-5 markets + outcomes + amount
  │     │
  │     ├─ Validates tier max legs
  │     │
  │     └─> Transaction.createTransaction(
  │           program: 'zkpredict_v5.aleo',
  │           function: 'place_parlay',
  │           inputs: [payment, nonce, market1, outcome1, ..., num_legs]
  │         )
  │
  ├─> Aleo Blockchain
  │     │
  │     ├─ Validates num_legs ≤ tier_max_legs
  │     │
  │     ├─ Calculates combined_odds from base + tier_bonus
  │     │
  │     ├─ Returns Parlay record (private)
  │     │
  │     └─ Updates outcome_pools for each leg
  │
  └─> UI Success Screen
        └─ Shows parlay summary with all legs
```

### Claiming Winnings (v5.0)

```
User (Browser)
  │
  ├─> ClaimWinnings Component
  │     │
  │     ├─ User provides Bet record (from wallet)
  │     │
  │     └─> Transaction.createTransaction(
  │           program: 'zkpredict_v5.aleo',
  │           function: 'claim_winnings',
  │           inputs: [bet, reputation]
  │         )
  │
  ├─> Aleo Blockchain
  │     │
  │     ├─ Validates:
  │     │   ├─ Not already claimed
  │     │   ├─ Market resolved
  │     │   └─ Bet outcome = winning outcome
  │     │
  │     ├─ Calculates winnings with time_multiplier
  │     │
  │     ├─ Updates Reputation:
  │     │   ├─ total_wins++
  │     │   ├─ current_streak++
  │     │   ├─ total_won += winnings
  │     │   └─ Recalculates tier
  │     │
  │     └─ Returns (Winnings, updated Reputation)
  │
  └─> User Wallet
        └─ Receives Credits + updated Reputation
```

---

## Privacy Model

### v5.0 Privacy Enhancements

**Critical Fix**: Removed `bet_data` mapping that was exposing individual bet details

**What is Now FULLY Private**:
1. **Bet amounts** - Never stored on-chain in public mappings
2. **Bet outcomes** - Only owner knows their choice
3. **Parlay composition** - Which markets/outcomes in a parlay are private
4. **Reputation stats** - Total wins, accuracy, streak all private
5. **Winnings amounts** - Claim amounts private

**What Remains Public**:
1. **Aggregate pool sizes** - Time-weighted totals per outcome
2. **Market configuration** - Creator, end time, num_outcomes
3. **Resolution status** - Winning outcome after resolution
4. **Transaction existence** - That a bet/parlay was placed (but not details)

### Privacy Mechanisms

**1. Private Credits Integration**
```leo
import credits.aleo;

async transition place_bet(
    payment: credits.aleo/credits,  // Amount hidden
    ...
) -> (Bet, credits.aleo/credits, Future)
```

**2. Private Transition Inputs**
```leo
outcome: u8,  // Not public parameter = hidden
amount: u64,  // Embedded in payment Credits record
```

**3. Record-Based State**
```leo
// Only owner can decrypt
record Reputation { ... }
record Parlay { ... }
```

---

## Migration from v4

### Breaking Changes

1. **Program ID**: `zkpredict4.aleo` → `zkpredict_v5.aleo`
2. **Bet Record**: Added `time_multiplier`, `placed_at` fields
3. **Removed Mapping**: `bet_data` no longer exists
4. **Claim Signature**: Now requires full Bet record (not just bet_id)

### Migration Steps

**Frontend**:
1. Update all program IDs to `zkpredict_v5.aleo`
2. Update `ZKPREDICT_PROGRAM_ID` in `src/types/index.ts`
3. Add new v5 types (Reputation, Parlay, ReputationProof)
4. Update claim flow to use Bet records

**Smart Contract**:
1. Deploy new `zkpredict_v5.aleo` program
2. Test all transitions on devnet
3. Deploy to testnet with funded account

**User Experience**:
- Old v4 bets cannot be claimed on v5 contract
- Users must claim v4 winnings before migration
- Reputation starts fresh in v5 (no historical data)

---

## Development Workflow

### Quick Start

```bash
# Frontend development
cd zkPredict
yarn install
yarn dev

# Smart contract build
cd zkPredict/program
leo build

# Run test suite
leo test
```

### Testing v5 Features

**Time-Weighted Betting**:
```bash
# Test early bet (2.0x)
leo execute place_bet ... --network devnet

# Simulate time passage (use block height + 30000)
# Test mid-period bet (1.5x)
leo execute place_bet ... --network devnet
```

**Reputation System**:
```bash
# Initialize reputation
leo execute init_reputation --network devnet

# Place bet → resolve → claim → check tier upgrade
leo execute place_bet ...
leo execute resolve_market ...
leo execute claim_winnings ...
```

**Parlay Betting**:
```bash
# Test 2-leg parlay
leo execute place_parlay \
  "123field" "1u8" \
  "456field" "0u8" \
  "2u8" \
  --network devnet
```

---

## Deployment

### Smart Contract Deployment ✅ COMPLETED

**Program ID**: `zkpredict_v5.aleo`

**Deployment Transaction**:
- **Transaction ID**: `at1j6fcl5u5ra8p4ltr4l60xyuycx55dul5ts2mzamd6s6aae0n3qzqs8m5gu`
- **Network**: Aleo TestnetBeta
- **Deployed**: February 13, 2026
- **Explorer**: https://testnet.explorer.provable.com/transaction/at1j6fcl5u5ra8p4ltr4l60xyuycx55dul5ts2mzamd6s6aae0n3qzqs8m5gu

**Deployment Statistics**:
- **Total Variables**: 1,800,512 (86% of network limit)
- **Total Constraints**: 1,401,568
- **Statements**: 1,160 (after optimization)
- **Synthesis Time**: ~8 minutes
- **Total Cost**: 37.957080 credits
  - Transaction Storage: 34.632287 credits
  - Program Synthesis: 2.322793 credits
  - Namespace: 1.000000 credits
  - Constructor: 0.002000 credits

**Constructor Implementation**:
```leo
@noupgrade
async constructor() {
    // The Leo compiler automatically generates the constructor logic.
}
```

**Critical**: The `@noupgrade` annotation is REQUIRED for deployment. Without it, deployment fails with HTTP 500 error.

### Deployment Commands

```bash
cd zkPredict/program

# Build
leo build

# Deploy to testnet (non-interactive)
leo deploy --network testnet -y --broadcast

# Verify deployment
leo query markets "1field" --network testnet
```

**See**: `/program/DEPLOYMENT.md` for complete deployment troubleshooting and best practices.

### Frontend Deployment (Pending)

**Required Updates**:
1. Update `ZKPREDICT_PROGRAM_ID` in `src/types/index.ts` to `zkpredict_v5.aleo`
2. Test all components with deployed contract

**Vercel Deployment**:
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

**Verification**:
- Check wallet connects
- Test market creation
- Test bet placement with v5 program
- Test parlay creation
- Test reputation initialization

---

## Appendix

### v5.0 Constants Reference

```typescript
// Time multipliers
export const TIME_MULTIPLIERS = {
  EARLY: 2.0,    // 0-6 hours
  MID: 1.5,      // 6-12 hours
  LATE: 1.2,     // 12-24 hours
  BASE: 1.0,     // 24+ hours
};

// Parlay base odds
export const PARLAY_BASE_ODDS = {
  2: 3.5,   // 2-leg
  3: 7.0,   // 3-leg
  4: 14.0,  // 4-leg
  5: 28.0,  // 5-leg
};

// Tier benefits
export const TIER_MAX_LEGS: Record<ReputationTier, number> = {
  [ReputationTier.Novice]: 2,
  [ReputationTier.Skilled]: 3,
  [ReputationTier.Expert]: 4,
  [ReputationTier.Oracle]: 5,
};

export const TIER_BONUSES: Record<ReputationTier, number> = {
  [ReputationTier.Novice]: 1.0,
  [ReputationTier.Skilled]: 1.1,
  [ReputationTier.Expert]: 1.2,
  [ReputationTier.Oracle]: 1.3,
};
```

---

**End of v5.0 Architecture Documentation**

*For development instructions, see CLAUDE.md*
*For migration details, see V4_VS_V5_ANALYSIS.md*
