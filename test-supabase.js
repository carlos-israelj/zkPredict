// Quick test script to verify Supabase connection
// Run with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gnelwpxhgavntqfplwau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZWx3cHhoZ2F2bnRxZnBsd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTU4MDMsImV4cCI6MjA4NTIzMTgwM30.Ixq7zBSmMcEOrW1s5X6Wh5SwfoxVY6-ukgzKSn1VZvE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');

  try {
    // Test 1: Fetch all markets
    console.log('📦 Test 1: Fetching all markets...');
    const { data: markets, error: marketsError } = await supabase
      .from('markets_metadata')
      .select('*')
      .order('created_at', { ascending: false });

    if (marketsError) {
      console.error('❌ Error fetching markets:', marketsError.message);
      return;
    }

    console.log(`✅ Success! Found ${markets.length} markets:`);
    markets.forEach((market, i) => {
      console.log(`   ${i + 1}. ${market.title} (ID: ${market.market_id})`);
    });
    console.log('');

    // Test 2: Fetch single market
    console.log('📦 Test 2: Fetching market with ID "1"...');
    const { data: market, error: marketError } = await supabase
      .from('markets_metadata')
      .select('*')
      .eq('market_id', '1')
      .single();

    if (marketError) {
      console.error('❌ Error fetching market:', marketError.message);
      return;
    }

    console.log('✅ Success! Market details:');
    console.log(`   Title: ${market.title}`);
    console.log(`   Outcomes: ${market.outcome_labels.join(', ')}`);
    console.log('');

    // Test 3: Insert test market
    console.log('📦 Test 3: Creating test market...');
    const testMarket = {
      market_id: 'test_' + Date.now(),
      title: 'Test Market - Will Aleo reach $100 by end of 2026?',
      description: 'This is a test market created by the setup script.',
      outcome_labels: ['No', 'Yes'],
    };

    const { data: newMarket, error: insertError } = await supabase
      .from('markets_metadata')
      .insert([testMarket])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating market:', insertError.message);
      return;
    }

    console.log('✅ Success! Created market:');
    console.log(`   ID: ${newMarket.market_id}`);
    console.log(`   Title: ${newMarket.title}`);
    console.log('');

    // Test 4: Delete test market
    console.log('📦 Test 4: Cleaning up test market...');
    const { error: deleteError } = await supabase
      .from('markets_metadata')
      .delete()
      .eq('market_id', newMarket.market_id);

    if (deleteError) {
      console.error('❌ Error deleting market:', deleteError.message);
      return;
    }

    console.log('✅ Success! Test market deleted.');
    console.log('');

    // Summary
    console.log('🎉 All tests passed! Supabase is configured correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Start your dev server: npm run dev');
    console.log('  2. Visit http://localhost:3000/markets');
    console.log('  3. You should see the 3 example markets from Supabase');
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection();
