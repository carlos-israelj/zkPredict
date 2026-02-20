// privateTransfer.ts


import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { CURRENT_NETWORK } from '@/types';

export const CREDITS_PROGRAM_ID = 'credits.aleo';
export const TRANSFER_PRIVATE_FUNCTION = 'transfer_private';

// Import the fee calculator function
import { getFeeForFunction } from '@/utils/feeCalculator';

/**
 * Executes a private transfer of credits to a target address, then updates the reward state via the API.
 *
 * @param wallet - The wallet adapter instance.
 * @param address - The public key of the user performing the transfer.
 * @param proposerAddress - The address to receive the funds.
 * @param bountyReward - The reward amount (in microcredits) to be transferred.
 * @param setTxStatus - Function to update the transaction status in the UI.
 * @param bountyId - The bounty ID.
 * @param proposalId - The proposal ID.

 * @returns The transaction ID of the submitted private transfer.
 */
export async function privateTransfer(
  wallet: LeoWalletAdapter,
  address: string,
  proposerAddress: string,
  bountyReward: number,
  setTxStatus: (status: string | null) => void,
  bountyId: number,
  proposalId: number,
  
): Promise<string> {
  // Format the reward amount (e.g. if bountyReward = 5000, then "5000000u64")
  const rewardAmountforTransfer = `${bountyReward}000000u64`; 

  // 1. Fetch all records for credits program
  const allRecords = await wallet.requestRecords(CREDITS_PROGRAM_ID, true);
  if (!allRecords || allRecords.length === 0) {
    throw new Error('No credits records found.');
  }

  // 2. Filter private + unspent records
  const privateRecords = allRecords.filter(
    (record: any) => record.data?.microcredits && record.data.microcredits.endsWith('u64.private')
  );
  const unspentRecords = privateRecords.filter((record: any) => record.spent === false);

  if (unspentRecords.length === 0) {
    throw new Error('No unspent private records available.');
  }

  // 3. Find one record that can cover bountyReward
  const extractValue = (valueStr: string): number => {
    const match = valueStr.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };
  const neededAmount = extractValue(rewardAmountforTransfer);

  const transferCandidates = unspentRecords.filter((record: any) => {
    const recordValue = extractValue(record.data.microcredits);
    return recordValue >= neededAmount;
  });

  if (transferCandidates.length === 0) {
    throw new Error('No single record can cover the required transfer amount.');
  }

  const chosenRecord = transferCandidates[0];

  console.log('Chosen record:', chosenRecord);

  // 4. Create transaction inputs
  const txInputs = [
    JSON.stringify(chosenRecord),      // The record we'll spend
    proposerAddress,   // The address receiving the funds
    rewardAmountforTransfer,
  ];

  console.log('Private transfer inputs:', txInputs);

  const fee = getFeeForFunction(TRANSFER_PRIVATE_FUNCTION);
  console.log('Calculated fee (in micro credits):', fee);

  // 5. Execute the transaction
  const result = await wallet.executeTransaction({
    program: CREDITS_PROGRAM_ID,
    function: TRANSFER_PRIVATE_FUNCTION,
    inputs: txInputs,
    fee,
  });

  const txId = result?.transactionId;
  if (!txId) {
    throw new Error('Transaction failed: No transaction ID returned');
  }
  setTxStatus(`Private transfer submitted: ${txId}`);

  // 7. Poll for completion/finalization
  let finalized = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    const statusResponse = await wallet.transactionStatus(txId);
    const status = statusResponse?.status || 'Unknown';
    setTxStatus(`Attempt ${attempt + 1}: ${status}`);

    if (status === 'Finalized' || status === 'Confirmed') {
      finalized = true;
      break;
    }
    await new Promise((res) => setTimeout(res, 2000));
  }

  if (!finalized) {
    setTxStatus('Private transfer not finalized in time.');
    throw new Error('Private transfer not finalized in time.');
  } else {
    setTxStatus('Private transfer finalized.');
  }

  // 8. Call the API route to update the reward status
  const rewardResponse = await fetch('/api/update-proposal-reward', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bountyId,
      proposalId,
      rewardSent: true,
    }),
  });

  if (!rewardResponse.ok) {
    throw new Error('Failed to update reward status.');
  }
  setTxStatus('Reward status updated.');
  return txId;
  
}
