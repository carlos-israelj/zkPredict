// Aleo blockchain interaction utilities
// This module provides functions to read on-chain state from the zkpredict.aleo program

const NETWORK_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL || 'https://api.explorer.provable.com/v1';
const PROGRAM_ID = 'zkpredict.aleo';

export interface OnChainMarket {
  creator: string;
  end_time: number;
  resolved: boolean;
  winning_outcome: number;
  num_outcomes: number;
  category: number;
  auto_resolve: boolean;
}

export interface MarketPools {
  yes_pool: number;
  no_pool: number;
}

/**
 * Fetch market data from on-chain state
 * @param marketId The field ID of the market
 * @returns The market data if it exists, null otherwise
 */
export async function fetchMarketOnChain(marketId: string): Promise<OnChainMarket | null> {
  try {
    const response = await fetch(`${NETWORK_URL}/testnet3/program/${PROGRAM_ID}/mapping/markets/${marketId}`);

    if (!response.ok) {
      if (response.status === 404) {
        // Market doesn't exist on-chain
        return null;
      }
      throw new Error(`Failed to fetch market: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse the Aleo struct format
    // Example response: "{creator: aleo1..., end_time: 1234567890u32, ...}"
    return parseAleoMarketStruct(data);
  } catch (error) {
    console.error('Error fetching market from chain:', error);
    return null;
  }
}

/**
 * Fetch pool balances for a binary market
 * @param marketId The field ID of the market
 * @returns The pool balances
 */
export async function fetchMarketPools(marketId: string): Promise<MarketPools> {
  try {
    const [yesPoolRes, noPoolRes] = await Promise.all([
      fetch(`${NETWORK_URL}/testnet3/program/${PROGRAM_ID}/mapping/yes_pool/${marketId}`),
      fetch(`${NETWORK_URL}/testnet3/program/${PROGRAM_ID}/mapping/no_pool/${marketId}`),
    ]);

    const yesPool = yesPoolRes.ok ? await yesPoolRes.json() : 0;
    const noPool = noPoolRes.ok ? await noPoolRes.json() : 0;

    return {
      yes_pool: parseAleoU64(yesPool),
      no_pool: parseAleoU64(noPool),
    };
  } catch (error) {
    console.error('Error fetching market pools:', error);
    return { yes_pool: 0, no_pool: 0 };
  }
}

/**
 * Fetch outcome pool balance for a specific outcome
 * @param marketId The market ID
 * @param outcomeIndex The outcome index (0-based)
 * @returns The pool balance for that outcome
 */
export async function fetchOutcomePool(marketId: string, outcomeIndex: number): Promise<number> {
  try {
    // The pool key is: hash(market_id || outcome_index)
    // For now, we'll use a simplified approach - in production, compute the actual BHP256 hash
    const poolKey = `${marketId}_${outcomeIndex}`;

    const response = await fetch(`${NETWORK_URL}/testnet3/program/${PROGRAM_ID}/mapping/outcome_pools/${poolKey}`);

    if (!response.ok) {
      return 0; // Pool doesn't exist or is empty
    }

    const data = await response.json();
    return parseAleoU64(data);
  } catch (error) {
    console.error('Error fetching outcome pool:', error);
    return 0;
  }
}

/**
 * Check if a bet has been claimed
 * @param betId The bet ID (field)
 * @returns true if the bet has been claimed, false otherwise
 */
export async function isBetClaimed(betId: string): Promise<boolean> {
  try {
    const response = await fetch(`${NETWORK_URL}/testnet3/program/${PROGRAM_ID}/mapping/claimed_bets/${betId}`);

    if (!response.ok) {
      return false; // Not claimed (or doesn't exist in mapping)
    }

    const data = await response.json();
    return parseAleoBool(data);
  } catch (error) {
    console.error('Error checking bet claim status:', error);
    return false;
  }
}

/**
 * Fetch all markets (paginated)
 * Note: This is a simplified version. In production, you'd need to maintain
 * an off-chain index or use the Aleo SDK to scan the state tree
 * @returns List of market IDs
 */
export async function fetchAllMarkets(): Promise<string[]> {
  // This is a placeholder - Aleo doesn't provide a direct "get all keys" API
  // In production, you would:
  // 1. Maintain an off-chain index of market IDs
  // 2. Use the Aleo SDK to scan program state
  // 3. Track market creation events

  console.warn('fetchAllMarkets: This function requires an off-chain index');
  return [];
}

// ============================================
// Helper Functions for Parsing Aleo Types
// ============================================

/**
 * Parse an Aleo Market struct from JSON response
 * @param data The raw response data
 * @returns Parsed market object
 */
function parseAleoMarketStruct(data: any): OnChainMarket {
  // Aleo returns structs in a specific format
  // This is a simplified parser - adjust based on actual API response format

  if (typeof data === 'string') {
    // Parse struct string format: "{field1: value1, field2: value2, ...}"
    const parsed: any = {};
    const fields = data.slice(1, -1).split(','); // Remove braces and split

    fields.forEach(field => {
      const [key, value] = field.split(':').map(s => s.trim());
      parsed[key] = value;
    });

    return {
      creator: parsed.creator,
      end_time: parseAleoU32(parsed.end_time),
      resolved: parseAleoBool(parsed.resolved),
      winning_outcome: parseAleoU8(parsed.winning_outcome),
      num_outcomes: parseAleoU8(parsed.num_outcomes),
      category: parseAleoU8(parsed.category),
      auto_resolve: parseAleoBool(parsed.auto_resolve),
    };
  }

  // If data is already an object (some APIs return parsed JSON)
  return {
    creator: data.creator,
    end_time: parseAleoU32(data.end_time),
    resolved: parseAleoBool(data.resolved),
    winning_outcome: parseAleoU8(data.winning_outcome),
    num_outcomes: parseAleoU8(data.num_outcomes),
    category: parseAleoU8(data.category),
    auto_resolve: parseAleoBool(data.auto_resolve),
  };
}

/**
 * Parse Aleo u64 value (with 'u64' suffix)
 * @param value String like "1000000u64" or number
 * @returns Parsed number
 */
function parseAleoU64(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return parseInt(value.replace('u64', ''));
  }
  return 0;
}

/**
 * Parse Aleo u32 value (with 'u32' suffix)
 * @param value String like "1234567890u32" or number
 * @returns Parsed number
 */
function parseAleoU32(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return parseInt(value.replace('u32', ''));
  }
  return 0;
}

/**
 * Parse Aleo u8 value (with 'u8' suffix)
 * @param value String like "5u8" or number
 * @returns Parsed number
 */
function parseAleoU8(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return parseInt(value.replace('u8', ''));
  }
  return 0;
}

/**
 * Parse Aleo bool value
 * @param value String "true" or "false", or boolean
 * @returns Parsed boolean
 */
function parseAleoBool(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

/**
 * Generate a field hash for market ID
 * This is a simplified version - in production, use proper field hashing
 * @param input String to hash
 * @returns Field representation (for now, just the string)
 */
export function generateMarketId(input: string): string {
  // In production, this should use BHP256 hash to field
  // For now, return a simplified version
  return `${Date.now()}field`;
}
