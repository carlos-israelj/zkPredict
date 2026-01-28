# zkPredict - Private Prediction Markets on Aleo

Wave 1 MVP: Binary prediction markets with private bets and public pools.

## Architecture

### Privacy Model
- **Private (Records)**: Your position (YES/NO), your bet amount, your identity, your winnings
- **Public (Mappings)**: Total YES pool, total NO pool, market state, resolution

### Core Components

**Records (Private State)**:
- `Bet`: Stores private bet information (market_id, outcome, amount, odds)
- `Winnings`: Stores private winnings after claiming

**Mappings (Public State)**:
- `markets`: Market metadata (creator, end_time, resolved, winning_outcome)
- `yes_pool`: Total YES bets per market
- `no_pool`: Total NO bets per market

**Transitions**:
1. `create_market`: Create new binary market
2. `place_bet`: Place private YES/NO bet
3. `resolve_market`: Resolve market (creator only)
4. `claim_winnings`: Claim winnings with bet record

## Project Structure

```
zkpredict/
├── program/              ← Leo smart contract
│   ├── src/
│   │   └── main.leo     ← Main contract code
│   ├── program.json     ← Program manifest
│   └── .env             ← Network configuration
├── .gitignore
└── README.md
```

## Setup

### Prerequisites
- Leo CLI installed (`curl -L https://install.leo.app | bash`)
- Aleo account with testnet credits

### Installation

```bash
cd zkpredict/program
```

### Configuration

Edit `program/.env` file:
```bash
NETWORK=testnet
PRIVATE_KEY=your_private_key_here
ENDPOINT=https://api.explorer.aleo.org/v1
```

## Build & Deploy

### Build the program
```bash
cd program
leo build
```

### Deploy to testnet
```bash
cd program
leo deploy --network testnet --private-key YOUR_PRIVATE_KEY
```

## Usage Examples

### 1. Create Market

```bash
cd program
leo execute create_market \
  "123456field" \
  "1740000000u32" \
  --network testnet
```

Parameters:
- `market_id`: Unique field identifier (e.g., `123456field`)
- `end_time`: Unix timestamp (u32)

### 2. Place Bet

```bash
cd program
leo execute place_bet \
  "123456field" \
  "true" \
  "1000000u64" \
  --network testnet
```

Parameters:
- `market_id`: Market identifier
- `outcome`: `true` for YES, `false` for NO
- `amount`: Bet amount in microcredits (u64)

Returns: `Bet` record (save this to claim winnings later!)

### 3. Resolve Market

```bash
cd program
leo execute resolve_market \
  "123456field" \
  "true" \
  --network testnet
```

Parameters:
- `market_id`: Market identifier
- `winning_outcome`: `true` if YES won, `false` if NO won

Only the market creator can resolve.

### 4. Claim Winnings

```bash
cd program
leo execute claim_winnings \
  "{owner: aleo1..., market_id: 123456field, outcome: true, amount: 1000000u64, odds_at_bet: 10000u64}" \
  --network testnet
```

Parameters:
- `bet`: Your Bet record from `place_bet`

Returns: `Winnings` record with your payout!

## Query Public State

### Get market info
```bash
cd program
leo query markets "123456field" --network testnet
```

### Get YES pool
```bash
cd program
leo query yes_pool "123456field" --network testnet
```

### Get NO pool
```bash
cd program
leo query no_pool "123456field" --network testnet
```

## Testing Locally

### Run local devnet
```bash
cd program
leo devnet start
```

### Execute transitions on devnet
```bash
cd program
leo execute create_market "1field" "1740000000u32" --network devnet
leo execute place_bet "1field" "true" "1000000u64" --network devnet
```

### Stop devnet
```bash
cd program
leo devnet stop
```

## Wave 1 MVP Features

- ✅ Create binary markets (YES/NO)
- ✅ Place private bets
- ✅ Public pool tracking
- ✅ Market resolution (creator only)
- ✅ Claim winnings privately
- ✅ Non-upgradable contract (@noupgrade)

## Future Waves

- **Wave 2**: Time-based resolution validation, bet claiming tracking
- **Wave 3**: Multiple market types, odds calculation improvements
- **Wave 4**: Market discovery, categories
- **Wave 5**: Liquidity pools, market makers
- **Wave 6-10**: Advanced features (oracles, automated resolution, governance)

## Smart Contract Details

**File**: `program/src/main.leo`

**Key Functions**:
- `create_market(market_id, end_time)`: Creates new market
- `place_bet(market_id, outcome, amount)`: Places private bet, updates public pool
- `resolve_market(market_id, winning_outcome)`: Resolves market
- `claim_winnings(bet)`: Claims winnings based on bet record

**Security Features**:
- Non-upgradable constructor for Wave 1
- Creator-only resolution
- Market existence validation
- Resolution status checks
- Division by zero protection

## Architecture Decisions

1. **Non-upgradable**: Wave 1 uses `@noupgrade` for simplicity
2. **Simple odds**: Basic proportional payout (winning_pool splits losing_pool)
3. **No double-claim prevention**: Assumed users claim once (Wave 2 will add tracking)
4. **No time validation**: Market creator can resolve anytime (Wave 2 will add `block.timestamp` checks)
5. **Manual resolution**: Creator resolves manually (future waves will add oracles)

## License

MIT
