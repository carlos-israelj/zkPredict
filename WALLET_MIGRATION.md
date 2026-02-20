# Wallet Adapter Migration - @demox-labs → @provablehq

**Date**: 2026-02-20
**Status**: ✅ Complete

## Summary

zkPredict has been migrated from `@demox-labs/aleo-wallet-adapter-*` to `@provablehq/aleo-wallet-adaptor-*` to support multiple Aleo wallets including **Shield Wallet**.

## Motivation

The `@provablehq` packages provide:
- **Multi-wallet support** (Leo, Shield, Fox, Puzzle, Soter)
- **Newer versions** (0.3.0-alpha vs 0.0.x)
- **Better maintained** ecosystem
- **Shield Wallet integration** for mobile and privacy features

## Changes Made

### 1. Dependencies Updated

**Removed** (old @demox-labs packages):
```json
"@demox-labs/aleo-wallet-adapter-base": "0.0.23",
"@demox-labs/aleo-wallet-adapter-leo": "0.0.25",
"@demox-labs/aleo-wallet-adapter-react": "0.0.22",
"@demox-labs/aleo-wallet-adapter-reactui": "0.0.36"
```

**Added** (new @provablehq packages):
```json
"@provablehq/aleo-types": "0.3.0-alpha.3",
"@provablehq/aleo-wallet-adaptor-core": "^0.3.0-alpha.2",
"@provablehq/aleo-wallet-adaptor-fox": "^0.3.0-alpha.2",
"@provablehq/aleo-wallet-adaptor-leo": "^0.3.0-alpha.3",
"@provablehq/aleo-wallet-adaptor-puzzle": "^0.3.0-alpha.2",
"@provablehq/aleo-wallet-adaptor-react": "^0.3.0-alpha.2",
"@provablehq/aleo-wallet-adaptor-react-ui": "^0.3.0-alpha.3",
"@provablehq/aleo-wallet-adaptor-shield": "^0.3.0-alpha.3",
"@provablehq/aleo-wallet-adaptor-soter": "^0.3.0-alpha.2",
"@puzzlehq/sdk": "^1.0.0",
"@puzzlehq/sdk-core": "^1.0.4"
```

### 2. Code Changes

#### _app.tsx

**Before**:
```tsx
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';

const wallets = [
  new LeoWalletAdapter({ appName: 'zkPredict' }),
];

<WalletProvider
  wallets={wallets}
  network={WalletAdapterNetwork.TestnetBeta}
  autoConnect
>
```

**After**:
```tsx
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { Network } from '@provablehq/aleo-types';

const wallets = [
  new LeoWalletAdapter({ appName: 'zkPredict' }),
  new ShieldWalletAdapter({ appName: 'zkPredict' }),
  new FoxWalletAdapter({ appName: 'zkPredict' }),
  new PuzzleWalletAdapter({ appName: 'zkPredict' }),
  new SoterWalletAdapter({ appName: 'zkPredict' }),
];

<AleoWalletProvider
  wallets={wallets}
  network={Network.TESTNET}
  programs={['zkpredict.aleo', 'credits.aleo']}
  autoConnect={false}
  onError={(error) => console.error('[Wallet Error]', error.message)}
>
```

#### types/index.ts

**Before**:
```tsx
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
export const CURRENT_NETWORK: WalletAdapterNetwork = WalletAdapterNetwork.TestnetBeta;
```

**After**:
```tsx
import { Network } from '@provablehq/aleo-types';
export const CURRENT_NETWORK: Network = Network.TESTNET;
```

#### All Component Imports

Replaced across 23+ files:
- `@demox-labs/aleo-wallet-adapter-react` → `@provablehq/aleo-wallet-adaptor-react`
- `@demox-labs/aleo-wallet-adapter-base` → `@provablehq/aleo-wallet-adaptor-core`
- `WalletAdapterNetwork.TestnetBeta` → `'testnet'`

### 3. Supported Wallets

zkPredict now supports:
1. **Leo Wallet** (leo.app) - Original Leo language wallet
2. **Shield Wallet** (shield.app) - Privacy-focused, mobile-first wallet ⭐ NEW
3. **Fox Wallet** (foxwallet.com) - Multi-chain wallet with Aleo
4. **Puzzle Wallet** (puzzle.online) - Recommended for dApps
5. **Soter Wallet** - Secure Aleo extension wallet

## API Changes

### Hook Usage (No changes needed)

The `useWallet()` hook API remains the same:
```tsx
const { publicKey, requestTransaction, requestRecords } = useWallet();
```

### Transaction Format

Transaction construction is **unchanged**:
```tsx
const txId = await requestTransaction({
  program: 'zkpredict.aleo',
  function: 'place_bet',
  inputs: ['1field', '1u8', '1000000u64', '123field'],
  fee: 500000, // microcredits
});
```

## Testing

To test the migration:

1. **Clear cache**:
```bash
npm run clean
rm -rf .next node_modules
npm install
```

2. **Start dev server**:
```bash
npm run dev
```

3. **Test wallets**:
- Install Shield Wallet from https://shield.app
- Connect each wallet and verify:
  - [ ] Connection works
  - [ ] Balance displays correctly
  - [ ] Transactions execute
  - [ ] Records are fetched

## Rollback Plan

If issues arise, revert to @demox-labs:

```bash
git checkout master
git reset --hard <commit-before-migration>
npm install
```

Or manually edit package.json to restore old dependencies.

## Known Issues

1. **Puzzle Wallet SDK**: May have Zod validation errors with transaction inputs (workaround: use Leo or Shield Wallet)
2. **Private Balance**: Some wallets don't expose private records via SDK - shows as 0 even if wallet has balance

## Resources

- ProvableHQ Adapters: https://github.com/demox-labs/aleo-wallet-adapter
- Shield Wallet Docs: https://shield.app/docs
- Leo Wallet: https://leo.app
- Puzzle SDK: https://docs.puzzle.online

## Next Steps

- [ ] Add wallet-specific UI icons
- [ ] Test on mainnet when deployed
- [ ] Add Shield Wallet logo asset
- [ ] Update user documentation with multi-wallet guide

---

**Migration completed successfully** ✅
All 23 component files updated. Ready for testing.
