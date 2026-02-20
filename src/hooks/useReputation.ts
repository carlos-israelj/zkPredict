import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

import {
  Reputation,
  RepProof,
  ReputationTier,
  ZKPREDICT_PROGRAM_ID,
  calculateTier,
  calculateAccuracy,
} from '@/types';

interface UseReputationReturn {
  reputation: Reputation | null;
  isLoading: boolean;
  error: string | null;
  initReputation: () => Promise<string | null>;
  proveReputation: (minTier: ReputationTier, minAccuracy: number, minWins: number, minStreak: number) => Promise<string | null>;
  isInitializing: boolean;
  isProving: boolean;
}

/**
 * Hook to manage the user's private Reputation record.
 *
 * NOTE: In v5, the Reputation record is PRIVATE (only owner can see it).
 * The hook stores it in localStorage after init/update transactions.
 * The user must have previously saved their Reputation record from their wallet.
 */
export function useReputation(): UseReputationReturn {
  const { address, executeTransaction } = useWallet();
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProving, setIsProving] = useState(false);

  // Load reputation from localStorage on wallet connect
  useEffect(() => {
    if (!address) {
      setReputation(null);
      return;
    }

    const stored = localStorage.getItem(`zkpredict_reputation_${address}`);
    if (stored) {
      try {
        setReputation(JSON.parse(stored));
      } catch {
        // Corrupt data, clear it
        localStorage.removeItem(`zkpredict_reputation_${address}`);
      }
    }
  }, [address]);

  /**
   * Initialize reputation for a new user.
   * Calls init_reputation() -> Reputation record.
   * User must save the returned record from their wallet.
   */
  const initReputation = useCallback(async (): Promise<string | null> => {
    if (!address || !executeTransaction) return null;

    setIsInitializing(true);
    setError(null);

    try {
      // init_reputation() takes no inputs
      const result = await executeTransaction({
        program: ZKPREDICT_PROGRAM_ID,
        function: 'init_reputation',
        inputs: [],
        fee: 500000, // 0.5 credits fee
      });

      const txId = result?.transactionId;
      if (!txId) {
        throw new Error('Transaction failed: No transaction ID returned');
      }

      // Create a default Reputation record to show in UI
      // The actual record comes from the wallet after TX confirmation
      const newRep: Reputation = {
        owner: address,
        totalBets: 0,
        totalWins: 0,
        totalParlays: 0,
        parlayWins: 0,
        currentStreak: 0,
        bestStreak: 0,
        tier: ReputationTier.Novice,
        totalWagered: 0,
        totalWon: 0,
        lastUpdated: 0,
      };

      setReputation(newRep);
      localStorage.setItem(`zkpredict_reputation_${address}`, JSON.stringify(newRep));

      return txId as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [address, executeTransaction]);

  /**
   * Generate a ZK proof of reputation (selective disclosure).
   * Calls prove_reputation(reputation, min_tier, min_accuracy, min_wins, min_streak)
   * Returns a RepProof record.
   *
   * User must provide their Reputation record JSON from their wallet.
   */
  const proveReputation = useCallback(async (
    minTier: ReputationTier,
    minAccuracy: number,
    minWins: number,
    minStreak: number
  ): Promise<string | null> => {
    if (!address || !executeTransaction) return null;

    const storedRecord = localStorage.getItem(`zkpredict_reputation_record_${address}`);
    if (!storedRecord) {
      setError('No Reputation record found. Please paste your Reputation record first.');
      return null;
    }

    setIsProving(true);
    setError(null);

    try {
      const inputs = [
        storedRecord,              // reputation: Reputation (full record JSON)
        `${minTier}u8`,            // prove_tier: u8
        `${minAccuracy}u8`,        // prove_accuracy: u8
        `${minWins}u32`,           // prove_wins: u32
        `${minStreak}u32`,         // prove_streak: u32
      ];

      const result = await executeTransaction({
        program: ZKPREDICT_PROGRAM_ID,
        function: 'prove_reputation',
        inputs,
        fee: 500000,
      });

      const txId = result?.transactionId;
      if (!txId) {
        throw new Error('Transaction failed: No transaction ID returned');
      }
      return txId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsProving(false);
    }
  }, [address, executeTransaction]);

  return {
    reputation,
    isLoading,
    error,
    initReputation,
    proveReputation,
    isInitializing,
    isProving,
  };
}

/**
 * Store the Reputation record JSON from wallet into localStorage.
 * Call this after the user pastes their record from their wallet.
 */
export function saveReputationRecord(address: string, recordJson: string): void {
  localStorage.setItem(`zkpredict_reputation_record_${address}`, recordJson);

  // Try to parse stats from the record to update UI state
  try {
    const parsed = JSON.parse(recordJson);
    const reputation: Reputation = {
      owner: parsed.owner || address,
      totalBets: parseInt(parsed.total_bets?.replace('u32', '') ?? '0'),
      totalWins: parseInt(parsed.total_wins?.replace('u32', '') ?? '0'),
      totalParlays: parseInt(parsed.total_parlays?.replace('u32', '') ?? '0'),
      parlayWins: parseInt(parsed.parlay_wins?.replace('u32', '') ?? '0'),
      currentStreak: parseInt(parsed.current_streak?.replace('u32', '') ?? '0'),
      bestStreak: parseInt(parsed.best_streak?.replace('u32', '') ?? '0'),
      tier: parseInt(parsed.tier?.replace('u8', '') ?? '1') as ReputationTier,
      totalWagered: parseInt(parsed.total_wagered?.replace('u64', '') ?? '0'),
      totalWon: parseInt(parsed.total_won?.replace('u64', '') ?? '0'),
      lastUpdated: parseInt(parsed.last_updated?.replace('u32', '') ?? '0'),
    };
    localStorage.setItem(`zkpredict_reputation_${address}`, JSON.stringify(reputation));
  } catch {
    // Record JSON not parseable, that's ok - the wallet will handle it
  }
}
