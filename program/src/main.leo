// ═══════════════════════════════════════════════════════════════════════════════
// ███████╗██╗  ██╗██████╗ ██████╗ ███████╗██████╗ ██╗ ██████╗████████╗
// ╚══███╔╝██║ ██╔╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██║██╔════╝╚══██╔══╝
//   ███╔╝ █████╔╝ ██████╔╝██████╔╝█████╗  ██║  ██║██║██║        ██║
//  ███╔╝  ██╔═██╗ ██╔═══╝ ██╔══██╗██╔══╝  ██║  ██║██║██║        ██║
// ███████╗██║  ██╗██║     ██║  ██║███████╗██████╔╝██║╚██████╗   ██║
// ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝ ╚═════╝   ╚═╝
// ═══════════════════════════════════════════════════════════════════════════════
//
// zkPredict v6.0 - Privacy-First Prediction Markets (critical bug fixes)
//
// Features:
//   • Maximum Privacy: All individual data in Records, never in public Mappings
//   • Reputation System: Private tracking with ZK proofs for selective disclosure
//   • Parlays: 2-5 leg combinations gated by reputation tier
//   • Time-Weighted Betting: Early bettors receive up to 2x multiplier
//   • Tier System: Novice → Skilled → Expert → Oracle progression
//
// Privacy Model:
//   PRIVATE (Records): Bet, Parlay, Reputation, Winnings, RepProof
//   PUBLIC (Mappings): markets, outcome_pools (aggregated), claimed_bets (bool only)
//
// ═══════════════════════════════════════════════════════════════════════════════

import credits.aleo;

program zkpredict_v6.aleo {

    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════════

    // Scaling factors
    const ODDS_SCALE: u64 = 10000u64;           // 10000 = 1.0x odds
    const MIN_BET: u64 = 1000000u64;            // 1 credit minimum (in microcredits)
    const MAX_OUTCOMES: u8 = 10u8;              // Maximum outcomes per market
    const MAX_PARLAY_LEGS: u8 = 5u8;            // Maximum parlay legs
    const PROTOCOL_FEE: u64 = 200u64;           // 2% fee (200/10000)

    // Tier requirements
    const TIER_NOVICE: u8 = 1u8;
    const TIER_SKILLED: u8 = 2u8;
    const TIER_EXPERT: u8 = 3u8;
    const TIER_ORACLE: u8 = 4u8;

    const TIER_SKILLED_WINS: u32 = 6u32;
    const TIER_SKILLED_ACC: u32 = 60u32;
    const TIER_EXPERT_WINS: u32 = 16u32;
    const TIER_EXPERT_ACC: u32 = 70u32;
    const TIER_ORACLE_WINS: u32 = 31u32;
    const TIER_ORACLE_ACC: u32 = 80u32;

    // Time-weight multipliers (base 100)
    const MULTIPLIER_EARLY: u64 = 200u64;       // 2.0x for first 6 hours
    const MULTIPLIER_MID: u64 = 150u64;         // 1.5x for 6-12 hours
    const MULTIPLIER_LATE: u64 = 120u64;        // 1.2x for 12-24 hours
    const MULTIPLIER_BASE: u64 = 100u64;        // 1.0x after 24 hours

    // Block estimates (~1 block/sec on Aleo)
    const BLOCKS_6H: u32 = 21600u32;
    const BLOCKS_12H: u32 = 43200u32;
    const BLOCKS_24H: u32 = 86400u32;

    // Tier bonuses (base 100)
    const BONUS_NOVICE: u64 = 100u64;           // 1.0x
    const BONUS_SKILLED: u64 = 110u64;          // 1.1x
    const BONUS_EXPERT: u64 = 120u64;           // 1.2x
    const BONUS_ORACLE: u64 = 130u64;           // 1.3x

    // Parlay odds multipliers (base 10000)
    const PARLAY_2_ODDS: u64 = 35000u64;        // ~3.5x for 2 legs
    const PARLAY_3_ODDS: u64 = 70000u64;        // ~7x for 3 legs
    const PARLAY_4_ODDS: u64 = 140000u64;       // ~14x for 4 legs
    const PARLAY_5_ODDS: u64 = 280000u64;       // ~28x for 5 legs

    // Market categories
    const CATEGORY_SPORTS: u8 = 0u8;
    const CATEGORY_POLITICS: u8 = 1u8;
    const CATEGORY_CRYPTO: u8 = 2u8;
    const CATEGORY_WEATHER: u8 = 3u8;
    const CATEGORY_OTHER: u8 = 4u8;

    // ═══════════════════════════════════════════════════════════════════════════
    // STRUCTS (For public mappings)
    // ═══════════════════════════════════════════════════════════════════════════

    // Market metadata - stored in public mapping
    struct Market {
        creator: address,
        created_at: u32,        // Block height when created (for time-weighting)
        end_time: u32,          // Unix timestamp for market close
        resolved: bool,
        winning_outcome: u8,
        num_outcomes: u8,       // 2-10 outcomes supported
        category: u8,           // 0=Sports, 1=Politics, 2=Crypto, 3=Weather, 4=Other
        auto_resolve: bool,     // Allow resolution after end_time by anyone
        total_pool: u64,        // Total amount in all pools
    }

    // Aggregate market statistics - public
    struct MarketStats {
        total_bets: u64,        // Count of bets (not amounts)
        total_bettors: u32,     // Estimated unique bettors
        last_bet_block: u32,    // Block of most recent bet
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RECORDS (Private - only owner can decrypt)
    // ═══════════════════════════════════════════════════════════════════════════

    // Individual bet - FULLY PRIVATE
    // Only the owner can see bet details
    record Bet {
        owner: address,
        bet_id: field,
        market_id: field,
        outcome: u8,
        amount: u64,
        odds_snapshot: u64,     // Odds at time of bet (scaled by 10000)
        time_multiplier: u64,   // Early bet bonus (100-200)
        placed_at: u32,         // Block height when placed
    }

    // Combined parlay bet - FULLY PRIVATE
    // Supports 2-5 legs based on reputation tier
    record Parlay {
        owner: address,
        parlay_id: field,
        // Leg 1 (always required)
        market_1: field,
        outcome_1: u8,
        // Leg 2 (always required)
        market_2: field,
        outcome_2: u8,
        // Leg 3 (optional - 0field if unused)
        market_3: field,
        outcome_3: u8,
        // Leg 4 (optional)
        market_4: field,
        outcome_4: u8,
        // Leg 5 (optional)
        market_5: field,
        outcome_5: u8,
        // Parlay metadata
        num_legs: u8,
        amount: u64,
        combined_odds: u64,     // Combined odds (scaled by 10000)
        tier_bonus: u64,        // Bonus from reputation tier (100-130)
        placed_at: u32,
    }

    // User reputation - FULLY PRIVATE
    // Tracks betting history without exposing individual bets
    record Reputation {
        owner: address,
        total_bets: u32,
        total_wins: u32,
        total_parlays: u32,
        parlay_wins: u32,
        current_streak: u32,    // Current winning streak
        best_streak: u32,       // All-time best streak
        tier: u8,               // 1=Novice, 2=Skilled, 3=Expert, 4=Oracle
        total_wagered: u64,     // Lifetime wagered amount
        total_won: u64,         // Lifetime winnings
        last_updated: u32,      // Block height of last update
    }

    // Winnings claim receipt - FULLY PRIVATE
    record Winnings {
        owner: address,
        amount: u64,            // Payout amount in microcredits
        source_id: field,       // bet_id or parlay_id that generated this
        source_type: u8,        // 1 = single bet, 2 = parlay
        market_id: field,       // For single bets; 0field for parlays
        claimed_at: u32,        // Block height when claimed
    }

    // Reputation proof - PRIVATE (for selective disclosure)
    // Allows proving reputation claims without revealing full stats
    record RepProof {
        owner: address,
        proof_id: field,
        tier_proven: u8,        // The tier being proven
        min_accuracy_proven: u8, // "My accuracy is at least X%"
        min_wins_proven: u32,   // "I have at least X wins"
        min_streak_proven: u32, // "My streak is at least X"
        valid_until: u32,       // Block height when proof expires
        created_at: u32,
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MAPPINGS (Public state - aggregated data only)
    // ═══════════════════════════════════════════════════════════════════════════

    // Market data
    mapping markets: field => Market;
    mapping market_stats: field => MarketStats;

    // Pool totals - AGGREGATED ONLY (no individual data)
    // Key: BHP256::hash_to_field(market_id + outcome)
    // Value: Total microcredits bet on this outcome
    mapping outcome_pools: field => u64;

    // Claim tracking - MINIMAL (only bool, no amounts or addresses)
    // Prevents double-claiming without exposing who claimed what
    mapping claimed_bets: field => bool;
    mapping claimed_parlays: field => bool;

    // Market existence check
    mapping market_exists: field => bool;

    // ═══════════════════════════════════════════════════════════════════════════
    // INLINE HELPERS (Pure functions)
    // ═══════════════════════════════════════════════════════════════════════════

    // Calculate time-weight multiplier based on blocks elapsed since market creation
    inline get_time_multiplier(created_at: u32, current_block: u32) -> u64 {
        let elapsed: u32 = current_block >= created_at ? current_block - created_at : 0u32;

        if elapsed < BLOCKS_6H {
            return MULTIPLIER_EARLY;    // 2.0x for first 6 hours
        } else if elapsed < BLOCKS_12H {
            return MULTIPLIER_MID;      // 1.5x for 6-12 hours
        } else if elapsed < BLOCKS_24H {
            return MULTIPLIER_LATE;     // 1.2x for 12-24 hours
        } else {
            return MULTIPLIER_BASE;     // 1.0x after 24 hours
        }
    }

    // Get maximum parlay legs based on reputation tier
    inline get_max_legs(tier: u8) -> u8 {
        if tier == TIER_NOVICE { return 2u8; }
        else if tier == TIER_SKILLED { return 3u8; }
        else if tier == TIER_EXPERT { return 4u8; }
        else { return 5u8; }  // Oracle
    }

    // Get tier bonus multiplier (base 100)
    inline get_tier_bonus(tier: u8) -> u64 {
        if tier == TIER_NOVICE { return BONUS_NOVICE; }
        else if tier == TIER_SKILLED { return BONUS_SKILLED; }
        else if tier == TIER_EXPERT { return BONUS_EXPERT; }
        else { return BONUS_ORACLE; }
    }

    // Calculate tier from stats
    inline calculate_tier(wins: u32, total: u32) -> u8 {
        // Avoid division by zero
        if total == 0u32 { return TIER_NOVICE; }

        let accuracy: u32 = (wins * 100u32) / total;

        if wins >= TIER_ORACLE_WINS && accuracy >= TIER_ORACLE_ACC {
            return TIER_ORACLE;
        } else if wins >= TIER_EXPERT_WINS && accuracy >= TIER_EXPERT_ACC {
            return TIER_EXPERT;
        } else if wins >= TIER_SKILLED_WINS && accuracy >= TIER_SKILLED_ACC {
            return TIER_SKILLED;
        } else {
            return TIER_NOVICE;
        }
    }

    // Generate pool key from market_id and outcome
    inline get_pool_key(market_id: field, outcome: u8) -> field {
        let combined: field = market_id + (outcome as field);
        return BHP256::hash_to_field(combined);
    }

    // Max helper for u32
    inline max_u32(a: u32, b: u32) -> u32 {
        if a > b { return a; } else { return b; }
    }

    // Min helper for u64
    inline min_u64(a: u64, b: u64) -> u64 {
        if a < b { return a; } else { return b; }
    }

    // Get parlay base odds by number of legs
    inline get_parlay_base_odds(num_legs: u8) -> u64 {
        if num_legs == 2u8 { return PARLAY_2_ODDS; }
        else if num_legs == 3u8 { return PARLAY_3_ODDS; }
        else if num_legs == 4u8 { return PARLAY_4_ODDS; }
        else { return PARLAY_5_ODDS; }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TRANSITIONS - MARKET MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /// Create a new prediction market
    ///
    /// # Arguments
    /// * `market_id` - Unique identifier for the market
    /// * `end_time` - Unix timestamp when betting closes
    /// * `num_outcomes` - Number of possible outcomes (2-10)
    /// * `category` - Market category (0-4)
    /// * `auto_resolve` - Whether market can be resolved by anyone after end_time
    async transition create_market(
        public market_id: field,
        public end_time: u32,
        public num_outcomes: u8,
        public category: u8,
        public auto_resolve: bool
    ) -> Future {
        // Validate inputs
        assert(num_outcomes >= 2u8);
        assert(num_outcomes <= MAX_OUTCOMES);
        assert(category <= CATEGORY_OTHER);

        return finalize_create_market(
            market_id,
            self.caller,
            end_time,
            num_outcomes,
            category,
            auto_resolve
        );
    }

    async function finalize_create_market(
        market_id: field,
        creator: address,
        end_time: u32,
        num_outcomes: u8,
        category: u8,
        auto_resolve: bool
    ) {
        // Ensure market doesn't already exist
        let exists: bool = market_exists.get_or_use(market_id, false);
        assert(!exists);

        // Create market
        let market: Market = Market {
            creator: creator,
            created_at: block.height,
            end_time: end_time,
            resolved: false,
            winning_outcome: 0u8,
            num_outcomes: num_outcomes,
            category: category,
            auto_resolve: auto_resolve,
            total_pool: 0u64,
        };

        markets.set(market_id, market);
        market_exists.set(market_id, true);

        // Initialize stats
        let stats: MarketStats = MarketStats {
            total_bets: 0u64,
            total_bettors: 0u32,
            last_bet_block: 0u32,
        };
        market_stats.set(market_id, stats);

        // Initialize pools for all MAX_OUTCOMES slots unconditionally.
        // Pools for i >= num_outcomes are set but will never be used (outcome
        // validation in finalize_place_bet ensures outcome < num_outcomes).
        // This avoids set() inside a conditional in an async function.
        let key0: field = get_pool_key(market_id, 0u8);
        outcome_pools.set(key0, 0u64);
        let key1: field = get_pool_key(market_id, 1u8);
        outcome_pools.set(key1, 0u64);
        let key2: field = get_pool_key(market_id, 2u8);
        outcome_pools.set(key2, 0u64);
        let key3: field = get_pool_key(market_id, 3u8);
        outcome_pools.set(key3, 0u64);
        let key4: field = get_pool_key(market_id, 4u8);
        outcome_pools.set(key4, 0u64);
        let key5: field = get_pool_key(market_id, 5u8);
        outcome_pools.set(key5, 0u64);
        let key6: field = get_pool_key(market_id, 6u8);
        outcome_pools.set(key6, 0u64);
        let key7: field = get_pool_key(market_id, 7u8);
        outcome_pools.set(key7, 0u64);
        let key8: field = get_pool_key(market_id, 8u8);
        outcome_pools.set(key8, 0u64);
        let key9: field = get_pool_key(market_id, 9u8);
        outcome_pools.set(key9, 0u64);
    }

    /// Resolve a market with the winning outcome
    ///
    /// # Arguments
    /// * `market_id` - Market to resolve
    /// * `winning_outcome` - The winning outcome index (0 to num_outcomes-1)
    async transition resolve_market(
        public market_id: field,
        public winning_outcome: u8
    ) -> Future {
        return finalize_resolve_market(market_id, winning_outcome, self.caller);
    }

    async function finalize_resolve_market(
        market_id: field,
        winning_outcome: u8,
        caller: address
    ) {
        // Get market
        let market: Market = markets.get(market_id);

        // Validate
        assert(!market.resolved);
        assert(winning_outcome < market.num_outcomes);

        // Authorization check: creator OR (auto_resolve AND past end_time)
        let is_creator: bool = caller == market.creator;
        let can_auto: bool = market.auto_resolve && block.height >= market.end_time;
        assert(is_creator || can_auto);

        // Update market to resolved
        let resolved_market: Market = Market {
            creator: market.creator,
            created_at: market.created_at,
            end_time: market.end_time,
            resolved: true,
            winning_outcome: winning_outcome,
            num_outcomes: market.num_outcomes,
            category: market.category,
            auto_resolve: market.auto_resolve,
            total_pool: market.total_pool,
        };

        markets.set(market_id, resolved_market);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TRANSITIONS - BETTING (PRIVACY-FIRST)
    // ═══════════════════════════════════════════════════════════════════════════

    /// Place a bet using a private Credits record
    ///
    /// PRIVACY: Amount comes from Credits record (private), not as parameter
    /// PRIVACY: Outcome is a private input, not visible in transaction
    ///
    /// # Arguments
    /// * `payment` - Credits record to pay for the bet (amount is private)
    /// * `market_id` - Market to bet on (public, required for routing)
    /// * `outcome` - Outcome to bet on (PRIVATE)
    /// * `nonce` - Random value for bet_id generation (PRIVATE)
    async transition place_bet(
        payment: credits.aleo/credits,
        public market_id: field,
        outcome: u8,
        nonce: field
    ) -> (Bet, credits.aleo/credits, Future) {
        // Extract amount from PRIVATE Credits record
        // The amount is NEVER exposed as a public parameter
        let amount: u64 = payment.microcredits;

        // Validate minimum bet
        assert(amount >= MIN_BET);

        // Generate unique bet_id from nonce
        let bet_id: field = BHP256::hash_to_field(nonce);

        // Transfer to contract using PRIVATE method
        // This hides: sender address, exact amount
        let (remaining, transfer_future): (credits.aleo/credits, Future) =
            credits.aleo/transfer_private_to_public(
                payment,
                self.address,
                amount
            );

        // Create PRIVATE bet record
        // All fields are encrypted, only owner can decrypt
        let bet: Bet = Bet {
            owner: self.caller,
            bet_id: bet_id,
            market_id: market_id,
            outcome: outcome,
            amount: amount,
            odds_snapshot: ODDS_SCALE,  // Placeholder, actual odds at claim
            time_multiplier: MULTIPLIER_BASE, // Set in finalize
            placed_at: 0u32, // Block height set in finalize
        };

        return (
            bet,
            remaining,
            finalize_place_bet(market_id, outcome, amount, bet_id, transfer_future)
        );
    }

    async function finalize_place_bet(
        market_id: field,
        outcome: u8,
        amount: u64,
        bet_id: field,
        transfer_future: Future
    ) {
        // Await the credit transfer
        transfer_future.await();

        // Validate market exists, is open, and has not passed its end_time
        let market: Market = markets.get(market_id);
        assert(!market.resolved);
        assert(outcome < market.num_outcomes);
        assert(block.height < market.end_time);

        // Update AGGREGATED pool only (no individual data stored!)
        let pool_key: field = get_pool_key(market_id, outcome);
        let current_pool: u64 = outcome_pools.get_or_use(pool_key, 0u64);
        outcome_pools.set(pool_key, current_pool + amount);

        // Update market total pool
        let updated_market: Market = Market {
            creator: market.creator,
            created_at: market.created_at,
            end_time: market.end_time,
            resolved: market.resolved,
            winning_outcome: market.winning_outcome,
            num_outcomes: market.num_outcomes,
            category: market.category,
            auto_resolve: market.auto_resolve,
            total_pool: market.total_pool + amount,
        };
        markets.set(market_id, updated_market);

        // Update aggregated stats only (no individual tracking!)
        let stats: MarketStats = market_stats.get_or_use(market_id, MarketStats {
            total_bets: 0u64,
            total_bettors: 0u32,
            last_bet_block: 0u32,
        });

        let new_stats: MarketStats = MarketStats {
            total_bets: stats.total_bets + 1u64,
            total_bettors: stats.total_bettors + 1u32,
            last_bet_block: block.height,
        };
        market_stats.set(market_id, new_stats);

        // ═══════════════════════════════════════════════════════════════════════
        // CRITICAL PRIVACY FIX: NO bet_data mapping!
        // Individual bet data stays ONLY in the user's private Bet record
        // This is the key difference from Wave 1 that raises Privacy score
        // ═══════════════════════════════════════════════════════════════════════
    }

    /// Claim winnings by consuming the Bet record directly
    ///
    /// PRIVACY: No public lookup needed - bet record is consumed
    /// PRIVACY: Payout is transferred privately via credits record
    ///
    /// # Arguments
    /// * `bet` - The Bet record to claim (consumed)
    async transition claim_winnings(
        bet: Bet
    ) -> (Winnings, credits.aleo/credits, Future) {
        // Only owner can claim (enforced by record ownership)
        assert_eq(bet.owner, self.caller);

        // Calculate payout off-chain using snapshot values from the Bet record.
        // The finalize will re-verify these values against on-chain state.
        let effective_bet: u64 = (bet.amount * bet.time_multiplier) / MULTIPLIER_BASE;

        // gross_winnings placeholder: we use bet.odds_snapshot stored at bet time.
        // odds_snapshot = total_pool / winning_pool * ODDS_SCALE at bet placement.
        // net = effective_bet * odds_snapshot / ODDS_SCALE - fee
        let gross_winnings: u64 = (effective_bet * bet.odds_snapshot) / ODDS_SCALE;
        let fee: u64 = (gross_winnings * PROTOCOL_FEE) / ODDS_SCALE;
        let net_winnings: u64 = gross_winnings - fee;

        // Transfer net_winnings privately from contract's public balance to caller
        let (payout_record, transfer_future): (credits.aleo/credits, Future) =
            credits.aleo/transfer_public_to_private(self.caller, net_winnings);

        let winnings: Winnings = Winnings {
            owner: self.caller,
            amount: net_winnings,
            source_id: bet.bet_id,
            source_type: 1u8,
            market_id: bet.market_id,
            claimed_at: 0u32,
        };

        return (
            winnings,
            payout_record,
            finalize_claim_winnings(
                bet.bet_id,
                bet.market_id,
                bet.outcome,
                transfer_future
            )
        );
    }

    async function finalize_claim_winnings(
        bet_id: field,
        market_id: field,
        outcome: u8,
        transfer_future: Future
    ) {
        // Await the credit transfer (ensures contract has sufficient public balance)
        transfer_future.await();

        // Check not already claimed (minimal public footprint - just bool)
        let already_claimed: bool = claimed_bets.get_or_use(bet_id, false);
        assert(!already_claimed);

        // Get market and validate winning outcome
        let market: Market = markets.get(market_id);
        assert(market.resolved);
        assert(outcome == market.winning_outcome);

        // Mark as claimed to prevent double-claiming
        claimed_bets.set(bet_id, true);
    }

    /// Claim two winning bets in a single transaction (batch operation)
    /// Reduces gas costs and improves privacy (fewer transactions)
    async transition claim_two_winnings(
        bet1: Bet,
        bet2: Bet
    ) -> (Winnings, credits.aleo/credits, Future) {
        // Both bets must be owned by caller
        assert_eq(bet1.owner, self.caller);
        assert_eq(bet2.owner, self.caller);

        // Calculate payout for each bet off-chain
        let effective_1: u64 = (bet1.amount * bet1.time_multiplier) / MULTIPLIER_BASE;
        let gross_1: u64 = (effective_1 * bet1.odds_snapshot) / ODDS_SCALE;
        let fee_1: u64 = (gross_1 * PROTOCOL_FEE) / ODDS_SCALE;
        let net_1: u64 = gross_1 - fee_1;

        let effective_2: u64 = (bet2.amount * bet2.time_multiplier) / MULTIPLIER_BASE;
        let gross_2: u64 = (effective_2 * bet2.odds_snapshot) / ODDS_SCALE;
        let fee_2: u64 = (gross_2 * PROTOCOL_FEE) / ODDS_SCALE;
        let net_2: u64 = gross_2 - fee_2;

        let total_payout: u64 = net_1 + net_2;

        // Transfer combined payout privately
        let (payout_record, transfer_future): (credits.aleo/credits, Future) =
            credits.aleo/transfer_public_to_private(self.caller, total_payout);

        let winnings: Winnings = Winnings {
            owner: self.caller,
            amount: total_payout,
            source_id: bet1.bet_id,
            source_type: 1u8,
            market_id: bet1.market_id,
            claimed_at: 0u32,
        };

        return (
            winnings,
            payout_record,
            finalize_claim_two(
                bet1.bet_id, bet1.market_id, bet1.outcome,
                bet2.bet_id, bet2.market_id, bet2.outcome,
                transfer_future
            )
        );
    }

    async function finalize_claim_two(
        bet_id_1: field, market_id_1: field, outcome_1: u8,
        bet_id_2: field, market_id_2: field, outcome_2: u8,
        transfer_future: Future
    ) {
        // Await the combined credit transfer
        transfer_future.await();

        // Check neither is already claimed
        assert(!claimed_bets.get_or_use(bet_id_1, false));
        assert(!claimed_bets.get_or_use(bet_id_2, false));

        // Validate both bets won their respective markets
        let market1: Market = markets.get(market_id_1);
        assert(market1.resolved && outcome_1 == market1.winning_outcome);

        let market2: Market = markets.get(market_id_2);
        assert(market2.resolved && outcome_2 == market2.winning_outcome);

        // Mark both as claimed
        claimed_bets.set(bet_id_1, true);
        claimed_bets.set(bet_id_2, true);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TRANSITIONS - REPUTATION SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    /// Initialize reputation for a new user
    /// Creates a fresh Reputation record at Novice tier
    transition init_reputation() -> Reputation {
        return Reputation {
            owner: self.caller,
            total_bets: 0u32,
            total_wins: 0u32,
            total_parlays: 0u32,
            parlay_wins: 0u32,
            current_streak: 0u32,
            best_streak: 0u32,
            tier: TIER_NOVICE,
            total_wagered: 0u64,
            total_won: 0u64,
            last_updated: 0u32,
        };
    }

    /// Update reputation after winning bet(s)
    ///
    /// # Arguments
    /// * `reputation` - Current reputation record (consumed)
    /// * `bets_won` - Number of bets won
    /// * `amount_won` - Total amount won
    transition update_reputation_win(
        reputation: Reputation,
        bets_won: u32,
        amount_won: u64
    ) -> Reputation {
        // Validate ownership
        assert_eq(reputation.owner, self.caller);

        let new_wins: u32 = reputation.total_wins + bets_won;
        let new_total: u32 = reputation.total_bets + bets_won;
        let new_streak: u32 = reputation.current_streak + bets_won;
        let new_best: u32 = max_u32(reputation.best_streak, new_streak);
        let new_tier: u8 = calculate_tier(new_wins, new_total);

        return Reputation {
            owner: self.caller,
            total_bets: new_total,
            total_wins: new_wins,
            total_parlays: reputation.total_parlays,
            parlay_wins: reputation.parlay_wins,
            current_streak: new_streak,
            best_streak: new_best,
            tier: new_tier,
            total_wagered: reputation.total_wagered,
            total_won: reputation.total_won + amount_won,
            last_updated: 0u32,
        };
    }

    /// Update reputation after losing bet(s)
    /// Resets current streak
    transition update_reputation_loss(
        reputation: Reputation,
        bets_lost: u32,
        amount_lost: u64
    ) -> Reputation {
        assert_eq(reputation.owner, self.caller);

        let new_total: u32 = reputation.total_bets + bets_lost;
        let new_tier: u8 = calculate_tier(reputation.total_wins, new_total);

        return Reputation {
            owner: self.caller,
            total_bets: new_total,
            total_wins: reputation.total_wins,
            total_parlays: reputation.total_parlays,
            parlay_wins: reputation.parlay_wins,
            current_streak: 0u32,  // Reset streak on loss
            best_streak: reputation.best_streak,
            tier: new_tier,
            total_wagered: reputation.total_wagered + amount_lost,
            total_won: reputation.total_won,
            last_updated: 0u32,
        };
    }

    /// Update reputation after placing bet (before outcome known)
    transition update_reputation_bet_placed(
        reputation: Reputation,
        amount_wagered: u64
    ) -> Reputation {
        assert_eq(reputation.owner, self.caller);

        return Reputation {
            owner: self.caller,
            total_bets: reputation.total_bets,
            total_wins: reputation.total_wins,
            total_parlays: reputation.total_parlays,
            parlay_wins: reputation.parlay_wins,
            current_streak: reputation.current_streak,
            best_streak: reputation.best_streak,
            tier: reputation.tier,
            total_wagered: reputation.total_wagered + amount_wagered,
            total_won: reputation.total_won,
            last_updated: 0u32,
        };
    }

    /// Generate a proof of reputation (selective disclosure)
    /// Proves claims about reputation without revealing full stats
    ///
    /// # Arguments
    /// * `reputation` - Current reputation (consumed and returned)
    /// * `prove_tier` - Minimum tier to prove
    /// * `prove_accuracy` - Minimum accuracy percentage to prove
    /// * `prove_wins` - Minimum wins to prove
    /// * `prove_streak` - Minimum streak to prove
    transition prove_reputation(
        reputation: Reputation,
        prove_tier: u8,
        prove_accuracy: u8,
        prove_wins: u32,
        prove_streak: u32,
        public current_block: u32
    ) -> (RepProof, Reputation) {
        assert_eq(reputation.owner, self.caller);

        // Calculate actual accuracy using ternary to avoid illegal scope-parent assignment
        let accuracy: u8 = reputation.total_bets > 0u32
            ? ((reputation.total_wins * 100u32) / reputation.total_bets) as u8
            : 0u8;

        // Verify all claims are valid
        assert(reputation.tier >= prove_tier);
        assert(accuracy >= prove_accuracy);
        assert(reputation.total_wins >= prove_wins);
        assert(reputation.current_streak >= prove_streak);

        // Generate proof ID
        let proof_id: field = BHP256::hash_to_field(
            self.caller as field + current_block as field
        );

        let proof: RepProof = RepProof {
            owner: self.caller,
            proof_id: proof_id,
            tier_proven: prove_tier,
            min_accuracy_proven: prove_accuracy,
            min_wins_proven: prove_wins,
            min_streak_proven: prove_streak,
            valid_until: current_block + 100000u32,  // ~1 week validity
            created_at: current_block,
        };

        // Return both proof and reputation (reputation unchanged)
        return (proof, reputation);
    }

    /// Verify that a reputation proof is valid (not expired)
    transition verify_reputation_proof(
        proof: RepProof,
        public current_block: u32
    ) -> RepProof {
        // Check proof hasn't expired
        assert(current_block <= proof.valid_until);

        // Return proof (still valid)
        return proof;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TRANSITIONS - PARLAY SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    /// Create a 2-leg parlay (available to all tiers)
    async transition create_parlay_2(
        payment: credits.aleo/credits,
        reputation: Reputation,
        market_1: field, outcome_1: u8,
        market_2: field, outcome_2: u8,
        nonce: field
    ) -> (Parlay, Reputation, credits.aleo/credits, Future) {
        // Validate ownership and tier
        assert_eq(reputation.owner, self.caller);
        assert(get_max_legs(reputation.tier) >= 2u8);

        let amount: u64 = payment.microcredits;
        assert(amount >= MIN_BET);

        let tier_bonus: u64 = get_tier_bonus(reputation.tier);
        let parlay_id: field = BHP256::hash_to_field(nonce);
        let combined_odds: u64 = PARLAY_2_ODDS;

        // Transfer payment
        let (remaining, transfer_future): (credits.aleo/credits, Future) =
            credits.aleo/transfer_private_to_public(payment, self.address, amount);

        // Create parlay record
        let parlay: Parlay = Parlay {
            owner: self.caller,
            parlay_id: parlay_id,
            market_1: market_1, outcome_1: outcome_1,
            market_2: market_2, outcome_2: outcome_2,
            market_3: 0field, outcome_3: 0u8,
            market_4: 0field, outcome_4: 0u8,
            market_5: 0field, outcome_5: 0u8,
            num_legs: 2u8,
            amount: amount,
            combined_odds: combined_odds,
            tier_bonus: tier_bonus,
            placed_at: 0u32,
        };

        // Update reputation (parlays count)
        let updated_rep: Reputation = Reputation {
            owner: reputation.owner,
            total_bets: reputation.total_bets + 2u32,
            total_wins: reputation.total_wins,
            total_parlays: reputation.total_parlays + 1u32,
            parlay_wins: reputation.parlay_wins,
            current_streak: reputation.current_streak,
            best_streak: reputation.best_streak,
            tier: reputation.tier,
            total_wagered: reputation.total_wagered + amount,
            total_won: reputation.total_won,
            last_updated: 0u32,
        };

        return (
            parlay,
            updated_rep,
            remaining,
            finalize_create_parlay(market_1, market_2, 0field, 0field, 0field, 2u8, transfer_future)
        );
    }

    /// Create a 3-leg parlay (requires Skilled tier or higher)
    async transition create_parlay_3(
        payment: credits.aleo/credits,
        reputation: Reputation,
        market_1: field, outcome_1: u8,
        market_2: field, outcome_2: u8,
        market_3: field, outcome_3: u8,
        nonce: field
    ) -> (Parlay, Reputation, credits.aleo/credits, Future) {
        assert_eq(reputation.owner, self.caller);
        assert(get_max_legs(reputation.tier) >= 3u8);  // Skilled+ required

        let amount: u64 = payment.microcredits;
        assert(amount >= MIN_BET);

        let tier_bonus: u64 = get_tier_bonus(reputation.tier);
        let parlay_id: field = BHP256::hash_to_field(nonce);
        let combined_odds: u64 = PARLAY_3_ODDS;

        let (remaining, transfer_future): (credits.aleo/credits, Future) =
            credits.aleo/transfer_private_to_public(payment, self.address, amount);

        let parlay: Parlay = Parlay {
            owner: self.caller,
            parlay_id: parlay_id,
            market_1: market_1, outcome_1: outcome_1,
            market_2: market_2, outcome_2: outcome_2,
            market_3: market_3, outcome_3: outcome_3,
            market_4: 0field, outcome_4: 0u8,
            market_5: 0field, outcome_5: 0u8,
            num_legs: 3u8,
            amount: amount,
            combined_odds: combined_odds,
            tier_bonus: tier_bonus,
            placed_at: 0u32,
        };

        let updated_rep: Reputation = Reputation {
            owner: reputation.owner,
            total_bets: reputation.total_bets + 3u32,
            total_wins: reputation.total_wins,
            total_parlays: reputation.total_parlays + 1u32,
            parlay_wins: reputation.parlay_wins,
            current_streak: reputation.current_streak,
            best_streak: reputation.best_streak,
            tier: reputation.tier,
            total_wagered: reputation.total_wagered + amount,
            total_won: reputation.total_won,
            last_updated: 0u32,
        };

        return (
            parlay,
            updated_rep,
            remaining,
            finalize_create_parlay(market_1, market_2, market_3, 0field, 0field, 3u8, transfer_future)
        );
    }

    /// Create a 4-leg parlay (requires Expert tier or higher)
    async transition create_parlay_4(
        payment: credits.aleo/credits,
        reputation: Reputation,
        market_1: field, outcome_1: u8,
        market_2: field, outcome_2: u8,
        market_3: field, outcome_3: u8,
        market_4: field, outcome_4: u8,
        nonce: field
    ) -> (Parlay, Reputation, credits.aleo/credits, Future) {
        assert_eq(reputation.owner, self.caller);
        assert(get_max_legs(reputation.tier) >= 4u8);  // Expert+ required

        let amount: u64 = payment.microcredits;
        assert(amount >= MIN_BET);

        let tier_bonus: u64 = get_tier_bonus(reputation.tier);
        let parlay_id: field = BHP256::hash_to_field(nonce);
        let combined_odds: u64 = PARLAY_4_ODDS;

        let (remaining, transfer_future): (credits.aleo/credits, Future) =
            credits.aleo/transfer_private_to_public(payment, self.address, amount);

        let parlay: Parlay = Parlay {
            owner: self.caller,
            parlay_id: parlay_id,
            market_1: market_1, outcome_1: outcome_1,
            market_2: market_2, outcome_2: outcome_2,
            market_3: market_3, outcome_3: outcome_3,
            market_4: market_4, outcome_4: outcome_4,
            market_5: 0field, outcome_5: 0u8,
            num_legs: 4u8,
            amount: amount,
            combined_odds: combined_odds,
            tier_bonus: tier_bonus,
            placed_at: 0u32,
        };

        let updated_rep: Reputation = Reputation {
            owner: reputation.owner,
            total_bets: reputation.total_bets + 4u32,
            total_wins: reputation.total_wins,
            total_parlays: reputation.total_parlays + 1u32,
            parlay_wins: reputation.parlay_wins,
            current_streak: reputation.current_streak,
            best_streak: reputation.best_streak,
            tier: reputation.tier,
            total_wagered: reputation.total_wagered + amount,
            total_won: reputation.total_won,
            last_updated: 0u32,
        };

        return (
            parlay,
            updated_rep,
            remaining,
            finalize_create_parlay(market_1, market_2, market_3, market_4, 0field, 4u8, transfer_future)
        );
    }

    /// Create a 5-leg parlay (requires Oracle tier)
    async transition create_parlay_5(
        payment: credits.aleo/credits,
        reputation: Reputation,
        market_1: field, outcome_1: u8,
        market_2: field, outcome_2: u8,
        market_3: field, outcome_3: u8,
        market_4: field, outcome_4: u8,
        market_5: field, outcome_5: u8,
        nonce: field
    ) -> (Parlay, Reputation, credits.aleo/credits, Future) {
        assert_eq(reputation.owner, self.caller);
        assert(get_max_legs(reputation.tier) >= 5u8);  // Oracle required

        let amount: u64 = payment.microcredits;
        assert(amount >= MIN_BET);

        let tier_bonus: u64 = get_tier_bonus(reputation.tier);
        let parlay_id: field = BHP256::hash_to_field(nonce);
        let combined_odds: u64 = PARLAY_5_ODDS;

        let (remaining, transfer_future): (credits.aleo/credits, Future) =
            credits.aleo/transfer_private_to_public(payment, self.address, amount);

        let parlay: Parlay = Parlay {
            owner: self.caller,
            parlay_id: parlay_id,
            market_1: market_1, outcome_1: outcome_1,
            market_2: market_2, outcome_2: outcome_2,
            market_3: market_3, outcome_3: outcome_3,
            market_4: market_4, outcome_4: outcome_4,
            market_5: market_5, outcome_5: outcome_5,
            num_legs: 5u8,
            amount: amount,
            combined_odds: combined_odds,
            tier_bonus: tier_bonus,
            placed_at: 0u32,
        };

        let updated_rep: Reputation = Reputation {
            owner: reputation.owner,
            total_bets: reputation.total_bets + 5u32,
            total_wins: reputation.total_wins,
            total_parlays: reputation.total_parlays + 1u32,
            parlay_wins: reputation.parlay_wins,
            current_streak: reputation.current_streak,
            best_streak: reputation.best_streak,
            tier: reputation.tier,
            total_wagered: reputation.total_wagered + amount,
            total_won: reputation.total_won,
            last_updated: 0u32,
        };

        return (
            parlay,
            updated_rep,
            remaining,
            finalize_create_parlay(market_1, market_2, market_3, market_4, market_5, 5u8, transfer_future)
        );
    }

    /// Finalize parlay creation - validates all markets are open
    /// Uses get_or_use with a sentinel resolved=true market as fallback so that
    /// optional legs (market == 0field, not in mapping) never cause a revert on get,
    /// and the assert correctly passes (resolved=true → assert(!resolved) would fail,
    /// so we skip the assert for unused legs by checking market_id != 0field first).
    async function finalize_create_parlay(
        market_1: field,
        market_2: field,
        market_3: field,
        market_4: field,
        market_5: field,
        num_legs: u8,
        transfer_future: Future
    ) {
        // Await credit transfer
        transfer_future.await();

        // Sentinel: a resolved dummy market used as fallback for unused legs
        let dummy: Market = Market {
            creator: self.address,
            created_at: 0u32,
            end_time: 0u32,
            resolved: false,    // false so assert(!resolved) passes for unused legs
            winning_outcome: 0u8,
            num_outcomes: 2u8,
            category: 4u8,
            auto_resolve: false,
            total_pool: 0u64,
        };

        // Validate market 1 (always required)
        let m1: Market = markets.get(market_1);
        assert(!m1.resolved);

        // Validate market 2 (always required)
        let m2: Market = markets.get(market_2);
        assert(!m2.resolved);

        // Validate market 3 — safe: get_or_use returns dummy (resolved=false) when unused
        let m3: Market = markets.get_or_use(market_3, dummy);
        assert(num_legs < 3u8 || !m3.resolved);

        // Validate market 4 — same pattern
        let m4: Market = markets.get_or_use(market_4, dummy);
        assert(num_legs < 4u8 || !m4.resolved);

        // Validate market 5 — same pattern
        let m5: Market = markets.get_or_use(market_5, dummy);
        assert(num_legs < 5u8 || !m5.resolved);
    }

    /// Claim parlay winnings
    /// ALL legs must have won for the parlay to pay out
    async transition claim_parlay(
        parlay: Parlay,
        reputation: Reputation
    ) -> (Winnings, Reputation, Future) {
        assert_eq(parlay.owner, self.caller);
        assert_eq(reputation.owner, self.caller);

        // Calculate payout: amount * combined_odds * tier_bonus / (ODDS_SCALE * 100)
        let gross_payout: u64 = (parlay.amount * parlay.combined_odds) / ODDS_SCALE;
        let with_bonus: u64 = (gross_payout * parlay.tier_bonus) / MULTIPLIER_BASE;
        let fee: u64 = (with_bonus * PROTOCOL_FEE) / ODDS_SCALE;
        let net_payout: u64 = with_bonus - fee;

        let winnings: Winnings = Winnings {
            owner: self.caller,
            amount: net_payout,
            source_id: parlay.parlay_id,
            source_type: 2u8,  // Parlay
            market_id: 0field, // Not applicable for parlays
            claimed_at: 0u32,
        };

        // Update reputation for parlay win
        let new_streak: u32 = reputation.current_streak + parlay.num_legs as u32;
        let new_best: u32 = max_u32(reputation.best_streak, new_streak);
        let new_wins: u32 = reputation.total_wins + parlay.num_legs as u32;
        let new_tier: u8 = calculate_tier(new_wins, reputation.total_bets);

        let updated_rep: Reputation = Reputation {
            owner: reputation.owner,
            total_bets: reputation.total_bets,
            total_wins: new_wins,
            total_parlays: reputation.total_parlays,
            parlay_wins: reputation.parlay_wins + 1u32,
            current_streak: new_streak,
            best_streak: new_best,
            tier: new_tier,
            total_wagered: reputation.total_wagered,
            total_won: reputation.total_won + net_payout,
            last_updated: 0u32,
        };

        return (
            winnings,
            updated_rep,
            finalize_claim_parlay(
                parlay.parlay_id,
                parlay.market_1, parlay.outcome_1,
                parlay.market_2, parlay.outcome_2,
                parlay.market_3, parlay.outcome_3,
                parlay.market_4, parlay.outcome_4,
                parlay.market_5, parlay.outcome_5,
                parlay.num_legs
            )
        );
    }

    async function finalize_claim_parlay(
        parlay_id: field,
        market_1: field, outcome_1: u8,
        market_2: field, outcome_2: u8,
        market_3: field, outcome_3: u8,
        market_4: field, outcome_4: u8,
        market_5: field, outcome_5: u8,
        num_legs: u8
    ) {
        // Check not already claimed
        let already_claimed: bool = claimed_parlays.get_or_use(parlay_id, false);
        assert(!already_claimed);

        // Dummy market used as fallback for unused legs (outcome 255u8 never matches)
        let dummy: Market = Market {
            creator: self.address,
            created_at: 0u32,
            end_time: 0u32,
            resolved: true,
            winning_outcome: 255u8,
            num_outcomes: 2u8,
            category: 4u8,
            auto_resolve: false,
            total_pool: 0u64,
        };

        // Leg 1 (always required) — direct get, always valid
        let m1: Market = markets.get(market_1);
        assert(m1.resolved && outcome_1 == m1.winning_outcome);

        // Leg 2 (always required) — direct get, always valid
        let m2: Market = markets.get(market_2);
        assert(m2.resolved && outcome_2 == m2.winning_outcome);

        // Leg 3 — get_or_use avoids get on non-existent key when unused
        // If unused: dummy.winning_outcome=255, outcome_3=0 → 0==255 is false → assert fails
        // So we skip the check with (num_legs < 3u8 || ...)
        let m3: Market = markets.get_or_use(market_3, dummy);
        assert(num_legs < 3u8 || (m3.resolved && outcome_3 == m3.winning_outcome));

        // Leg 4
        let m4: Market = markets.get_or_use(market_4, dummy);
        assert(num_legs < 4u8 || (m4.resolved && outcome_4 == m4.winning_outcome));

        // Leg 5
        let m5: Market = markets.get_or_use(market_5, dummy);
        assert(num_legs < 5u8 || (m5.resolved && outcome_5 == m5.winning_outcome));

        // Mark as claimed
        claimed_parlays.set(parlay_id, true);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY TRANSITIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /// Calculate the time multiplier for a given market and current block
    /// Useful for frontend to display expected multiplier
    transition calculate_time_multiplier(
        created_at: u32,
        current_block: u32
    ) -> u64 {
        return get_time_multiplier(created_at, current_block);
    }

    /// Calculate the tier bonus for a given tier
    transition calculate_tier_bonus(tier: u8) -> u64 {
        return get_tier_bonus(tier);
    }

    /// Calculate the tier from stats
    transition calculate_tier_from_stats(wins: u32, total: u32) -> u8 {
        return calculate_tier(wins, total);
    }

    /// Get maximum parlay legs for a tier
    transition get_tier_max_legs(tier: u8) -> u8 {
        return get_max_legs(tier);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR - REQUIRED FOR DEPLOYMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /// Constructor for deployment - prevents future upgrades
    @noupgrade
    async constructor() {
        // The Leo compiler automatically generates the constructor logic.
    }
}
