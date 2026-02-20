import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';

/**
 * Helper to generate a credits record by calling transfer_public_to_private
 * This creates a private credits record from the user's public balance
 *
 * @param publicKey User's Aleo address
 * @param amountInMicrocredits Amount to convert to private credits
 * @param requestTransaction Function to request transaction from wallet
 * @returns Transaction ID
 */
export async function generateCreditsRecord(
  publicKey: string,
  amountInMicrocredits: number,
  requestTransaction: (transaction: Transaction) => Promise<string>
): Promise<string> {
  console.log(`Generating credits record for ${amountInMicrocredits} microcredits...`);

  const transaction = Transaction.createTransaction(
    publicKey,
    WalletAdapterNetwork.TestnetBeta,
    'credits.aleo',
    'transfer_public_to_private',
    [
      publicKey,                        // receiver: address (send to self)
      `${amountInMicrocredits}u64`,    // amount: u64
    ],
    100000, // 0.1 credits fee
    false   // public fee
  );

  const txId = await requestTransaction(transaction);
  console.log(`Credits record generation transaction submitted: ${txId}`);

  return txId;
}

/**
 * Wait for a transaction to be confirmed on-chain
 * Polls the Provable API for transaction status
 *
 * @param txId Transaction ID to wait for
 * @param maxAttempts Maximum number of polling attempts (default 30)
 * @param delayMs Delay between attempts in milliseconds (default 2000)
 * @returns true if confirmed, false if timeout
 */
export async function waitForTransactionConfirmation(
  txId: string,
  maxAttempts: number = 30,
  delayMs: number = 2000
): Promise<boolean> {
  const NETWORK_URL = 'https://api.explorer.provable.com/v1';

  console.log(`Waiting for transaction ${txId} to be confirmed...`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Query transaction status from Provable API
      const response = await fetch(`${NETWORK_URL}/testnet/transaction/${txId}`);

      if (response.ok) {
        const data = await response.json();

        // Check if transaction is confirmed (has a block height)
        if (data && data.height && data.status === 'confirmed') {
          console.log(`Transaction confirmed at block ${data.height}`);
          return true;
        }

        // Check for rejection
        if (data && data.status === 'rejected') {
          console.error(`Transaction rejected:`, data);
          throw new Error(`Transaction was rejected: ${data.error || 'Unknown error'}`);
        }
      }

      // Wait before next attempt
      console.log(`Attempt ${i + 1}/${maxAttempts}: Transaction not yet confirmed, waiting ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));

    } catch (error) {
      console.error(`Error checking transaction status:`, error);
      // Continue polling on error
    }
  }

  console.warn(`Transaction confirmation timeout after ${maxAttempts} attempts`);
  return false;
}

/**
 * Estimate time until transaction confirmation
 * Aleo testnet typically confirms in 6-12 seconds (2-4 blocks at 3s/block)
 */
export function getEstimatedConfirmationTime(): string {
  return '6-12 seconds';
}
