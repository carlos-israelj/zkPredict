import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';

//Change to MainnetBeta for mainnet or TestnetBeta for testnet
export const CURRENT_NETWORK: WalletAdapterNetwork = WalletAdapterNetwork.TestnetBeta;


//TESTNET_RPC_URL=https://testnetbeta.aleorpc.com
//MAINNET_RPC_URL=https://mainnet.aleorpc.com
export const CURRENT_RPC_URL = "https://testnetbeta.aleorpc.com";

// Explorer URL based on current network
export const EXPLORER_URL = CURRENT_NETWORK === WalletAdapterNetwork.TestnetBeta
  ? "https://testnet.explorer.provable.com"
  : "https://explorer.provable.com";

// Helper function to get transaction explorer URL
export const getTransactionExplorerUrl = (txId: string): string => {
  return `${EXPLORER_URL}/transaction/${txId}`;
};

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
// zkPredict Types (v5.0 + Privacy Enhancements)
// ============================================

export const ZKPREDICT_PROGRAM_ID = 'zkpredict_v5.aleo';

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
  createdAt: number; // v5: Block height when created (for time-weighting)
  endTime: number; // Unix timestamp
  resolved: boolean;
  winningOutcome: number; // Wave 3: Changed from boolean to number
  numOutcomes: number; // Wave 3: Number of possible outcomes (2-255)
  category: MarketCategory; // Wave 4: Market category
  autoResolve: boolean; // Wave 2: Can market auto-resolve at end_time
  totalPool: number; // v5: Total amount in all pools
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
  oddsSnapshot: number; // v5: Renamed from oddsAtBet (scaled by 10000)
  timeMultiplier: number; // v5: Early bet bonus (100-200)
  placedAt: number; // v5: Block height when placed
  timestamp?: number; // Off-chain metadata
};

// Winnings data structure matching Leo record
export type Winnings = {
  owner: string;
  amount: number; // Amount in credits (u64)
  sourceId: string; // v5: bet_id or parlay_id that generated this
  sourceType: number; // v5: 1 = single bet, 2 = parlay
  marketId: string;
  claimedAt: number; // v5: Block height when claimed
};

// v5: Reputation data structure matching Leo record
export type Reputation = {
  owner: string;
  totalBets: number; // u32
  totalWins: number; // u32
  totalParlays: number; // u32
  parlayWins: number; // u32
  currentStreak: number; // u32
  bestStreak: number; // u32
  tier: number; // 1=Novice, 2=Skilled, 3=Expert, 4=Oracle
  totalWagered: number; // u64 - Lifetime wagered amount
  totalWon: number; // u64 - Lifetime winnings
  lastUpdated: number; // u32 - Block height of last update
};

// v5: Reputation tiers
export enum ReputationTier {
  Novice = 1,
  Skilled = 2,
  Expert = 3,
  Oracle = 4,
}

export const TIER_LABELS: Record<ReputationTier, string> = {
  [ReputationTier.Novice]: 'Novice',
  [ReputationTier.Skilled]: 'Skilled',
  [ReputationTier.Expert]: 'Expert',
  [ReputationTier.Oracle]: 'Oracle',
};

export const TIER_MAX_LEGS: Record<ReputationTier, number> = {
  [ReputationTier.Novice]: 2,
  [ReputationTier.Skilled]: 3,
  [ReputationTier.Expert]: 4,
  [ReputationTier.Oracle]: 5,
};

export const TIER_BONUSES: Record<ReputationTier, number> = {
  [ReputationTier.Novice]: 1.0, // 100 -> 1.0x
  [ReputationTier.Skilled]: 1.1, // 110 -> 1.1x
  [ReputationTier.Expert]: 1.2, // 120 -> 1.2x
  [ReputationTier.Oracle]: 1.3, // 130 -> 1.3x
};

// v5: Parlay data structure matching Leo record
export type Parlay = {
  owner: string;
  parlayId: string;
  market1: string;
  outcome1: number;
  market2: string;
  outcome2: number;
  market3?: string;
  outcome3?: number;
  market4?: string;
  outcome4?: number;
  market5?: string;
  outcome5?: number;
  numLegs: number; // 2-5
  amount: number; // u64
  combinedOdds: number; // Combined odds (scaled by 10000)
  tierBonus: number; // Bonus from reputation tier (100-130)
  placedAt: number; // u32 - Block height when placed
};

// v5: ReputationProof data structure matching Leo record
export type ReputationProof = {
  owner: string;
  proofId: string;
  tierProven: number;
  minAccuracyProven: number;
  minWinsProven: number;
  minStreakProven: number;
  validUntil: number; // Block height when proof expires
  createdAt: number; // Block height when created
};

// v5: Market statistics (aggregate data)
export type MarketStats = {
  marketId: string;
  totalBets: number; // u64 - Count of bets
  totalBettors: number; // u32 - Estimated unique bettors
  lastBetBlock: number; // u32 - Block of most recent bet
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

// v5: Time-weighted multiplier constants
export const TIME_MULTIPLIERS = {
  EARLY: 2.0,    // 2.0x for first 6 hours
  MID: 1.5,      // 1.5x for 6-12 hours
  LATE: 1.2,     // 1.2x for 12-24 hours
  BASE: 1.0,     // 1.0x after 24 hours
};

export const TIME_THRESHOLDS = {
  HOURS_6: 21600,   // ~6 hours in blocks
  HOURS_12: 43200,  // ~12 hours in blocks
  HOURS_24: 86400,  // ~24 hours in blocks
};

// v5: Parlay base odds constants
export const PARLAY_BASE_ODDS = {
  2: 3.5,   // 2-leg parlay: ~3.5x
  3: 7.0,   // 3-leg parlay: ~7x
  4: 14.0,  // 4-leg parlay: ~14x
  5: 28.0,  // 5-leg parlay: ~28x
};

// v5: Helper function to calculate time multiplier
export const calculateTimeMultiplier = (createdAt: number, currentBlock: number): number => {
  const elapsed = currentBlock - createdAt;

  if (elapsed < TIME_THRESHOLDS.HOURS_6) return TIME_MULTIPLIERS.EARLY;
  if (elapsed < TIME_THRESHOLDS.HOURS_12) return TIME_MULTIPLIERS.MID;
  if (elapsed < TIME_THRESHOLDS.HOURS_24) return TIME_MULTIPLIERS.LATE;
  return TIME_MULTIPLIERS.BASE;
};

// v5: Helper function to calculate tier from stats
export const calculateTier = (wins: number, totalBets: number): ReputationTier => {
  if (totalBets === 0) return ReputationTier.Novice;

  const accuracy = (wins / totalBets) * 100;

  if (wins >= 31 && accuracy >= 80) return ReputationTier.Oracle;
  if (wins >= 16 && accuracy >= 70) return ReputationTier.Expert;
  if (wins >= 6 && accuracy >= 60) return ReputationTier.Skilled;
  return ReputationTier.Novice;
};

// v5: Helper function to calculate accuracy percentage
export const calculateAccuracy = (wins: number, totalBets: number): number => {
  if (totalBets === 0) return 0;
  return (wins / totalBets) * 100;
};

// v5: Helper function to format tier display
export const formatTierDisplay = (tier: ReputationTier): string => {
  const tierLabel = TIER_LABELS[tier];
  const maxLegs = TIER_MAX_LEGS[tier];
  const bonus = TIER_BONUSES[tier];
  return `${tierLabel} (Max ${maxLegs} legs, ${bonus}x bonus)`;
};
