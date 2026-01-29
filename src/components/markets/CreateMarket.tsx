import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { MarketCategory, CATEGORY_LABELS } from '@/types';
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
        10000000, // 10 credits fee (create_market is expensive)
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

      alert('Market created successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setNumOutcomes(2);
      setOutcomeLabels(['Yes', 'No']);
      setCategory(MarketCategory.Other);
      setEndDate('');
      setEndTime('12:00');
      setAutoResolve(false);

    } catch (error) {
      console.error('Error creating market:', error);
      alert('Failed to create market. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

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

        {/* Create Button */}
        <div className="card-actions justify-end mt-6">
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
