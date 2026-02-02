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
        'zkpredict4.aleo', // Our deployed program
        'create_market',
        inputs,
        100000, // 0.1 credits fee (reduced for testing)
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
            <div className="flex flex-col gap-2 w-full text-left">
              <div className="font-semibold">Transaction Submitted</div>
              <div className="text-sm">
                Your market creation has been broadcast to the Aleo blockchain and is being confirmed.
              </div>
              <div className="text-xs opacity-75 mt-2 space-y-1">
                <div><strong>To view your transaction:</strong></div>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open Leo Wallet extension</li>
                  <li>Go to "Recent Activity"</li>
                  <li>Find this transaction and click for details</li>
                  <li>Copy the transaction ID (starts with "at1...")</li>
                  <li>Search it on <a href="https://testnet.explorer.provable.com" target="_blank" rel="noopener noreferrer" className="link link-primary">testnet.explorer.provable.com</a></li>
                </ol>
              </div>
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
    <div className="card bg-base-200 border-2 border-base-300">
      <div className="card-body p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Create New Market</h2>
          <p className="text-sm opacity-70">Set up your prediction market in a few simple steps</p>
        </div>

        {/* INPUT ZONE 1: Market Question - Enhanced Editorial Card */}
        <div className="group relative bg-gradient-to-br from-base-100 to-base-100 rounded-2xl p-8 border-2 border-base-300 hover:border-primary/30 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
          {/* Decorative gradient corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Section header with refined badge */}
          <div className="flex items-center gap-3 mb-6 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
                <span className="font-display text-primary font-black text-lg">1</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-0.5">Step One</div>
              <div className="text-base font-bold tracking-wide">Market Question</div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title Input - Magazine editorial style */}
            <div className="form-control group/input">
              <label className="label pb-3">
                <span className="label-text font-bold text-base flex items-center gap-2">
                  What will people predict?
                  <span className="text-error text-sm">*</span>
                </span>
                <span className="font-mono text-xs tabular-nums px-2 py-1 rounded-md bg-base-200/50 border border-base-300">
                  {title.length}<span className="opacity-40">/200</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Will Bitcoin reach $100,000 by December 31, 2025?"
                  className="input input-bordered w-full h-14 text-lg bg-base-200/50 border-2 border-base-300 focus:border-primary focus:bg-base-100 focus:shadow-lg focus:shadow-primary/5 hover:border-base-content/20 transition-all duration-300 placeholder:text-base-content/30 rounded-xl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
                {/* Animated underline accent */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary group-hover/input:w-full transition-all duration-500" />
              </div>
              <label className="label pt-2">
                <span className="label-text-alt text-xs flex items-center gap-1.5 opacity-60">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Make it clear, specific, and unambiguous
                </span>
              </label>
            </div>

            {/* Divider with dot pattern */}
            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-300 to-transparent" />
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-base-300" />
                <div className="w-1 h-1 rounded-full bg-base-300" />
                <div className="w-1 h-1 rounded-full bg-base-300" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-300 to-transparent" />
            </div>

            {/* Description Textarea - Refined editorial block */}
            <div className="form-control">
              <label className="label pb-3">
                <span className="label-text font-bold flex items-center gap-2">
                  How will this be resolved?
                  <span className="text-xs font-normal opacity-60 bg-base-200 px-2 py-0.5 rounded-full">Optional but recommended</span>
                </span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Example: This market resolves YES if Bitcoin (BTC/USD) trades at or above $100,000 on any major exchange (Coinbase, Binance, or Kraken) according to CoinMarketCap data on or before 11:59 PM UTC on December 31, 2025..."
                  className="textarea textarea-bordered w-full h-36 text-[15px] leading-relaxed bg-base-200/50 border-2 border-base-300 focus:border-primary focus:bg-base-100 focus:shadow-lg focus:shadow-primary/5 hover:border-base-content/20 transition-all duration-300 placeholder:text-base-content/30 placeholder:text-sm rounded-xl resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {/* Corner accent */}
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-base-300 rounded-br-lg opacity-30" />
              </div>
              <label className="label pt-2">
                <span className="label-text-alt text-xs flex items-center gap-1.5 opacity-60">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Explain the resolution criteria to avoid disputes
                </span>
              </label>
            </div>

            {/* Quality indicator - subtle but helpful */}
            {title.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-base-200/30 border border-base-300/50 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`w-2 h-2 rounded-full ${title.length >= 20 ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                <span className="text-xs opacity-70">
                  {title.length >= 20
                    ? '✓ Good question length'
                    : 'Try to be more specific (20+ characters recommended)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* INPUT ZONE 2: Category Selection - Enhanced with color coding */}
        <div className="bg-base-100 rounded-xl p-6 sm:p-8 border-2 border-base-300 shadow-sm mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-lg">2</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-0.5">Step Two</div>
              <div className="text-base font-bold tracking-wide">Market Category</div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="label">
              <span className="label-text font-bold text-base flex items-center gap-2">
                Select a category
                <span className="text-error text-sm">*</span>
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const isSelected = category === Number(key);
                const categoryColors = {
                  '0': { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#059669' }, // Sports - Emerald
                  '1': { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#2563eb' }, // Politics - Blue
                  '2': { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#d97706' }, // Crypto - Amber
                  '3': { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', text: '#7c3aed' }, // Weather - Purple
                  '4': { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', text: '#db2777' }, // Other - Pink
                };
                const colors = categoryColors[key as keyof typeof categoryColors];

                return (
                  <button
                    key={key}
                    type="button"
                    className="relative px-4 py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 hover:shadow-lg"
                    style={{
                      background: isSelected ? colors.bg : 'rgba(0, 0, 0, 0.04)',
                      border: isSelected ? `2px solid ${colors.border}` : '2px solid rgba(0, 0, 0, 0.06)',
                      color: isSelected ? colors.text : 'rgba(0, 0, 0, 0.7)'
                    }}
                    onClick={() => setCategory(Number(key) as MarketCategory)}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: colors.border }}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
            <label className="label pt-1">
              <span className="label-text-alt text-xs flex items-center gap-1.5 opacity-60">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Choose the category that best describes your market
              </span>
            </label>
          </div>
        </div>

        {/* INPUT ZONE 3: Outcomes Section - Enhanced with visual feedback */}
        <div className="bg-base-100 rounded-xl p-6 sm:p-8 border-2 border-base-300 shadow-sm mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-lg">3</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-0.5">Step Three</div>
              <div className="text-base font-bold tracking-wide">Possible Outcomes</div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Presets for Binary - Enhanced buttons */}
            <div>
              <label className="label pb-3">
                <span className="label-text font-bold text-base">Quick setup</span>
              </label>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                    numOutcomes === 2
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                  }`}
                  onClick={() => {
                    handleNumOutcomesChange(2);
                    setOutcomeLabels(['Yes', 'No']);
                  }}
                >
                  <span className="flex items-center gap-2">
                    {numOutcomes === 2 && <span>✓</span>}
                    Yes/No
                  </span>
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                    numOutcomes === 3
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                  }`}
                  onClick={() => {
                    handleNumOutcomesChange(3);
                    setOutcomeLabels(['Option A', 'Option B', 'Option C']);
                  }}
                >
                  <span className="flex items-center gap-2">
                    {numOutcomes === 3 && <span>✓</span>}
                    3 Options
                  </span>
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                    numOutcomes === 4
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                  }`}
                  onClick={() => {
                    handleNumOutcomesChange(4);
                    setOutcomeLabels(['Option A', 'Option B', 'Option C', 'Option D']);
                  }}
                >
                  <span className="flex items-center gap-2">
                    {numOutcomes === 4 && <span>✓</span>}
                    4 Options
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Number Input - More visible */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-100">
              <label className="label flex-1">
                <span className="label-text font-semibold">Or enter custom number (2-10)</span>
              </label>
              <input
                type="number"
                min="2"
                max="10"
                className="input input-bordered bg-white focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors w-24 text-center font-bold text-lg border-2"
                value={numOutcomes}
                onChange={(e) => handleNumOutcomesChange(Number(e.target.value))}
              />
            </div>

            {/* Outcome Labels */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Name each outcome *</span>
              </label>
              <div className="space-y-3">
                {outcomeLabels.map((label, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="badge badge-primary badge-lg font-bold w-8 shrink-0">{index + 1}</div>
                    <input
                      type="text"
                      placeholder={`e.g., ${index === 0 ? 'Yes' : index === 1 ? 'No' : `Option ${index + 1}`}`}
                      className="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary focus:outline-none transition-colors flex-1"
                      value={label}
                      onChange={(e) => handleOutcomeLabelChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* INPUT ZONE 4: Deadline Section - Enhanced with visual feedback */}
        <div className="bg-base-100 rounded-xl p-6 sm:p-8 border-2 border-base-300 shadow-sm mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-lg">4</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-0.5">Step Four</div>
              <div className="text-base font-bold tracking-wide">Trading Deadline</div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Info Alert - More prominent */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">When should betting close?</p>
                <p className="text-xs text-blue-700 mt-1">
                  After this time, no more bets can be placed. Choose a deadline that gives you time to resolve the market.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label pb-3">
                  <span className="label-text font-bold text-base flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date
                    <span className="text-error text-sm">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered h-12 bg-white focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-mono text-base border-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-control">
                <label className="label pb-3">
                  <span className="label-text font-bold text-base flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Time (UTC)
                    <span className="text-error text-sm">*</span>
                  </span>
                </label>
                <input
                  type="time"
                  className="input input-bordered h-12 bg-white focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-mono text-base border-2"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Show selected deadline */}
            {endDate && (
              <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-900 mb-1">Selected deadline:</p>
                <p className="text-sm font-mono text-green-800">
                  {new Date(`${endDate}T${endTime}`).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </p>
              </div>
            )}

            {/* Auto-Resolve (Wave 2) - Enhanced checkbox */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-100 hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-lg"
                  checked={autoResolve}
                  onChange={(e) => setAutoResolve(e.target.checked)}
                />
                <span className="label-text flex-1">
                  <span className="font-semibold text-base block mb-1">Enable auto-resolution</span>
                  <span className="text-xs opacity-70 block">
                    Allow anyone to resolve the market after the deadline expires
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Transparency Section */}
        <div className="bg-base-300 rounded-lg p-4 mt-6 border-l-4 border-primary">
          <div className="flex items-start gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Privacy-Preserving Prediction Markets</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                zkPredict uses Aleo's zero-knowledge technology to protect sensitive betting information
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span className="badge badge-sm gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Public
                </span>
              </h5>
              <ul className="text-xs space-y-1.5">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Market configuration (outcomes, deadline, category)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Aggregated liquidity pools for each outcome</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Resolution status and winning outcome</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creator address (you)</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span className="badge badge-sm gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </span>
              </h5>
              <ul className="text-xs space-y-1.5">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Bet sizes placed by individual users</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Which outcome each user bet on</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>User identities behind each bet</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Winnings claimed by participants</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-base-content/10">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> Market title and description are stored off-chain for better UX and are not part of the blockchain state.
            </p>
          </div>
        </div>

        {/* Transaction Cost Info */}
        <div className="alert alert-info mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
            <div>
              <h4 className="font-bold">Transaction Fee</h4>
              <div className="text-sm">Creating a market costs approximately <strong>0.1 credits</strong></div>
            </div>
            <div className="text-xs opacity-75">
              Reduced for testing
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
