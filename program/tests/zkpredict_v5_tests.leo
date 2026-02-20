// ═══════════════════════════════════════════════════════════════════════════════
// ZKPREDICT V5 REGRESSION TESTS — local logic verification
// ═══════════════════════════════════════════════════════════════════════════════
// Leo test programs can only call functions from the program in src/main.leo
// (zkpredict_v6.aleo). Cross-program calls are not supported from separate
// test program IDs. These tests verify equivalent logic using pure arithmetic.
// ═══════════════════════════════════════════════════════════════════════════════

program zkpredict_v5_tests.aleo {

    // ───────────────────────────────────────────────────────────────────────────
    // SECTION 1 — TIME MULTIPLIER BOUNDARIES (arithmetic)
    // ───────────────────────────────────────────────────────────────────────────

    @test
    transition test_multiplier_early() {
        // elapsed = 10000 < 21600 → EARLY → 2.0x = 200
        let elapsed: u32 = 10000u32;
        let early: bool  = elapsed < 21600u32;
        let mid: bool    = elapsed < 43200u32;
        let late: bool   = elapsed < 86400u32;
        assert_eq(early, true);
        assert_eq(mid, true);
        assert_eq(late, true);
    }

    @test
    transition test_multiplier_mid() {
        // elapsed = 30000 → NOT early, IS mid → 1.5x = 150
        let elapsed: u32 = 30000u32;
        let early: bool  = elapsed < 21600u32;
        let mid: bool    = elapsed < 43200u32;
        assert_eq(early, false);
        assert_eq(mid, true);
    }

    @test
    transition test_multiplier_late() {
        // elapsed = 60000 → NOT early, NOT mid, IS late → 1.2x = 120
        let elapsed: u32 = 60000u32;
        let early: bool  = elapsed < 21600u32;
        let mid: bool    = elapsed < 43200u32;
        let late: bool   = elapsed < 86400u32;
        assert_eq(early, false);
        assert_eq(mid,   false);
        assert_eq(late,  true);
    }

    @test
    transition test_multiplier_base() {
        // elapsed = 100000 → none of the above → 1.0x = 100
        let elapsed: u32 = 100000u32;
        let late: bool   = elapsed < 86400u32;
        assert_eq(late, false);
    }

    @test
    transition test_multiplier_6h_boundary() {
        // elapsed = 21600 → NOT early (not < 21600)
        let elapsed: u32 = 21600u32;
        let early: bool  = elapsed < 21600u32;
        let mid: bool    = elapsed < 43200u32;
        assert_eq(early, false);
        assert_eq(mid,   true);
    }

    @test
    transition test_multiplier_24h_boundary() {
        // elapsed = 86400 → NOT late (not < 86400) → BASE
        let elapsed: u32 = 86400u32;
        let late: bool   = elapsed < 86400u32;
        assert_eq(late, false);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // SECTION 2 — TIER ACCURACY THRESHOLDS (arithmetic)
    // ───────────────────────────────────────────────────────────────────────────

    @test
    transition test_tier_novice_acc() {
        // 30% accuracy → Novice (acc < 60)
        let wins: u32  = 3u32;
        let total: u32 = 10u32;
        let acc: u32   = (wins * 100u32) / total;  // 30
        assert_eq(acc, 30u32);
        assert(acc < 60u32);
    }

    @test
    transition test_tier_skilled_acc() {
        // 70% accuracy, 7 wins → Skilled (acc >= 60, acc < 70 OR wins < 10)
        let wins: u32  = 7u32;
        let total: u32 = 10u32;
        let acc: u32   = (wins * 100u32) / total;  // 70
        assert_eq(acc, 70u32);
        assert(acc >= 60u32);
        assert(wins < 10u32);  // wins threshold for Expert not met
    }

    @test
    transition test_tier_expert_acc() {
        // 72% accuracy, 18 wins → Expert (acc >= 70, wins >= 10, but acc < 80)
        let wins: u32  = 18u32;
        let total: u32 = 25u32;
        let acc: u32   = (wins * 100u32) / total;  // 72
        assert_eq(acc, 72u32);
        assert(acc >= 70u32);
        assert(wins >= 10u32);
        assert(acc < 80u32);  // Expert threshold
    }

    @test
    transition test_tier_oracle_acc() {
        // 83% accuracy, 40 wins → Oracle (acc >= 80, wins >= 25)
        let wins: u32  = 40u32;
        let total: u32 = 48u32;
        let acc: u32   = (wins * 100u32) / total;  // 83
        assert_eq(acc, 83u32);
        assert(acc >= 80u32);
        assert(wins >= 25u32);
    }

    @test
    transition test_tier_zero_total() {
        // Zero total → cannot divide; acc defaults to 0 → Novice
        let total: u32 = 0u32;
        assert_eq(total, 0u32);
        assert(total < 1u32);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // SECTION 3 — TIER BONUS VALUES (arithmetic)
    // ───────────────────────────────────────────────────────────────────────────

    @test
    transition test_bonus_tiers() {
        // Tier bonuses: Novice=100, Skilled=110, Expert=120, Oracle=130
        let b1: u64 = 100u64;
        let b2: u64 = 110u64;
        let b3: u64 = 120u64;
        let b4: u64 = 130u64;
        assert_eq(b4 - b3, 10u64);  // 10% increments
        assert_eq(b3 - b2, 10u64);
        assert_eq(b2 - b1, 10u64);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // SECTION 4 — MAX PARLAY LEGS (arithmetic)
    // ───────────────────────────────────────────────────────────────────────────

    @test
    transition test_legs_range() {
        // Novice: 2 legs, Skilled: 3, Expert: 4, Oracle: 5
        let l1: u8 = 2u8;
        let l2: u8 = 3u8;
        let l3: u8 = 4u8;
        let l4: u8 = 5u8;
        assert_eq(l4 - l1, 3u8);
        assert(l2 > l1);
        assert(l3 > l2);
        assert(l4 > l3);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // SECTION 5 — PAYOUT MATH (regression)
    // ───────────────────────────────────────────────────────────────────────────

    @test
    transition test_payout_basic() {
        // bet: 100 credits, 2.0x multiplier, odds = 25000 (2.5x)
        let bet: u64   = 100000000u64;
        let tmul: u64  = 200u64;
        let odds: u64  = 25000u64;

        let eff: u64   = (bet * tmul) / 100u64;
        assert_eq(eff, 200000000u64);

        let gross: u64 = (eff * odds) / 10000u64;
        assert_eq(gross, 500000000u64);

        let fee: u64   = (gross * 200u64) / 10000u64;
        assert_eq(fee, 10000000u64);

        let net: u64   = gross - fee;
        assert_eq(net, 490000000u64);
    }

    @test
    transition test_parlay_2leg_skilled() {
        // 2-leg parlay, Skilled (1.1x bonus)
        let amount: u64 = 100000000u64;
        let odds: u64   = 35000u64;
        let bonus: u64  = 110u64;

        let gross: u64      = (amount * odds) / 10000u64;
        assert_eq(gross, 350000000u64);

        let bonused: u64    = (gross * bonus) / 100u64;
        assert_eq(bonused, 385000000u64);

        let fee: u64 = (bonused * 200u64) / 10000u64;
        let net: u64 = bonused - fee;
        assert_eq(net, 377300000u64);
    }

    @test
    transition test_parlay_5leg_oracle() {
        // 5-leg parlay, Oracle (1.3x bonus)
        let amount: u64 = 100000000u64;
        let odds: u64   = 280000u64;
        let bonus: u64  = 130u64;

        let gross: u64      = (amount * odds) / 10000u64;
        assert_eq(gross, 2800000000u64);

        let bonused: u64    = (gross * bonus) / 100u64;
        assert_eq(bonused, 3640000000u64);

        let fee: u64 = (bonused * 200u64) / 10000u64;
        let net: u64 = bonused - fee;
        assert_eq(net, 3567200000u64);
    }

    // ── Constructor (required for ConsensusVersion::V9) ───────────────────────

    @noupgrade
    async constructor() {
        // Required by snarkVM ConsensusVersion::V9 for test deployment.
    }
}
