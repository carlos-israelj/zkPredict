# zkPredict - Private Prediction Markets on Aleo

Full-stack decentralized application for private prediction markets built on Aleo blockchain.

**Wave 1 MVP**: Binary prediction markets with private bets and public pools.

## Features

🔒 **Private Betting**: Your position (YES/NO) and bet amount are completely private using Aleo Records
🌐 **Public Pools**: Total YES/NO pools are public for transparent odds calculation
🎯 **Market Creation**: Anyone can create binary prediction markets
⚖️ **Fair Resolution**: Market creators resolve outcomes on-chain
💰 **Private Winnings**: Claim your winnings privately using your bet record

## Tech Stack

### Frontend
- [Next.js 13+](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) - Styling
- [@demox-labs/aleo-wallet-adapter](https://github.com/demox-labs/aleo-wallet-adapter) - Wallet integration

### Backend (Smart Contract)
- **Leo Language** - Aleo's smart contract language
- **Aleo Blockchain** - Privacy-preserving L1
- **Records** - Private state (bets, winnings)
- **Mappings** - Public state (pools, market metadata)

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js & Yarn** (v18+)
2. **Leo CLI**: `curl -L https://install.leo.app | bash`
3. **Aleo Wallet**: [Leo Wallet](https://leo.app/) or [Puzzle Wallet](https://puzzle.online/)

### Installation

```bash
# Clone repository
git clone <your-repo-url> zkpredict-full
cd zkpredict-full

# Install frontend dependencies
yarn install

# Build Leo smart contract
cd program
leo build
cd ..

# Run development server
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Smart Contract

The zkPredict smart contract is located in `/program/src/main.leo`.

### Build Contract

```bash
cd program
leo build
```

### Deploy to Testnet

```bash
cd program
leo deploy --network testnet --private-key YOUR_PRIVATE_KEY
```

### CLI Usage Examples

```bash
cd program

# Create market
leo execute create_market "1field" "1740000000u32" --network testnet

# Place bet (YES)
leo execute place_bet "1field" "true" "1000000u64" --network testnet

# Resolve market (creator only)
leo execute resolve_market "1field" "true" --network testnet
```

See [README-CONTRACT.md](./README-CONTRACT.md) for complete smart contract documentation.

---

## 🔄 Switching to Aleo Mainnet

By default, this template connects to the Aleo **testnetbeta** environment.  
To switch to **mainnet**, follow these steps:

1. Open `src/types/index.ts`
2. Change the `CURRENT_NETWORK` and `CURRENT_RPC_URL` constants to point to mainnet endpoints
3. Then open `src/pages/_app.tsx` and change the `network` prop for `WalletAdapterNetwork` from:
```ts
network={WalletAdapterNetwork.TestnetBeta}
```
to:
```ts
network={WalletAdapterNetwork.MainnetBeta}
```

You are now ready to build against Aleo mainnet!

---

## 📦 Project Structure

```
.
├── /program/         ← Sample Leo program
├── /src/
│   ├── assets/       ← Global styles
│   ├── components/   ← UI + wallet connect
│   ├── hooks/        ← Custom React hooks
│   ├── layouts/      ← Page structure
│   ├── pages/        ← Next.js routes
│   ├── types/        ← TypeScript types
│   └── utils/        ← Aleo-specific helpers
```

---

## 🎯 Wave 1 MVP Scope

✅ **Smart Contract Complete**:
- Create binary markets
- Place private bets
- Public pool tracking
- Market resolution
- Claim winnings
- Non-upgradable (@noupgrade)

🚧 **Frontend (Next Steps)**:
- Wallet connection
- Market listing UI
- Betting interface
- Odds display
- Transaction management

## 🗺️ Future Waves

- **Wave 2**: Time-based resolution, double-claim prevention
- **Wave 3**: Multi-outcome markets, advanced odds
- **Wave 4**: Market categories, discovery
- **Wave 5**: Liquidity pools, AMM
- **Wave 6-10**: Oracles, governance, cross-chain

---

## 🏗️ Architecture

### Privacy Model

| Data | Visibility |
|------|-----------|
| Your bet position (YES/NO) | 🔒 **Private** (Record) |
| Your bet amount | 🔒 **Private** (Record) |
| Your winnings | 🔒 **Private** (Record) |
| Total YES pool | 🌐 **Public** (Mapping) |
| Total NO pool | 🌐 **Public** (Mapping) |
| Market state | 🌐 **Public** (Mapping) |

### Smart Contract Components

**Records** (Private State):
- `Bet`: market_id, outcome, amount, odds_at_bet
- `Winnings`: payout amount

**Mappings** (Public State):
- `markets`: Market metadata
- `yes_pool`: Total YES bets
- `no_pool`: Total NO bets

**Transitions**:
1. `create_market` - Create binary market
2. `place_bet` - Place private bet
3. `resolve_market` - Resolve outcome (creator only)
4. `claim_winnings` - Claim payout with bet record

---

## 🧠 Included Utilities

- `utils/feeCalculator.ts` - Transaction cost estimation
- `utils/privateTransfer.ts` - Aleo private transfers
- `utils/publicTransfer.ts` - Public transfers
- `utils/GLSLBackground.tsx` - Dynamic backgrounds

---

## 📄 License

MIT

---

## 🙏 Credits

- Frontend starter: [@mikenike360](https://github.com/mikenike360) - [VenomLabs](https://venomlabs.xyz)
- Built on [Aleo](https://aleo.org/) blockchain
