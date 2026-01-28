import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';

//Change to MainnetBeta for mainnet or TestnetBeta for testnet
export const CURRENT_NETWORK: WalletAdapterNetwork = WalletAdapterNetwork.TestnetBeta;


//TESTNET_RPC_URL=https://testnetbeta.aleorpc.com
//MAINNET_RPC_URL=https://mainnet.aleorpc.com
export const CURRENT_RPC_URL = "https://testnetbeta.aleorpc.com";

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  authorization?: boolean;
  getLayout?: (page: ReactElement) => ReactNode;
};

// src/types/index.ts
export type ProposalData = {
  bountyId: number;
  proposalId: number;
  proposerAddress: string;
  proposalText?: string;
  fileName?: string;
  fileUrl?: string;
  status?: string;
  rewardSent?: boolean;
};

export type BountyData = {
  id: number;
  title: string;
  reward: string;
  deadline: string;
  creatorAddress: string;
  proposals?: ProposalData[];
};

export const BOUNTY_PROGRAM_ID = 'zkontract.aleo';

// ============================================
// zkPredict Types (Wave 1-4)
// ============================================

export const ZKPREDICT_PROGRAM_ID = 'zkpredict.aleo';

// Wave 4: Market Categories
export enum MarketCategory {
  Sports = 0,
  Politics = 1,
  Crypto = 2,
  Weather = 3,
  Other = 4,
}

export const CATEGORY_LABELS: Record<MarketCategory, string> = {
  [MarketCategory.Sports]: 'Sports',
  [MarketCategory.Politics]: 'Politics',
  [MarketCategory.Crypto]: 'Crypto',
  [MarketCategory.Weather]: 'Weather',
  [MarketCategory.Other]: 'Other',
};

// Market data structure matching Leo struct
export type Market = {
  marketId: string;
  creator: string;
  endTime: number; // Unix timestamp
  resolved: boolean;
  winningOutcome: number; // Wave 3: Changed from boolean to number
  numOutcomes: number; // Wave 3: Number of possible outcomes (2-255)
  category: MarketCategory; // Wave 4: Market category
  autoResolve: boolean; // Wave 2: Can market auto-resolve at end_time
  title?: string; // Off-chain metadata
  description?: string; // Off-chain metadata
  outcomeLabels?: string[]; // Wave 3: Labels for each outcome (e.g., ["Team A", "Team B", "Draw"])
};

// Bet data structure matching Leo record
export type Bet = {
  owner: string;
  marketId: string;
  betId: string; // Wave 2: Unique bet identifier for claim tracking
  outcome: number; // Wave 3: Outcome index (0 to numOutcomes-1)
  amount: number; // Amount in credits (u64)
  oddsAtBet: number; // Odds at time of bet (scaled by 10000)
  timestamp?: number; // Off-chain metadata
};

// Winnings data structure matching Leo record
export type Winnings = {
  owner: string;
  amount: number; // Amount in credits (u64)
  marketId: string;
  claimedAt?: number; // Off-chain metadata
};

// Pool data for calculating odds
export type MarketPools = {
  marketId: string;
  pools: number[]; // Array of pool sizes for each outcome
  totalPool: number; // Sum of all pools
  timestamp: number; // Last update time
};

// Wave 3: Odds calculation result
export type OddsData = {
  outcome: number;
  odds: number; // Decimal odds (e.g., 2.5 means 2.5x return)
  probability: number; // Implied probability (0-100%)
  poolSize: number;
  poolShare: number; // Percentage of total pool (0-100%)
};
