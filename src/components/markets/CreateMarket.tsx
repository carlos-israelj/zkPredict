import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { MarketCategory, CATEGORY_LABELS } from '@/types';

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

      // Generate market ID from title and timestamp
      const marketId = `${Date.now()}_${title.replace(/\s+/g, '_')}`;

      // Prepare transaction inputs
      const inputs = [
        marketId, // market_id: field
        `${endTimestamp}u32`, // end_time: u32
        `${numOutcomes}u8`, // num_outcomes: u8
        `${category}u8`, // category: u8
        autoResolve ? 'true' : 'false', // auto_resolve: bool
      ];

      // Request transaction from wallet
      const txResponse = await requestTransaction({
        programId: 'zkpredict.aleo',
        functionName: 'create_market',
        inputs,
        fee: 1000000, // 1 credit fee
      });

      console.log('Market created:', txResponse);

      // TODO: Store off-chain metadata (title, description, outcomeLabels)
      // This would typically go to a backend API or decentralized storage

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
