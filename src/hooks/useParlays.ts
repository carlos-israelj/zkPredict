import { useState, useCallback } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

import { ZKPREDICT_PROGRAM_ID, ReputationTier, TIER_MAX_LEGS } from '@/types';

export interface ParlayLegInput {
  marketId: string;
  outcome: number;
  marketTitle?: string;
  outcomeName?: string;
  odds?: number;
}

interface CreateParlayResult {
  txId: string;
  parlayId: string;
}

interface UseParlaysReturn {
  createParlay: (
    legs: ParlayLegInput[],
    amountCredits: number,
    reputationRecord: string,
    tier: ReputationTier
  ) => Promise<CreateParlayResult | null>;
  claimParlay: (parlayRecord: string, reputationRecord: string) => Promise<string | null>;
  isCreating: boolean;
  isClaiming: boolean;
  error: string | null;
}

/**
 * Hook for parlay betting operations.
 *
 * Parlays in v5:
 * - 2-5 legs depending on Reputation tier
 * - Tier-based odds bonus (1.0x - 1.3x)
 * - All leg data is PRIVATE (in the Parlay record)
 * - Requires the Reputation record to enforce tier gates
 */
export function useParlays(): UseParlaysReturn {
  const { address, executeTransaction } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createParlay = useCallback(async (
    legs: ParlayLegInput[],
    amountCredits: number,
    reputationRecord: string,
    tier: ReputationTier
  ): Promise<CreateParlayResult | null> => {
    if (!address || !executeTransaction) return null;

    const numLegs = legs.length;
    if (numLegs < 2 || numLegs > 5) {
      setError('Parlay must have 2-5 legs');
      return null;
    }

    const maxLegs = TIER_MAX_LEGS[tier];
    if (numLegs > maxLegs) {
      setError(`Your tier (${ReputationTier[tier]}) only allows ${maxLegs}-leg parlays`);
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const amountMicrocredits = Math.floor(amountCredits * 1_000_000);
      const nonce = `${Date.now()}field`;

      // Pad to 5 legs with zero values
      const paddedLegs: ParlayLegInput[] = [...legs];
      while (paddedLegs.length < 5) {
        paddedLegs.push({ marketId: '0field', outcome: 0 });
      }

      // Contract signatures:
      // create_parlay_2(payment, reputation, market_1, outcome_1, market_2, outcome_2, nonce)
      // create_parlay_3(payment, reputation, market_1..3, outcome_1..3, nonce)
      // create_parlay_4(payment, reputation, market_1..4, outcome_1..4, nonce)
      // create_parlay_5(payment, reputation, market_1..5, outcome_1..5, nonce)
      const functionName = `create_parlay_${numLegs}`;

      // Build inputs: amount (for wallet to resolve Credits record), reputation record,
      // then market/outcome pairs up to numLegs, then nonce
      const inputs: string[] = [
        `${amountMicrocredits}u64`,  // Amount -> wallet resolves to Credits record
        reputationRecord,            // reputation: Reputation (full record JSON)
      ];

      for (let i = 0; i < numLegs; i++) {
        inputs.push(paddedLegs[i].marketId); // market_N: field
        inputs.push(`${paddedLegs[i].outcome}u8`); // outcome_N: u8
      }

      inputs.push(nonce); // nonce: field

      const result = await executeTransaction({
        program: ZKPREDICT_PROGRAM_ID,
        function: functionName,
        inputs,
        fee: 150000, // 0.15 credits fee
      });

      const txId = result?.transactionId;
      if (!txId) {
        throw new Error('Transaction failed: No transaction ID returned');
      }
      const parlayId = `${nonce.replace('field', '')}_parlay`;

      return { txId, parlayId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [address, executeTransaction]);

  const claimParlay = useCallback(async (
    parlayRecord: string,
    reputationRecord: string
  ): Promise<string | null> => {
    if (!address || !executeTransaction) return null;

    if (!parlayRecord.trim().startsWith('{')) {
      setError('Invalid Parlay record format');
      return null;
    }

    if (!reputationRecord.trim().startsWith('{')) {
      setError('Invalid Reputation record format');
      return null;
    }

    setIsClaiming(true);
    setError(null);

    try {
      // claim_parlay(parlay: Parlay, reputation: Reputation) -> (Winnings, Reputation, Future)
      const inputs = [
        parlayRecord.trim(),    // parlay: Parlay (full record JSON)
        reputationRecord.trim(), // reputation: Reputation (full record JSON)
      ];

      const result = await executeTransaction({
        program: ZKPREDICT_PROGRAM_ID,
        function: 'claim_parlay',
        inputs,
        fee: 100000,
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
      setIsClaiming(false);
    }
  }, [address, executeTransaction]);

  return {
    createParlay,
    claimParlay,
    isCreating,
    isClaiming,
    error,
  };
}
