// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database row type — matches the v5 schema exactly
export interface MarketMetadataRow {
  id?: number;
  market_id: string;
  title: string;
  description: string | null;
  category: number;          // 0=Sports 1=Politics 2=Crypto 3=Weather 4=Other
  num_outcomes: number;      // Must match on-chain num_outcomes (2-10)
  outcome_labels: string[];  // ["Yes","No"] or multi-outcome labels
  image_url: string | null;
  creator_address: string | null;
  created_at: string;
  updated_at: string;
}
