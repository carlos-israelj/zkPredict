import { useState } from 'react';

interface WinningsEntry {
  txId: string;
  sourceType: 'single' | 'parlay';
  amount: number; // in credits
  marketId?: string;
  marketTitle?: string;
  claimedAt: string; // ISO date string
}

interface WinningsHistoryProps {
  entries?: WinningsEntry[];
}

/**
 * WinningsHistory - Displays a list of claimed winnings records.
 *
 * In v5, all Winnings records are private (only visible to the owner).
 * This component shows a local cache of claimed winnings that the user
 * has explicitly exported from their wallet.
 *
 * Users can add entries by pasting their Winnings record JSON.
 */
export function WinningsHistory({ entries = [] }: WinningsHistoryProps) {
  const [localEntries, setLocalEntries] = useState<WinningsEntry[]>(entries);
  const [showAdd, setShowAdd] = useState(false);
  const [recordJson, setRecordJson] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddRecord = () => {
    setAddError(null);
    try {
      const raw = JSON.parse(recordJson.trim());

      const entry: WinningsEntry = {
        txId: raw.source_id || `${Date.now()}`,
        sourceType: raw.source_type === '2u8' || raw.source_type === 2 ? 'parlay' : 'single',
        amount: parseInt(raw.amount?.toString().replace('u64', '') ?? '0') / 1_000_000,
        marketId: raw.market_id,
        claimedAt: new Date().toISOString(),
      };

      setLocalEntries((prev) => [entry, ...prev]);
      setRecordJson('');
      setShowAdd(false);
    } catch {
      setAddError('Could not parse Winnings record. Make sure you copied the full JSON.');
    }
  };

  const totalCredits = localEntries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">Winnings History</h3>
          <button className="btn btn-xs btn-ghost" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Cancel' : '+ Add Record'}
          </button>
        </div>

        {/* Add record form */}
        {showAdd && (
          <div className="bg-base-300 rounded-xl p-4 mb-4 space-y-3">
            <p className="text-sm font-medium opacity-70">Paste Winnings Record JSON</p>
            <textarea
              placeholder={'{\n  "owner": "aleo1...",\n  "amount": "5000000u64",\n  ...\n}'}
              className="textarea textarea-bordered font-mono text-xs h-24 w-full"
              value={recordJson}
              onChange={(e) => setRecordJson(e.target.value)}
            />
            {addError && <p className="text-xs text-error">{addError}</p>}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddRecord}
              disabled={!recordJson.trim()}
            >
              Add to History
            </button>
          </div>
        )}

        {/* Summary */}
        {localEntries.length > 0 && (
          <div className="stats stats-horizontal bg-base-300 shadow mb-4 text-sm">
            <div className="stat py-3 px-4">
              <div className="stat-title text-xs">Total Claimed</div>
              <div className="stat-value text-xl text-success">{totalCredits.toFixed(2)}</div>
              <div className="stat-desc">credits</div>
            </div>
            <div className="stat py-3 px-4">
              <div className="stat-title text-xs">Claims</div>
              <div className="stat-value text-xl">{localEntries.length}</div>
            </div>
          </div>
        )}

        {/* Entries list */}
        {localEntries.length === 0 ? (
          <div className="text-center py-8 opacity-40">
            <p className="text-sm">No winnings recorded yet.</p>
            <p className="text-xs mt-1">Add your Winnings records from your wallet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {localEntries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between bg-base-300 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{entry.sourceType === 'parlay' ? '🎰' : '🎯'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">
                      {entry.sourceType === 'parlay' ? 'Parlay Win' : 'Single Bet Win'}
                    </p>
                    <p className="text-xs opacity-40 truncate">
                      {entry.marketTitle ?? entry.marketId ?? 'Unknown market'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-mono font-bold text-success">+{entry.amount.toFixed(2)}</p>
                  <p className="text-xs opacity-40">{new Date(entry.claimedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
