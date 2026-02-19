import { useState, useEffect } from 'react';
import { CURRENT_RPC_URL } from '@/types';

type TxStatus = 'pending' | 'confirmed' | 'failed' | 'not_found';

interface TransactionStatusProps {
  txId: string;
  onConfirmed?: () => void;
  pollIntervalMs?: number;
}

/**
 * TransactionStatus - Shows real-time status of an Aleo transaction.
 * Polls the Provable API until the transaction is confirmed or failed.
 */
export function TransactionStatus({
  txId,
  onConfirmed,
  pollIntervalMs = 10000,
}: TransactionStatusProps) {
  const [status, setStatus] = useState<TxStatus>('pending');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!txId) return;

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `https://api.provable.com/v2/testnet/transaction/${txId}`
        );

        if (res.status === 404) {
          if (!cancelled) setStatus('not_found');
          return;
        }

        if (!res.ok) return;

        const data = await res.json();

        // Provable API returns finalized transactions with type "execute" or "deploy"
        if (data && (data.type === 'execute' || data.type === 'deploy')) {
          if (!cancelled) {
            setStatus('confirmed');
            onConfirmed?.();
          }
          return;
        }

        if (!cancelled) setAttempts((a) => a + 1);
      } catch {
        if (!cancelled) setAttempts((a) => a + 1);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [txId, pollIntervalMs, onConfirmed]);

  const explorerUrl = `https://testnet.explorer.provable.com/transaction/${txId}`;

  return (
    <div className="flex items-center gap-3 text-sm">
      {status === 'pending' && (
        <>
          <span className="loading loading-spinner loading-xs text-warning" />
          <span className="opacity-70">
            Confirming transaction...{attempts > 0 && ` (${attempts} checks)`}
          </span>
        </>
      )}

      {status === 'confirmed' && (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-success font-medium">Confirmed</span>
        </>
      )}

      {status === 'failed' && (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-error">Failed</span>
        </>
      )}

      {status === 'not_found' && (
        <>
          <span className="loading loading-dots loading-xs opacity-50" />
          <span className="opacity-50">Pending finalization...</span>
        </>
      )}

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-xs btn-ghost font-mono truncate max-w-[120px]"
      >
        {txId.slice(0, 8)}...
      </a>
    </div>
  );
}
