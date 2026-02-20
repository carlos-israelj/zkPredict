/**
 * Wallet Helper Utilities
 * Simplifies transaction execution with @provablehq wallet adapters
 */

/**
 * Execute a transaction and return the transaction ID
 * @param executeTransaction - The executeTransaction function from useWallet hook
 * @param program - Program ID (e.g., 'zkpredict.aleo')
 * @param functionName - Function name to execute
 * @param inputs - Array of input parameters
 * @param fee - Fee in microcredits (default: 500000 = 0.5 credits)
 * @returns Transaction ID string
 */
export async function executeWalletTransaction(
  executeTransaction: (options: {
    program: string;
    function: string;
    inputs: string[];
    fee?: number;
  }) => Promise<{ transactionId: string } | undefined>,
  program: string,
  functionName: string,
  inputs: string[],
  fee: number = 500000
): Promise<string> {
  const result = await executeTransaction({
    program,
    function: functionName,
    inputs,
    fee,
  });

  if (!result || !result.transactionId) {
    throw new Error('Transaction failed: No transaction ID returned');
  }

  return result.transactionId;
}
