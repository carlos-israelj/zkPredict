#!/usr/bin/env ts-node
// Script to clean up old/invalid markets from Supabase
// Run with: npx ts-node scripts/clean-supabase.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in environment variables');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Fetch all markets
    const { data: markets, error: fetchError } = await supabase
      .from('markets_metadata')
      .select('market_id, title');

    if (fetchError) {
      throw fetchError;
    }

    if (!markets || markets.length === 0) {
      console.log('✅ Database is already empty. No markets to clean.');
      return;
    }

    console.log(`Found ${markets.length} market(s) in database:\n`);
    markets.forEach((market, index) => {
      console.log(`  ${index + 1}. ${market.market_id} - ${market.title}`);
    });

    console.log('\n🗑️  Deleting all markets...\n');

    // Delete all markets
    const { error: deleteError } = await supabase
      .from('markets_metadata')
      .delete()
      .neq('market_id', ''); // Delete all (workaround since delete() needs a filter)

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Successfully deleted all markets from database!');
    console.log('💡 Users can now create fresh markets that exist on-chain.');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanDatabase();
