import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { MarketCategory, CATEGORY_LABELS, getTransactionExplorerUrl } from '@/types';
import { createMarketMetadata } from '@/hooks/useMarketMetadata';

export default function CreateMarket() {
  const { publicKey, requestTransaction } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numOutcomes, setNumOutcomes] = useState(2);
  const [outcomeLabels, setOutcomeLabels] = useState<string[]>(['Yes', 'No']);
  const [category, setCategory] = useState<MarketCategory>(MarketCategory.Other);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('12:00');
  const [autoResolve, setAutoResolve] = useState(false);

  // Success state
  const [successTxId, setSuccessTxId] = useState<string | null>(null);

  // Update outcome labels when numOutcomes changes
  const handleNumOutcomesChange = (num: number) => {
    setNumOutcomes(num);
    const labels = Array(num).fill('').map((_, i) =>
      outcomeLabels[i] || `Outcome ${i + 1}`
    );
    setOutcomeLabels(labels);
  };

  const handleOutcomeLabelChange = (index: number, value: string) => {
    const newLabels = [...outcomeLabels];
    newLabels[index] = value;
    setOutcomeLabels(newLabels);
  };

  const handleCreateMarket = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!title || !endDate || outcomeLabels.some(label => !label.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      // Convert end date/time to Unix timestamp
      const endDateTime = new Date(`${endDate}T${endTime}`);
      const endTimestamp = Math.floor(endDateTime.getTime() / 1000);

      // Generate market ID as a simple field (use timestamp as unique ID)
      // In production, you should use proper field hashing
      const marketId = `${Date.now()}field`;

      if (!requestTransaction) {
        alert('Wallet does not support transactions');
        return;
      }

      // Prepare transaction inputs for create_market
      // Signature: create_market(market_id: field, end_time: u32, num_outcomes: u8, category: u8, auto_resolve: bool)
      const inputs = [
        marketId, // market_id: field
        `${endTimestamp}u32`, // end_time: u32
        `${numOutcomes}u8`, // num_outcomes: u8
        `${category}u8`, // category: u8
        autoResolve.toString(), // auto_resolve: bool (true/false as string)
      ];

      console.log('Creating market with inputs:', inputs);

      // Create transaction object using the Aleo wallet adapter
      const transaction = Transaction.createTransaction(
        publicKey || '',
        'testnetbeta', // Use testnetbeta network
        'zkpredict.aleo', // Our deployed program
        'create_market',
        inputs,
        1000000, // 1 credit fee (temporary - will increase later)
        false // Public fee
      );

      // Request transaction from wallet
      const txResponse = await requestTransaction(transaction);

      console.log('Market created:', txResponse);

      // Store off-chain metadata to backend
      try {
        await createMarketMetadata({
          marketId,
          title,
          description,
          outcomeLabels,
        });
        console.log('Market metadata saved successfully');
      } catch (metadataError) {
        console.error('Error saving market metadata:', metadataError);
        // Continue even if metadata save fails
      }

      // Show success message with transaction ID
      setSuccessTxId(txResponse as string);

    } catch (error) {
      console.error('Error creating market:', error);
      alert('Failed to create market. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAnother = () => {
    // Reset form and success state
    setTitle('');
    setDescription('');
    setNumOutcomes(2);
    setOutcomeLabels(['Yes', 'No']);
    setCategory(MarketCategory.Other);
    setEndDate('');
    setEndTime('12:00');
    setAutoResolve(false);
    setSuccessTxId(null);
  };

  const handleReturnToMarkets = () => {
    window.location.href = '/markets';
  };

  // Show success screen if transaction succeeded
  if (successTxId) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Success Icon */}
          <div className="rounded-full bg-success/20 p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="card-title text-3xl mb-2">Market Created Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your market has been submitted to the Aleo blockchain.
          </p>

          {/* Transaction Info */}
          <div className="alert alert-info w-full max-w-2xl mb-6">
            <div className="flex flex-col gap-2 w-full">
              <div className="font-semibold">Transaction ID:</div>
              <div className="font-mono text-xs break-all">{successTxId}</div>
              <a
                href={getTransactionExplorerUrl(successTxId)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline mt-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View on Explorer
              </a>
            </div>
          </div>

          {/* Info Message */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xl">
            <strong>Note:</strong> Your market will appear in the list once the transaction is confirmed
            (usually 3-5 minutes). Pool data will be available after confirmation.
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button className="btn btn-primary flex-1" onClick={handleCreateAnother}>
              Create Another Market
            </button>
            <button className="btn btn-outline flex-1" onClick={handleReturnToMarkets}>
              View All Markets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Create Prediction Market</h2>

        {/* Title */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Market Title *</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Will Bitcoin reach $100k in 2025?"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            placeholder="Provide details about resolution criteria..."
            className="textarea textarea-bordered h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category (Wave 4) */}
        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text">Category *</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={category}
            onChange={(e) => setCategory(Number(e.target.value) as MarketCategory)}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Outcomes (Wave 3) */}
        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text">Number of Outcomes *</span>
            <span className="label-text-alt">2-10 outcomes</span>
          </label>
          <input
            type="number"
            min="2"
            max="10"
            className="input input-bordered w-full"
            value={numOutcomes}
            onChange={(e) => handleNumOutcomesChange(Number(e.target.value))}
          />
        </div>

        {/* Outcome Labels (Wave 3) */}
        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text">Outcome Labels *</span>
          </label>
          <div className="space-y-2">
            {outcomeLabels.map((label, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Outcome ${index + 1}`}
                className="input input-bordered input-sm w-full"
                value={label}
                onChange={(e) => handleOutcomeLabelChange(index, e.target.value)}
              />
            ))}
          </div>
        </div>

        {/* End Date & Time */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">End Date *</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">End Time *</span>
            </label>
            <input
              type="time"
              className="input input-bordered"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Auto-Resolve (Wave 2) */}
        <div className="form-control mt-4">
          <label className="label cursor-pointer">
            <span className="label-text">
              Enable auto-resolution after end time
              <span className="text-xs text-gray-500 block">
                Anyone can resolve the market after the end time
              </span>
            </span>
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={autoResolve}
              onChange={(e) => setAutoResolve(e.target.checked)}
            />
          </label>
        </div>

        {/* Transaction Cost Info */}
        <div className="alert alert-info mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
            <div>
              <h4 className="font-bold">Transaction Fee</h4>
              <div className="text-sm">Creating a market costs approximately <strong>1 credit</strong></div>
            </div>
            <div className="text-xs opacity-75">
              Actual cost: 1-2 credits
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="card-actions justify-end mt-4">
          <button
            className={`btn btn-primary ${isCreating ? 'loading' : ''}`}
            onClick={handleCreateMarket}
            disabled={isCreating || !publicKey}
          >
            {isCreating ? 'Creating...' : 'Create Market'}
          </button>
        </div>
      </div>
    </div>
  );
}
