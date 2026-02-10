// ═══════════════════════════════════════════════════════════════════════════════
// ZKPREDICT V5 - TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

program zkpredict_v5_tests.aleo {

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER CONSTANTS FOR TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    const TEST_MARKET_ID: field = 123456789field;
    const TEST_BET_ID: field = 987654321field;
    const TEST_NONCE: field = 111222333field;

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST: TIME MULTIPLIER CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    @test
    transition test_time_multiplier_early() {
        // First 6 hours = 2.0x
        let created_at: u32 = 1000u32;
        let current: u32 = 1000u32 + 10000u32;  // ~2.7 hours later

        let multiplier: u64 = zkpredict_v5.aleo/calculate_time_multiplier(created_at, current);
        assert_eq(multiplier, 200u64);  // 2.0x
    }

    @test
    transition test_time_multiplier_mid() {
        // 6-12 hours = 1.5x
        let created_at: u32 = 1000u32;
        let current: u32 = 1000u32 + 30000u32;  // ~8 hours later

        let multiplier: u64 = zkpredict_v5.aleo/calculate_time_multiplier(created_at, current);
        assert_eq(multiplier, 150u64);  // 1.5x
    }

    @test
    transition test_time_multiplier_late() {
        // 12-24 hours = 1.2x
        let created_at: u32 = 1000u32;
        let current: u32 = 1000u32 + 60000u32;  // ~16 hours later

        let multiplier: u64 = zkpredict_v5.aleo/calculate_time_multiplier(created_at, current);
        assert_eq(multiplier, 120u64);  // 1.2x
    }

    @test
    transition test_time_multiplier_base() {
        // After 24 hours = 1.0x
        let created_at: u32 = 1000u32;
        let current: u32 = 1000u32 + 100000u32;  // ~27 hours later

        let multiplier: u64 = zkpredict_v5.aleo/calculate_time_multiplier(created_at, current);
        assert_eq(multiplier, 100u64);  // 1.0x
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST: TIER CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    @test
    transition test_tier_novice() {
        // 0-5 wins or <60% accuracy = Novice
        let tier: u8 = zkpredict_v5.aleo/calculate_tier_from_stats(3u32, 10u32);  // 30%
        assert_eq(tier, 1u8);  // Novice
    }

    @test
    transition test_tier_skilled() {
        // 6+ wins AND 60%+ accuracy = Skilled
        let tier: u8 = zkpredict_v5.aleo/calculate_tier_from_stats(7u32, 10u32);  // 70%
        assert_eq(tier, 2u8);  // Skilled
    }

    @test
    transition test_tier_expert() {
        // 16+ wins AND 70%+ accuracy = Expert
        let tier: u8 = zkpredict_v5.aleo/calculate_tier_from_stats(18u32, 25u32);  // 72%
        assert_eq(tier, 3u8);  // Expert
    }

    @test
    transition test_tier_oracle() {
        // 31+ wins AND 80%+ accuracy = Oracle
        let tier: u8 = zkpredict_v5.aleo/calculate_tier_from_stats(40u32, 48u32);  // 83%
        assert_eq(tier, 4u8);  // Oracle
    }

    @test
    transition test_tier_wins_without_accuracy() {
        // High wins but low accuracy stays at appropriate tier
        let tier: u8 = zkpredict_v5.aleo/calculate_tier_from_stats(35u32, 100u32);  // 35%
        assert_eq(tier, 1u8);  // Still Novice (accuracy too low)
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST: TIER BONUS CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    @test
    transition test_tier_bonus_novice() {
        let bonus: u64 = zkpredict_v5.aleo/calculate_tier_bonus(1u8);
        assert_eq(bonus, 100u64);  // 1.0x
    }

    @test
    transition test_tier_bonus_skilled() {
        let bonus: u64 = zkpredict_v5.aleo/calculate_tier_bonus(2u8);
        assert_eq(bonus, 110u64);  // 1.1x
    }

    @test
    transition test_tier_bonus_expert() {
        let bonus: u64 = zkpredict_v5.aleo/calculate_tier_bonus(3u8);
        assert_eq(bonus, 120u64);  // 1.2x
    }

    @test
    transition test_tier_bonus_oracle() {
        let bonus: u64 = zkpredict_v5.aleo/calculate_tier_bonus(4u8);
        assert_eq(bonus, 130u64);  // 1.3x
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST: MAX LEGS BY TIER
    // ═══════════════════════════════════════════════════════════════════════════

    @test
    transition test_max_legs_novice() {
        let max_legs: u8 = zkpredict_v5.aleo/get_tier_max_legs(1u8);
        assert_eq(max_legs, 2u8);
    }

    @test
    transition test_max_legs_skilled() {
        let max_legs: u8 = zkpredict_v5.aleo/get_tier_max_legs(2u8);
        assert_eq(max_legs, 3u8);
    }

    @test
    transition test_max_legs_expert() {
        let max_legs: u8 = zkpredict_v5.aleo/get_tier_max_legs(3u8);
        assert_eq(max_legs, 4u8);
    }

    @test
    transition test_max_legs_oracle() {
        let max_legs: u8 = zkpredict_v5.aleo/get_tier_max_legs(4u8);
        assert_eq(max_legs, 5u8);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST: REPUTATION INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    @test
    transition test_init_reputation() {
        let rep: Reputation = zkpredict_v5.aleo/init_reputation();

        assert_eq(rep.total_bets, 0u32);
        assert_eq(rep.total_wins, 0u32);
        assert_eq(rep.total_parlays, 0u32);
        assert_eq(rep.parlay_wins, 0u32);
        assert_eq(rep.current_streak, 0u32);
        assert_eq(rep.best_streak, 0u32);
        assert_eq(rep.tier, 1u8);  // Novice
        assert_eq(rep.total_wagered, 0u64);
        assert_eq(rep.total_won, 0u64);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST: PARIMUTUEL CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    @test
    transition test_parimutuel_payout() {
        // Scenario:
        // Total pool: 1000 credits
        // Winning pool: 400 credits
        // User bet: 100 credits
        // Time multiplier: 2.0x (early bet)
        // Expected payout: (100 * 2.0 * 1000) / 400 = 500 credits

        let bet_amount: u64 = 100000000u64;     // 100 credits in microcredits
        let time_multiplier: u64 = 200u64;      // 2.0x
        let total_pool: u64 = 1000000000u64;    // 1000 credits
        let winning_pool: u64 = 400000000u64;   // 400 credits

        let effective_bet: u64 = (bet_amount * time_multiplier) / 100u64;
        assert_eq(effective_bet, 200000000u64);  // 200 credits

        let gross_payout: u64 = (effective_bet * total_pool) / winning_pool;
        assert_eq(gross_payout, 500000000u64);   // 500 credits

        // With 2% fee
        let fee: u64 = (gross_payout * 200u64) / 10000u64;
        assert_eq(fee, 10000000u64);             // 10 credits fee

        let net_payout: u64 = gross_payout - fee;
        assert_eq(net_payout, 490000000u64);     // 490 credits
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST: PARLAY ODDS CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    @test
    transition test_parlay_2_legs_payout() {
        // 2-leg parlay with Skilled tier (1.1x bonus)
        let bet_amount: u64 = 100000000u64;     // 100 credits
        let combined_odds: u64 = 35000u64;      // 3.5x
        let tier_bonus: u64 = 110u64;           // 1.1x

        let gross: u64 = (bet_amount * combined_odds) / 10000u64;
        assert_eq(gross, 350000000u64);          // 350 credits

        let with_bonus: u64 = (gross * tier_bonus) / 100u64;
        assert_eq(with_bonus, 385000000u64);     // 385 credits

        // With 2% fee
        let fee: u64 = (with_bonus * 200u64) / 10000u64;
        let net: u64 = with_bonus - fee;
        assert_eq(net, 377300000u64);            // ~377.3 credits
    }

    @test
    transition test_parlay_5_legs_oracle_payout() {
        // 5-leg parlay with Oracle tier (1.3x bonus)
        let bet_amount: u64 = 100000000u64;     // 100 credits
        let combined_odds: u64 = 280000u64;     // 28x
        let tier_bonus: u64 = 130u64;           // 1.3x

        let gross: u64 = (bet_amount * combined_odds) / 10000u64;
        assert_eq(gross, 2800000000u64);         // 2800 credits

        let with_bonus: u64 = (gross * tier_bonus) / 100u64;
        assert_eq(with_bonus, 3640000000u64);    // 3640 credits

        // With 2% fee
        let fee: u64 = (with_bonus * 200u64) / 10000u64;
        let net: u64 = with_bonus - fee;
        assert_eq(net, 3567200000u64);           // ~3567.2 credits
    }
}
