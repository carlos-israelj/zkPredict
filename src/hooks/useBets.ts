import { useState, useCallback } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

import { ZKPREDICT_PROGRAM_ID } from '@/types';

interface PlaceBetResult {
  txId: string;
  nonce: string;
}

interface UseBetsReturn {
  placeBet: (marketId: string, outcome: number, amountCredits: number) => Promise<PlaceBetResult | null>;
  claimWinnings: (betRecord: string) => Promise<string | null>;
  claimTwoWinnings: (betRecord1: string, betRecord2: string) => Promise<string | null>;
  isPlacing: boolean;
  isClaiming: boolean;
  error: string | null;
}

/**
 * Hook for single-bet operations (place_bet, claim_winnings, claim_two_winnings).
 *
 * Privacy model:
 * - Bet amount comes from private Credits record (not exposed publicly)
 * - Outcome is a private input
 * - Only the pool aggregate is updated publicly
 * - Bet record is returned to the user (they must save it to claim later)
 */
export function useBets(): UseBetsReturn {
  const { address, executeTransaction } = useWallet();
  const [isPlacing, setIsPlacing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Place a bet.
   * Contract: place_bet(payment: credits.aleo/credits, market_id: field, outcome: u8, nonce: field)
   *
   * The wallet adapter resolves the Credits record from the amount.
   * Returns nonce so the user can track their bet.
   */
  const placeBet = useCallback(async (
    marketId: string,
    outcome: number,
    amountCredits: number
  ): Promise<PlaceBetResult | null> => {
    if (!address || !executeTransaction) return null;

    if (amountCredits < 1) {
      setError('Minimum bet is 1 credit');
      return null;
    }

    setIsPlacing(true);
    setError(null);

    try {
      const amountMicrocredits = Math.floor(amountCredits * 1_000_000);
      const nonce = `${Date.now()}field`;

      // v5 place_bet inputs:
      // 1. amount (u64) - wallet resolves to Credits record
      // 2. market_id (field) - public
      // 3. outcome (u8) - private
      // 4. nonce (field) - private, used to generate unique bet_id
      const inputs = [
        `${amountMicrocredits}u64`,
        marketId,
        `${outcome}u8`,
        nonce,
      ];

      const result = await executeTransaction({
        program: ZKPREDICT_PROGRAM_ID,
        function: 'place_bet',
        inputs,
        fee: 100000,
      });

      const txId = result?.transactionId;
      if (!txId) {
        throw new Error('Transaction failed: No transaction ID returned');
      }
      return { txId, nonce };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsPlacing(false);
    }
  }, [address, executeTransaction]);

  /**
   * Claim winnings for a single winning bet.
   * Contract: claim_winnings(bet: Bet) -> (Winnings, Future)
   *
   * The user must provide the full Bet record JSON from their wallet.
   */
  const claimWinnings = useCallback(async (betRecord: string): Promise<string | null> => {
    if (!address || !executeTransaction) return null;

    if (!betRecord.trim().startsWith('{')) {
      setError('Invalid Bet record format - must be JSON object');
      return null;
    }

    setIsClaiming(true);
    setError(null);

    try {
      const inputs = [betRecord.trim()];

      const result = await executeTransaction({
        program: ZKPREDICT_PROGRAM_ID,
        function: 'claim_winnings',
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

  /**
   * Batch claim two winning bets in one transaction.
   * Contract: claim_two_winnings(bet1: Bet, bet2: Bet) -> (Winnings, Future)
   *
   * More efficient than two separate claim transactions.
   */
  const claimTwoWinnings = useCallback(async (
    betRecord1: string,
    betRecord2: string
  ): Promise<string | null> => {
    if (!address || !executeTransaction) return null;

    if (!betRecord1.trim().startsWith('{') || !betRecord2.trim().startsWith('{')) {
      setError('Invalid Bet record format - both must be JSON objects');
      return null;
    }

    setIsClaiming(true);
    setError(null);

    try {
      const inputs = [betRecord1.trim(), betRecord2.trim()];

      const result = await executeTransaction({
        program: ZKPREDICT_PROGRAM_ID,
        function: 'claim_two_winnings',
        inputs,
        fee: 150000, // Slightly higher fee for batch
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
    placeBet,
    claimWinnings,
    claimTwoWinnings,
    isPlacing,
    isClaiming,
    error,
  };
}
