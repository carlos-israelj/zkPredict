# zkPredict Architecture (v4)

> **⚠️ DEPRECATED:** This document describes v4 (zkpredict4.aleo)
> **For v5.0 documentation, see [ARCHITECTURE_V5.md](./ARCHITECTURE_V5.md)**
>
> **Last Updated:** 2026-02-10
> **Version:** 0.1.0 (Wave 1-4 Implementation + Privacy Enhancements)

## Table of Contents

- [Overview](#overview)
- [Architecture Philosophy](#architecture-philosophy)
- [Tech Stack](#tech-stack)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Data Flow](#data-flow)
- [Key Components Reference](#key-components-reference)
- [Privacy Model](#privacy-model)
- [Network Configuration](#network-configuration)
- [Development Workflow](#development-workflow)
- [File Structure](#file-structure)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

---

## Overview

**zkPredict** is a full-stack decentralized prediction market platform built on the Aleo blockchain. It combines privacy-preserving smart contracts written in Leo with a modern Next.js frontend to create a seamless user experience for private betting on future events.

### Core Capabilities

- **Private Betting**: Individual bet amounts and choices are hidden using zero-knowledge proofs
- **Multi-Outcome Markets**: Support for 2-255 outcomes per market (not just binary yes/no)
- **Market Categories**: Sports, Politics, Crypto, Weather, and Other
- **Auto-Resolution**: Optional automatic market resolution after deadline
- **Parimutuel Pools**: Dynamic odds based on pool distribution
- **Double-Claim Prevention**: On-chain tracking to prevent duplicate winnings claims
- **Batch Operations**: Claim multiple winning bets in a single transaction

---

## Architecture Philosophy

zkPredict follows a **hybrid on-chain/off-chain architecture** to optimize for both privacy and user experience:

### On-Chain (Aleo Blockchain)
**Purpose:** Critical state that requires cryptographic guarantees

- **Private Records**: Bet and Winnings records (visible only to owner)
- **Public Mappings**: Market state, pool balances, resolution status
- **Business Logic**: All betting rules, validation, and payout calculations

### Off-Chain (Supabase/In-Memory)
**Purpose:** Metadata and discoverability

- Market titles, descriptions, and images
- Outcome labels (e.g., "Team A wins", "Team B wins")
- Search and filtering capabilities
- Caching for faster UI updates

### Why Hybrid?

1. **Privacy**: Sensitive betting data stays on-chain in encrypted records
2. **UX**: Rich metadata improves discoverability without blockchain bloat
3. **Performance**: Off-chain caching reduces RPC calls
4. **Cost**: Storing large text on-chain is expensive

---

## Tech Stack

### Smart Contract Layer
- **Language**: Leo (Aleo's domain-specific language for zero-knowledge programs)
- **Program ID**: `zkpredict4.aleo`
- **Network**: Aleo TestnetBeta
- **Deployment**: Immutable contract with `@noupgrade` flag

### Frontend Layer
- **Framework**: Next.js 16.1.6 (Pages Router)
- **UI Library**: React 19.0.0
- **Styling**: TailwindCSS 4.1.18 + DaisyUI 5.5.14
- **State Management**: React Query 3.39.3
- **Wallet Integration**: @demox-labs/aleo-wallet-adapter (v0.0.22-0.0.36)
- **Database**: Supabase (with in-memory fallback)
- **Build Tool**: Webpack 5 (with custom WASM configuration)

### Infrastructure
- **RPC Provider**: Provable API (https://api.provable.com/v2/testnet)
- **Explorer**: Provable Explorer (https://testnet.explorer.provable.com)
- **Hosting**: Vercel-ready PWA configuration

---

## Smart Contract Architecture

### Program: `zkpredict4.aleo`

Location: `zkPredict/program/src/main.leo`

#### Private State (Records)

**1. Bet Record**
```leo
record Bet {
    owner: address,
    market_id: field,
    bet_id: field,          // Unique identifier (BHP256 hash of nonce)
    outcome: u8,            // Outcome index (0 to num_outcomes-1)
    amount: u64,            // Bet amount in microcredits
    odds_at_bet: u64,       // Odds when bet was placed (scaled by 10000)
}
```

**Privacy Guarantee**: Only the owner can see this record. The blockchain transaction reveals that a bet was placed, but NOT the amount or outcome.

**2. Winnings Record**
```leo
record Winnings {
    owner: address,
    amount: u64,            // Winnings in microcredits
    market_id: field,
}
```

**Privacy Guarantee**: Only the owner knows they won and how much. Claiming winnings is a private operation.

#### Public State (Mappings)

**1. Markets Mapping**
```leo
mapping markets: field => Market;

struct Market {
    creator: address,
    end_time: u32,
    resolved: bool,
    winning_outcome: u8,
    num_outcomes: u8,
    category: u8,
    auto_resolve: bool,
}
```

**2. Outcome Pools Mapping**
```leo
mapping outcome_pools: field => u64;
```
- **Key**: `BHP256::hash_to_field(market_id + outcome_index)`
- **Value**: Total microcredits bet on this outcome

**3. Legacy Binary Pools**
```leo
mapping yes_pool: field => u64;
mapping no_pool: field => u64;
```
- Maintained for backwards compatibility with Wave 1 binary markets

**4. Claimed Bets Mapping**
```leo
mapping claimed_bets: field => bool;
```
- Prevents double-claiming using bet_id as key

**5. Bet Data Mapping**
```leo
mapping bet_data: field => BetData;

struct BetData {
    bettor: address,
    market_id: field,
    outcome: u8,
    amount: u64,
    odds_at_bet: u64,
}
```
- Allows claiming with just bet_id (without needing the full Bet record)
- Critical for UX: users only need to save their bet_id

#### Transitions (Public Functions)

**1. create_market**
```leo
async transition create_market(
    public market_id: field,
    public end_time: u32,
    public num_outcomes: u8,
    public category: u8,
    public auto_resolve: bool
) -> Future
```
- **Inputs**: All public (visible in transaction)
- **Validation**: num_outcomes ≥ 2, category ≤ 4
- **Cost**: ~0.1 credits transaction fee

**2. place_bet** (Privacy-Enhanced)
```leo
async transition place_bet(
    public market_id: field,
    outcome: u8,              // PRIVATE
    amount: u64,              // PRIVATE
    nonce: field              // PRIVATE
) -> (Bet, Future)
```
- **Privacy**: Outcome and amount are PRIVATE inputs (not visible in transaction)
- **Returns**: Bet record to user (private), Future for on-chain finalization
- **bet_id Generation**: `BHP256::hash_to_field(nonce)` for uniqueness
- **Pool Update**: Increments `outcome_pools[hash(market_id, outcome)]`
- **Odds Calculation**: Simplified formula - full parimutuel odds calculated at claim time

**3. resolve_market**
```leo
async transition resolve_market(
    public market_id: field,
    public winning_outcome: u8,
    public current_time: u32
) -> Future
```
- **Authorization**: Creator OR (auto_resolve enabled AND past end_time)
- **Validation**: Ensures market not already resolved, winning_outcome < num_outcomes

**4. claim_winnings**
```leo
async transition claim_winnings(
    public bet_id: field
) -> (Winnings, Future)
```
- **Input**: Just the bet_id (user doesn't need full Bet record)
- **Validation**:
  - Bet not already claimed
  - Claimer is the original bettor
  - Market is resolved
  - Bet outcome matches winning outcome
- **Calculation**: Parimutuel formula
  ```
  winnings = (bet_amount / winning_pool) × total_pool
  ```
- **Double-Claim Prevention**: Sets `claimed_bets[bet_id] = true`

**5. claim_two_winnings** (Batch Operation)
```leo
async transition claim_two_winnings(
    public bet_id_1: field,
    public bet_id_2: field
) -> (Winnings, Future)
```
- Claims two winning bets in a single transaction
- Reduces gas costs and improves privacy (fewer transactions = less metadata leakage)

#### Odds Calculation

**At Bet Time** (Simplified):
```rust
let base_odds: u64 = (num_outcomes as u64) * 10000u64;
let odds = (base_odds * current_pool + 10000u64 * amount) / (current_pool + amount);
```

**At Claim Time** (Parimutuel):
```rust
// Binary markets (use legacy pools for accuracy)
let total_pool = yes_pool + no_pool;
let winning_pool = (winning_outcome == 1) ? yes_pool : no_pool;

// Multi-outcome markets (estimate total from winning pool)
let total_pool = winning_pool * num_outcomes;

// Final winnings
let winnings = (bet_amount * total_pool) / winning_pool;
```

---

## Frontend Architecture

### Next.js Configuration

**Router**: Pages Router (src/pages/)
**TypeScript**: Strict mode enabled
**Path Aliases**: `@/*` maps to `src/*`

#### Critical Webpack Configuration

Location: `next.config.js`

**WASM Support** (Required for Aleo SDK):
```javascript
config.experiments = {
  asyncWebAssembly: true,
  syncWebAssembly: true,
  topLevelAwait: true,
};
```

**Node Polyfills** (Required for browser compatibility):
```javascript
config.resolve.fallback = {
  stream: require.resolve('stream-browserify'),
  fs: require.resolve('browserify-fs'),
};
```

**WASM File Handling**:
```javascript
config.module.rules.push({
  test: /\.wasm$/,
  include: /node_modules[\\/](@demox-labs|@provablehq)[\\/]/,
  type: 'javascript/auto',
  loader: 'file-loader',
});
```

**Why This Matters**: Removing these configurations will break Aleo wallet integration and blockchain interaction.

### Application Entry Point

Location: `src/pages/_app.tsx`

**Provider Hierarchy**:
```
QueryClientProvider (React Query)
  └─ Hydrate
      └─ WalletProvider (Aleo Wallet Adapter)
          └─ WalletModalProvider
              └─ ThemeProvider
                  └─ Layout
                      └─ Page Component
```

**Wallet Configuration**:
```typescript
const wallets = [
  new LeoWalletAdapter({ appName: 'zkPredict' })
];

<WalletProvider
  wallets={wallets}
  decryptPermission={DecryptPermission.UponRequest}
  network={WalletAdapterNetwork.TestnetBeta}
  autoConnect
/>
```

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── aleo/           # Wallet integration
│   ├── icons/          # SVG icons
│   ├── markets/        # Market-specific components
│   │   ├── CategoryFilter.tsx
│   │   ├── ClaimTwoWinnings.tsx
│   │   ├── ClaimWinnings.tsx
│   │   ├── CreateMarket.tsx
│   │   ├── MarketCard.tsx
│   │   ├── MarketList.tsx
│   │   ├── PlaceBet.tsx
│   │   ├── ResolveMarket.tsx
│   │   ├── SortFilter.tsx
│   │   └── StatusFilter.tsx
│   └── ui/             # Generic UI components
│       ├── BackArrow.tsx
│       ├── Footer.tsx
│       ├── SkeletonLoader.tsx
│       ├── button/
│       └── loader.tsx
├── hooks/              # Custom React hooks
│   ├── use-is-mounted.ts
│   ├── use-window-scroll.ts
│   ├── useMarketMetadata.ts
│   └── useOnChainMarket.ts
├── layouts/            # Page layouts
│   └── _layout.tsx
├── lib/                # Core libraries
│   ├── aleo.ts         # On-chain data fetching
│   ├── db.ts           # In-memory database (dev)
│   ├── db-supabase.ts  # Supabase database (prod)
│   └── supabase.ts     # Supabase client
├── pages/              # Next.js pages (file-based routing)
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── markets.tsx
│   ├── portfolio.tsx
│   ├── 404.tsx
│   ├── api/
│   │   └── markets/
│   │       ├── index.ts
│   │       └── [id].ts
│   └── markets/
│       └── [id].tsx
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
```

---

## Data Flow

### Creating a Market

```
User (Browser)
  │
  ├─> CreateMarket Component
  │     │
  │     ├─ User fills form (title, outcomes, category, deadline)
  │     │
  │     └─> Transaction.createTransaction(
  │           program: 'zkpredict4.aleo',
  │           function: 'create_market',
  │           inputs: [market_id, end_time, num_outcomes, category, auto_resolve]
  │         )
  │
  ├─> Leo Wallet Extension
  │     │
  │     ├─ User approves transaction
  │     │
  │     └─ Broadcasts to Aleo Network
  │
  ├─> Aleo Blockchain
  │     │
  │     └─ Executes create_market transition
  │           └─ Stores Market in markets mapping
  │
  └─> Backend API (POST /api/markets)
        │
        └─ Saves metadata to Supabase
              └─ { marketId, title, description, outcomeLabels }
```

### Placing a Bet

```
User (Browser)
  │
  ├─> PlaceBet Component
  │     │
  │     ├─ User selects outcome and amount
  │     │
  │     ├─ Generates random nonce: Date.now()field
  │     │
  │     └─> Transaction.createTransaction(
  │           program: 'zkpredict4.aleo',
  │           function: 'place_bet',
  │           inputs: [market_id, outcome (PRIVATE), amount (PRIVATE), nonce (PRIVATE)]
  │         )
  │
  ├─> Leo Wallet Extension
  │     │
  │     └─ Creates zero-knowledge proof
  │           └─ Transaction reveals ONLY that a bet was placed
  │               (amount and outcome remain hidden)
  │
  ├─> Aleo Blockchain
  │     │
  │     ├─ Executes place_bet transition
  │     │   ├─ Generates bet_id = BHP256::hash(nonce)
  │     │   ├─ Returns Bet record to user (private)
  │     │   └─ Updates outcome_pools[hash(market_id, outcome)]
  │     │       └─ Stores bet_data[bet_id] for later claiming
  │     │
  │     └─ User receives:
  │           ├─ Bet record (saved in wallet, contains bet details)
  │           └─ bet_id (displayed in UI - MUST BE SAVED!)
  │
  └─> UI Success Screen
        │
        └─ Shows bet_id with prominent "SAVE THIS!" warning
```

### Claiming Winnings

```
User (Browser)
  │
  ├─> ClaimWinnings Component
  │     │
  │     ├─ User enters saved bet_id
  │     │
  │     └─> Transaction.createTransaction(
  │           program: 'zkpredict4.aleo',
  │           function: 'claim_winnings',
  │           inputs: [bet_id]
  │         )
  │
  ├─> Aleo Blockchain
  │     │
  │     ├─ Looks up bet_data[bet_id]
  │     │
  │     ├─ Validates:
  │     │   ├─ claimed_bets[bet_id] == false
  │     │   ├─ caller == bet_data[bet_id].bettor
  │     │   ├─ market.resolved == true
  │     │   └─ bet_data[bet_id].outcome == market.winning_outcome
  │     │
  │     ├─ Calculates winnings (parimutuel formula)
  │     │
  │     ├─ Sets claimed_bets[bet_id] = true
  │     │
  │     └─ Returns Winnings record to user
  │
  └─> User's Wallet
        │
        └─ Receives credits (private, only user knows amount)
```

### Data Synchronization

```
Frontend State
  │
  ├─> useOnChainMarket Hook
  │     │
  │     ├─ Fetches from Aleo RPC every 30s
  │     │   └─ GET https://api.provable.com/v2/testnet/program/zkpredict4.aleo/mapping/markets/{market_id}
  │     │
  │     └─ Returns: { creator, end_time, resolved, winning_outcome, ... }
  │
  └─> useMarketMetadata Hook
        │
        ├─ Fetches from local API once
        │   └─ GET /api/markets/{market_id}
        │       └─ Queries Supabase
        │
        └─ Returns: { title, description, outcomeLabels, imageUrl }
```

---

## Key Components Reference

### CreateMarket Component
**Location**: `src/components/markets/CreateMarket.tsx`
**Purpose**: Multi-step form for creating prediction markets

**Features**:
- **Step 1**: Market question (title + description)
- **Step 2**: Category selection (Sports, Politics, Crypto, Weather, Other)
- **Step 3**: Outcome configuration (2-10 outcomes with labels)
- **Step 4**: Trading deadline (date + time, auto-resolve option)
- Privacy information panel (what's public vs private)
- Success screen with transaction tracking instructions

**Transaction Flow**:
```typescript
const inputs = [
  `${Date.now()}field`,           // market_id
  `${endTimestamp}u32`,            // end_time
  `${numOutcomes}u8`,              // num_outcomes
  `${category}u8`,                 // category
  autoResolve.toString()           // auto_resolve (bool)
];

const transaction = Transaction.createTransaction(
  publicKey,
  'testnetbeta',
  'zkpredict4.aleo',
  'create_market',
  inputs,
  100000,  // 0.1 credits fee
  false    // public fee
);
```

**After Transaction**:
- Saves metadata to `/api/markets` (POST)
- Shows success screen with transaction tracking guide
- Provides "Create Another Market" and "View All Markets" buttons

### PlaceBet Component
**Location**: `src/components/markets/PlaceBet.tsx`
**Purpose**: Interactive betting interface with live odds

**Features**:
- **Outcome Selection**: Radio buttons with live odds display
- **Bet Amount Input**: With quick-bet buttons (10%, 25%, 50%, MAX)
- **Wallet Balance**: Real-time balance fetching from Aleo blockchain
- **Potential Winnings Calculator**: Shows potential return based on current odds
- **Privacy Panel**: Explains what data is public vs private
- Success screen with bet_id (prominently displayed with save warning)

**Balance Fetching**:
```typescript
// Query Aleo blockchain for wallet balance
const response = await fetch(
  `https://api.provable.com/v2/testnet/program/credits.aleo/mapping/account/${publicKey}`
);
const balanceData = await response.json();
const balanceMicrocredits = parseInt(balanceData.replace('u64', ''));
const balanceCredits = balanceMicrocredits / 1_000_000;
```

**Odds Calculation** (Client-side preview):
```typescript
const totalPool = pools.reduce((sum, pool) => sum + pool, 0);
const oddsData = pools.map((poolSize, index) => ({
  outcome: index,
  odds: poolSize > 0 ? totalPool / poolSize : 0,
  probability: totalPool > 0 ? (poolSize / totalPool) * 100 : 0,
  poolSize,
  poolShare: totalPool > 0 ? (poolSize / totalPool) * 100 : 0,
}));
```

### MarketCard Component
**Location**: `src/components/markets/MarketCard.tsx`
**Purpose**: Compact market display for browse/list pages

**Visual Elements**:
- Category badge (color-coded by category)
- Status badge (Live/Ended/Resolved with icons)
- Time remaining countdown
- Title (2-line clamp)
- Description (2-line clamp, hidden on small screens)
- Outcome buttons showing percentage distribution
- Total volume display
- Winner badge (if resolved)

**Category Color Scheme**:
```typescript
const categoryColors = {
  0: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#059669' },  // Sports - Emerald
  1: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#2563eb' },  // Politics - Blue
  2: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#d97706' },  // Crypto - Amber
  3: { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', text: '#7c3aed' },  // Weather - Purple
  4: { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', text: '#db2777' },  // Other - Pink
};
```

### MarketList Component
**Location**: `src/components/markets/MarketList.tsx`
**Purpose**: Grid layout with filtering and sorting

**Features**:
- Category filter tabs
- Status filter (All, Live, Ended, Resolved)
- Sort options (Newest, Ending Soon, Most Volume)
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Empty state handling

### ResolveMarket Component
**Location**: `src/components/markets/ResolveMarket.tsx`
**Purpose**: Market creator resolves the market with winning outcome

**Authorization**:
- Only market creator OR
- Anyone if auto_resolve enabled AND past end_time

**Transaction**:
```typescript
const inputs = [
  market.marketId,
  `${winningOutcome}u8`,
  `${Math.floor(Date.now() / 1000)}u32`  // current_time for validation
];
```

### ClaimWinnings Component
**Location**: `src/components/markets/ClaimWinnings.tsx`
**Purpose**: Users claim winnings using their bet_id

**UI Flow**:
1. User pastes bet_id from saved record
2. Component validates bet_id format
3. Checks if already claimed (via RPC)
4. Submits claim transaction
5. Success screen shows amount claimed

---

## Privacy Model

### What is Public (Visible on Blockchain)

1. **Market Configuration**
   - Creator address
   - End time
   - Number of outcomes
   - Category
   - Auto-resolve setting
   - Resolution status and winning outcome

2. **Aggregated Pool Data**
   - Total amount bet on each outcome
   - Overall pool distribution percentages
   - Current odds for each outcome

3. **Transaction Existence**
   - That a market was created (but not title/description)
   - That a bet was placed (but not amount or choice)
   - That winnings were claimed (but not amount won)

### What is Private (Hidden by Zero-Knowledge Proofs)

1. **Individual Bet Data**
   - Bet amount (only stored in private Bet record)
   - Outcome chosen (only stored in private Bet record)
   - Odds locked in (only stored in private Bet record)
   - User identity (address is in record, not in transaction broadcast)

2. **Winnings Data**
   - Amount won (only stored in private Winnings record)
   - That a specific user won (winning addresses not revealed)

3. **Claiming Activity**
   - Which users are claiming
   - How much they are claiming

### Privacy Mechanisms

**1. Private Transition Inputs**
```leo
async transition place_bet(
    public market_id: field,
    outcome: u8,     // PRIVATE - not visible in transaction
    amount: u64,     // PRIVATE - not visible in transaction
    nonce: field     // PRIVATE - not visible in transaction
)
```

**2. Private Records**
```leo
// Only the owner can decrypt this record
record Bet {
    owner: address,
    market_id: field,
    bet_id: field,
    outcome: u8,
    amount: u64,
    odds_at_bet: u64,
}
```

**3. Bet ID Hashing**
```leo
// bet_id is a hash, preventing linkage between transaction and bet
let bet_id: field = BHP256::hash_to_field(nonce);
```

**4. Separation of Bet Placement and Pool Updates**
- User receives private Bet record
- Blockchain only updates aggregate pool totals
- No linkage between specific user and pool contribution

---

## Network Configuration

### Current Network: TestnetBeta

**Configuration Location**: `src/types/index.ts`

```typescript
export const CURRENT_NETWORK = WalletAdapterNetwork.TestnetBeta;
export const CURRENT_RPC_URL = "https://testnetbeta.aleorpc.com";
export const EXPLORER_URL = "https://testnet.explorer.provable.com";
```

### RPC Endpoints

**Primary RPC** (Provable API):
```
https://api.provable.com/v2/testnet
```

**Endpoints Used**:
- `GET /program/{program_id}/mapping/{mapping_name}/{key}` - Fetch mapping value
- `GET /transaction/{tx_id}` - Fetch transaction details
- `GET /program/credits.aleo/mapping/account/{address}` - Fetch wallet balance

**Wallet RPC**:
```
https://testnetbeta.aleorpc.com
```

### Switching Networks

To switch from Testnet to Mainnet:

1. Update `src/types/index.ts`:
```typescript
export const CURRENT_NETWORK = WalletAdapterNetwork.MainnetBeta;
export const CURRENT_RPC_URL = "https://mainnet.aleorpc.com";
export const EXPLORER_URL = "https://explorer.provable.com";
```

2. Update `src/pages/_app.tsx`:
```typescript
<WalletProvider
  wallets={wallets}
  network={WalletAdapterNetwork.MainnetBeta}  // Change here
  autoConnect
/>
```

3. Update `src/components/markets/*.tsx` transaction calls:
```typescript
const transaction = Transaction.createTransaction(
  publicKey,
  'mainnetbeta',  // Change from 'testnetbeta'
  'zkpredict4.aleo',
  functionName,
  inputs,
  fee,
  false
);
```

4. Update `src/lib/aleo.ts` RPC URL:
```typescript
const NETWORK_URL = 'https://api.provable.com/v2/mainnet';
```

---

## Development Workflow

### Setup

```bash
# Clone repository
git clone <repo-url>
cd zkPredict

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env
# Edit .env with:
# - NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
# - NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
```

### Development

```bash
# Start Next.js dev server (removes duplicate node_modules, starts dev server)
yarn dev

# Type-check in watch mode (recommended in separate terminal)
yarn ts:watch

# Or run both concurrently
yarn dev:ts
```

### Smart Contract Development

```bash
# Build Leo program
cd program
leo build

# Deploy to testnet (requires Aleo CLI and funded wallet)
leo deploy --network testnet

# Execute function (example)
leo execute create_market \
  "1field" \
  "1750000000u32" \
  "2u8" \
  "0u8" \
  "false" \
  --network testnet
```

### Production Build

```bash
# Type-check
yarn ts

# Lint code
yarn lint

# Build for production
yarn build

# Start production server
yarn start
```

### Cleaning

```bash
# Remove build artifacts and node_modules
yarn clean

# Remove duplicate nested node_modules (common issue with Aleo SDK)
yarn delete-local-modules
```

---

## File Structure

### Complete Directory Tree

```
zkPredict/
├── program/                         # Leo smart contract
│   ├── src/
│   │   └── main.leo                # zkpredict4.aleo program
│   ├── build/                      # Compiled Leo artifacts
│   │   └── main.aleo
│   ├── program.json                # Program manifest
│   └── .env                        # Network configuration (not in git)
│
├── src/                            # Next.js application
│   ├── assets/
│   │   └── css/
│   │       └── globals.css         # Global styles + Tailwind imports
│   │
│   ├── components/
│   │   ├── aleo/
│   │   │   └── rpc.ts              # RPC utilities
│   │   ├── icons/
│   │   │   ├── discord.tsx
│   │   │   ├── home.tsx
│   │   │   └── twitter.tsx
│   │   ├── markets/
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── ClaimTwoWinnings.tsx
│   │   │   ├── ClaimWinnings.tsx
│   │   │   ├── CreateMarket.tsx    # Market creation form
│   │   │   ├── MarketCard.tsx      # Market display card
│   │   │   ├── MarketList.tsx      # Market grid with filters
│   │   │   ├── PlaceBet.tsx        # Betting interface
│   │   │   ├── ResolveMarket.tsx   # Market resolution
│   │   │   ├── SortFilter.tsx
│   │   │   └── StatusFilter.tsx
│   │   └── ui/
│   │       ├── BackArrow.tsx
│   │       ├── Footer.tsx
│   │       ├── loader.tsx
│   │       ├── SkeletonLoader.tsx  # Loading states
│   │       └── button/
│   │           ├── button.tsx
│   │           ├── button-drip.tsx
│   │           ├── button-loader.tsx
│   │           └── index.ts
│   │
│   ├── hooks/
│   │   ├── use-is-mounted.ts
│   │   ├── use-window-scroll.ts
│   │   ├── useMarketMetadata.ts    # Off-chain metadata fetching
│   │   └── useOnChainMarket.ts     # On-chain state fetching + polling
│   │
│   ├── layouts/
│   │   └── _layout.tsx             # Main layout wrapper
│   │
│   ├── lib/
│   │   ├── aleo.ts                 # Aleo blockchain RPC client
│   │   ├── db.ts                   # In-memory database (dev)
│   │   ├── db-supabase.ts          # Supabase database (prod)
│   │   └── supabase.ts             # Supabase client config
│   │
│   ├── pages/
│   │   ├── _app.tsx                # App entry point (providers)
│   │   ├── _document.tsx           # HTML document template
│   │   ├── index.tsx               # Landing page
│   │   ├── markets.tsx             # Markets browse page
│   │   ├── portfolio.tsx           # User portfolio page
│   │   ├── 404.tsx                 # Not found page
│   │   ├── api/
│   │   │   └── markets/
│   │   │       ├── index.ts        # GET /api/markets, POST /api/markets
│   │   │       └── [id].ts         # GET /PUT /DELETE /api/markets/[id]
│   │   ├── markets/
│   │   │   └── [id].tsx            # Market detail page
│   │   └── global.d.ts
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   │
│   └── utils/                      # Utility functions (if any)
│
├── public/                         # Static assets
│   ├── logo.svg
│   ├── manifest.json               # PWA manifest
│   └── icons/
│
├── .env.example                    # Environment variables template
├── .gitignore
├── ARCHITECTURE.md                 # This file
├── CLAUDE.md                       # Project instructions for Claude Code
├── README.md
├── next.config.js                  # Next.js + Webpack + WASM config
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── yarn.lock
```

### Configuration Files

**package.json**
- Scripts for dev, build, deploy
- Aleo wallet adapter dependencies (v0.0.22-0.0.36)
- Next.js 16.1.6, React 19.0.0
- Supabase client 2.93.2
- DaisyUI 5.5.14 + Tailwind 4.1.18

**next.config.js**
- WASM module support (critical for Aleo SDK)
- Node.js polyfills (stream, fs, Buffer, process)
- PWA configuration
- TypeScript/ESLint error handling for production builds

**tsconfig.json**
- Path alias: `@/*` → `./src/*`
- Strict mode enabled
- Target: ES6
- JSX: react-jsx (React 19)

---

## API Endpoints

### Market Metadata API

**Base Path**: `/api/markets`

#### GET /api/markets
**Purpose**: Fetch all markets or search markets

**Query Parameters**:
- `search` (optional): Search term for title/description

**Response**:
```json
[
  {
    "marketId": "1739123456000field",
    "title": "Will Bitcoin reach $100k by Dec 2025?",
    "description": "Market resolves YES if...",
    "outcomeLabels": ["Yes", "No"],
    "imageUrl": null,
    "createdAt": 1739123456000,
    "updatedAt": 1739123456000
  }
]
```

#### POST /api/markets
**Purpose**: Create market metadata

**Request Body**:
```json
{
  "marketId": "1739123456000field",
  "title": "Will Bitcoin reach $100k by Dec 2025?",
  "description": "Market resolves YES if...",
  "outcomeLabels": ["Yes", "No"],
  "imageUrl": null
}
```

**Response**:
```json
{
  "marketId": "1739123456000field",
  "title": "...",
  "createdAt": 1739123456000,
  "updatedAt": 1739123456000
}
```

#### GET /api/markets/[id]
**Purpose**: Fetch single market metadata

**Response**:
```json
{
  "marketId": "1739123456000field",
  "title": "Will Bitcoin reach $100k by Dec 2025?",
  "description": "...",
  "outcomeLabels": ["Yes", "No"],
  "imageUrl": null,
  "createdAt": 1739123456000,
  "updatedAt": 1739123456000
}
```

#### PUT /api/markets/[id]
**Purpose**: Update market metadata

**Request Body**: Same as POST (partial updates allowed)

#### DELETE /api/markets/[id]
**Purpose**: Delete market metadata

**Response**:
```json
{ "success": true }
```

### Database Backend

**Production**: Supabase (if NEXT_PUBLIC_SUPABASE_URL configured)
**Development**: In-memory Map fallback

**Supabase Schema**:
```sql
CREATE TABLE markets_metadata (
  market_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  outcome_labels TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Deployment

### Frontend Deployment (Vercel)

**Prerequisites**:
- Vercel account
- Supabase project (for production database)

**Environment Variables** (Vercel Dashboard):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

**Build Configuration**:
- Framework: Next.js
- Build Command: `yarn build`
- Output Directory: `.next`
- Install Command: `yarn install`

**Deployment Steps**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Important Notes**:
- Vercel automatically handles Next.js routing
- WASM modules are supported (handled by next.config.js)
- PWA service workers are generated at build time
- Static assets are served from CDN

### Smart Contract Deployment

**Prerequisites**:
- Aleo CLI installed (`curl -sL https://install.aleo.tools | bash`)
- Funded Aleo wallet (testnet faucet: https://faucet.aleo.org)

**Deployment Steps**:
```bash
cd zkPredict/program

# Build program
leo build

# Deploy to testnet
leo deploy --network testnet

# Note the deployed program ID (should be zkpredict4.aleo)
```

**Post-Deployment**:
1. Verify deployment on explorer: `https://testnet.explorer.provable.com/program/zkpredict4.aleo`
2. Update frontend if program ID changed (unlikely with named deployment)
3. Test transitions with `leo execute`

### Database Setup (Supabase)

**1. Create Supabase Project**
- Go to https://supabase.com
- Create new project
- Note URL and anon key

**2. Run Migration**
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

-- Enable Row Level Security (optional, for public read)
ALTER TABLE markets_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public markets are viewable by everyone"
  ON markets_metadata FOR SELECT
  USING (true);

CREATE POLICY "Users can insert markets"
  ON markets_metadata FOR INSERT
  WITH CHECK (true);
```

**3. Update Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

### Monitoring and Maintenance

**Frontend Monitoring**:
- Vercel Analytics (automatic)
- Next.js build logs
- Browser console for client-side errors

**Smart Contract Monitoring**:
- Explorer: `https://testnet.explorer.provable.com/program/zkpredict4.aleo`
- RPC health: Check CURRENT_RPC_URL accessibility
- Transaction success rate: Monitor wallet transaction history

**Database Monitoring**:
- Supabase Dashboard (usage, performance)
- Check API endpoint response times
- Monitor storage usage

---

## Appendix

### Type Definitions Reference

**Location**: `src/types/index.ts`

```typescript
// Network configuration
export const CURRENT_NETWORK: WalletAdapterNetwork;
export const CURRENT_RPC_URL: string;
export const EXPLORER_URL: string;
export const ZKPREDICT_PROGRAM_ID = 'zkpredict4.aleo';

// Market categories
export enum MarketCategory {
  Sports = 0,
  Politics = 1,
  Crypto = 2,
  Weather = 3,
  Other = 4,
}

// Market type
export type Market = {
  marketId: string;
  creator: string;
  endTime: number;
  resolved: boolean;
  winningOutcome: number;
  numOutcomes: number;
  category: MarketCategory;
  autoResolve: boolean;
  title?: string;
  description?: string;
  outcomeLabels?: string[];
};

// Bet type
export type Bet = {
  owner: string;
  marketId: string;
  betId: string;
  outcome: number;
  amount: number;
  oddsAtBet: number;
  timestamp?: number;
};

// Winnings type
export type Winnings = {
  owner: string;
  amount: number;
  marketId: string;
  claimedAt?: number;
};

// Pool data
export type MarketPools = {
  marketId: string;
  pools: number[];
  totalPool: number;
  timestamp: number;
};

// Odds calculation result
export type OddsData = {
  outcome: number;
  odds: number;
  probability: number;
  poolSize: number;
  poolShare: number;
};
```

### Common Pitfalls and Solutions

**1. WASM Module Loading Errors**
- **Error**: `WebAssembly module is included in initial chunk`
- **Solution**: Ensure `next.config.js` has proper WASM configuration (see Frontend Architecture section)

**2. Duplicate Aleo SDK Modules**
- **Error**: Multiple instances of React, conflicts in wallet adapter
- **Solution**: Run `yarn delete-local-modules` before `yarn dev`

**3. Transaction Broadcast Fails**
- **Error**: Transaction rejected or timeout
- **Causes**:
  - Insufficient wallet balance (need credits for fees)
  - RPC endpoint down (check CURRENT_RPC_URL)
  - Invalid inputs (check Leo types: u8, u32, u64, field, bool)
- **Solution**: Check wallet balance, verify RPC health, validate input formats

**4. Bet Record Not Found**
- **Error**: Users can't find their bet record
- **Solution**:
  - Remind users to save bet_id from success screen
  - Check transaction on explorer to extract bet_id
  - Use bet_data mapping lookup: `/program/zkpredict4.aleo/mapping/bet_data/{bet_id}`

**5. Odds Calculation Mismatch**
- **Issue**: UI shows different odds than blockchain calculates
- **Cause**: UI uses simplified preview formula, blockchain uses exact parimutuel
- **Solution**: Display disclaimer that odds are estimates and final payout is calculated on-chain

---

**End of Architecture Documentation**

*For development instructions, see CLAUDE.md*
*For user-facing documentation, see README.md*
