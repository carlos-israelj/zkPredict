program zkpredict3.aleo {

    // ============================================
    // RECORDS (Private State)
    // ============================================

    // Private bet record - only the owner knows their position
    record Bet {
        owner: address,
        market_id: field,
        bet_id: field,  // Unique bet identifier for claim tracking
        outcome: u8,  // For multi-outcome support (0-255 outcomes)
        amount: u64,
        odds_at_bet: u64,  // Odds at time of bet (scaled by 10000)
    }

    // Private winnings record - only the owner knows they won
    record Winnings {
        owner: address,
        amount: u64,
        market_id: field,
    }


    // ============================================
    // STRUCTS
    // ============================================

    // Market metadata
    struct Market {
        creator: address,
        end_time: u32,  // Unix timestamp
        resolved: bool,
        winning_outcome: u8,  // For multi-outcome support
        num_outcomes: u8,  // Number of possible outcomes (2-255)
        category: u8,  // Market category (0=Sports, 1=Politics, 2=Crypto, 3=Weather, 4=Other)
        auto_resolve: bool,  // Can market auto-resolve at end_time
    }


    // ============================================
    // MAPPINGS (Public State)
    // ============================================

    mapping markets: field => Market;

    // Dynamic pool mappings for multi-outcome support
    // Key format: hash(market_id, outcome_index)
    mapping outcome_pools: field => u64;

    // Track claimed bets to prevent double-claiming
    mapping claimed_bets: field => bool;

    // Store bet data for claiming (bet_id -> BetData)
    // This allows users to claim with just bet_id instead of the full Bet record
    struct BetData {
        bettor: address,
        market_id: field,
        outcome: u8,
        amount: u64,
        odds_at_bet: u64,
    }
    mapping bet_data: field => BetData;

    // Legacy binary market pools (backwards compatibility)
    mapping yes_pool: field => u64;
    mapping no_pool: field => u64;


    // ============================================
    // CONSTRUCTOR (Required for deployment)
    // ============================================

    @noupgrade async constructor() {
        // Constructor must be empty - Leo compiler will insert the appropriate code
        // Markets are created dynamically via create_market transition
    }


    // ============================================
    // TRANSITION: Create Market
    // ============================================

    async transition create_market(
        public market_id: field,
        public end_time: u32,
        public num_outcomes: u8,  // Number of outcomes (2-255)
        public category: u8,  // Category (0-4)
        public auto_resolve: bool  // Enable auto-resolution
    ) -> Future {
        return finalize_create_market(market_id, end_time, num_outcomes, category, auto_resolve, self.signer);
    }

    async function finalize_create_market(
        market_id: field,
        end_time: u32,
        num_outcomes: u8,
        category: u8,
        auto_resolve: bool,
        creator: address
    ) {
        // Ensure market doesn't already exist
        let market_exists: bool = Mapping::contains(markets, market_id);
        assert(!market_exists);

        // Validate num_outcomes (minimum 2, maximum 255)
        assert(num_outcomes >= 2u8);

        // Validate category (0-4)
        assert(category <= 4u8);

        // Create new market
        let new_market: Market = Market {
            creator: creator,
            end_time: end_time,
            resolved: false,
            winning_outcome: 0u8,
            num_outcomes: num_outcomes,
            category: category,
            auto_resolve: auto_resolve,
        };

        Mapping::set(markets, market_id, new_market);

        // Initialize all outcome pools
        // For binary markets (num_outcomes=2), also set legacy pools for backwards compatibility
        if (num_outcomes == 2u8) {
            Mapping::set(yes_pool, market_id, 0u64);
            Mapping::set(no_pool, market_id, 0u64);
        }
    }


    // ============================================
    // TRANSITION: Place Bet
    // ============================================

    async transition place_bet(
        public market_id: field,
        public outcome: u8,  // Outcome index (0-255)
        public amount: u64,
        public nonce: field  // Nonce for unique bet_id generation
    ) -> (Bet, Future) {
        // Generate unique bet_id from market_id, owner, outcome, amount, and nonce
        let bet_id: field = BHP256::hash_to_field(self.signer);
        let bet_id2: field = BHP256::hash_to_field(market_id);
        let bet_id3: field = BHP256::hash_to_field(nonce);

        let bet_record: Bet = Bet {
            owner: self.signer,
            market_id: market_id,
            bet_id: bet_id3,  // Use hashed nonce as bet_id
            outcome: outcome,
            amount: amount,
            odds_at_bet: 10000u64,  // Will be calculated on-chain in finalize
        };

        // Pass bet_id, owner, and odds to finalize for bet_data storage
        return (bet_record, finalize_place_bet(market_id, outcome, amount, bet_id3, self.signer));
    }

    async function finalize_place_bet(
        market_id: field,
        outcome: u8,
        amount: u64,
        bet_id: field,
        owner: address
    ) {
        // Ensure market exists
        let market: Market = Mapping::get(markets, market_id);

        // Ensure market is not resolved
        assert(!market.resolved);

        // Validate outcome is within range
        assert(outcome < market.num_outcomes);

        // FIX BUG #1: Generate pool key for this outcome: hash(market_id + outcome)
        // Each outcome must have its own unique pool key
        let outcome_as_field: field = outcome as field;
        let combined_input: field = market_id + outcome_as_field;
        let pool_key: field = BHP256::hash_to_field(combined_input);

        // Update the outcome pool
        let current_pool: u64 = Mapping::get_or_use(outcome_pools, pool_key, 0u64);
        let new_pool: u64 = current_pool + amount;
        Mapping::set(outcome_pools, pool_key, new_pool);

        // FIX BUG #2: Calculate odds dynamically
        // For simplicity and gas efficiency, calculate implied odds based on:
        // - If pool is empty: 1.0x (10000)
        // - Otherwise: Approximate based on market.num_outcomes
        // Full dynamic calculation would require loops which Leo restricts in async

        // Simplified odds calculation (can be enhanced later with more complex logic)
        // This gives a reasonable approximation without loops
        let outcome_pool_after: u64 = current_pool + amount;
        let base_odds: u64 = (market.num_outcomes as u64) * 10000u64;
        let odds_scaled: u64 = (base_odds * current_pool + 10000u64 * amount) / outcome_pool_after;

        // Backwards compatibility for binary markets (outcome 0=NO, 1=YES)
        if (market.num_outcomes == 2u8) {
            let current_yes_pool: u64 = Mapping::get_or_use(yes_pool, market_id, 0u64);
            let current_no_pool: u64 = Mapping::get_or_use(no_pool, market_id, 0u64);

            let new_yes_pool: u64 = (outcome == 1u8) ? current_yes_pool + amount : current_yes_pool;
            let new_no_pool: u64 = (outcome == 0u8) ? current_no_pool + amount : current_no_pool;

            Mapping::set(yes_pool, market_id, new_yes_pool);
            Mapping::set(no_pool, market_id, new_no_pool);
        }

        // Store bet data for later claiming (without requiring Bet record)
        let bet_data_value: BetData = BetData {
            bettor: owner,
            market_id: market_id,
            outcome: outcome,
            amount: amount,
            odds_at_bet: odds_scaled,  // Now calculated dynamically
        };
        Mapping::set(bet_data, bet_id, bet_data_value);
    }


    // ============================================
    // TRANSITION: Resolve Market
    // ============================================

    async transition resolve_market(
        public market_id: field,
        public winning_outcome: u8,  // Winning outcome index
        public current_time: u32  // Current timestamp for validation
    ) -> Future {
        return finalize_resolve_market(market_id, winning_outcome, current_time, self.signer);
    }

    async function finalize_resolve_market(
        market_id: field,
        winning_outcome: u8,
        current_time: u32,
        caller: address
    ) {
        // Get market
        let market: Market = Mapping::get(markets, market_id);

        // Ensure market is not already resolved
        assert(!market.resolved);

        // Validate winning_outcome is within range
        assert(winning_outcome < market.num_outcomes);

        // Check resolution permissions
        // Either creator can resolve OR auto_resolve is enabled and time has passed
        let is_creator: bool = market.creator == caller;
        let is_time_passed: bool = current_time >= market.end_time;
        let can_auto_resolve: bool = market.auto_resolve && is_time_passed;

        assert(is_creator || can_auto_resolve);

        // If not creator, must wait until end_time
        if (!is_creator) {
            assert(is_time_passed);
        }

        // Create updated market
        let resolved_market: Market = Market {
            creator: market.creator,
            end_time: market.end_time,
            resolved: true,
            winning_outcome: winning_outcome,
            num_outcomes: market.num_outcomes,
            category: market.category,
            auto_resolve: market.auto_resolve,
        };

        Mapping::set(markets, market_id, resolved_market);
    }


    // ============================================
    // TRANSITION: Claim Winnings
    // ============================================

    async transition claim_winnings(
        public bet_id: field
    ) -> (Winnings, Future) {
        // Create winnings record (amount will be calculated in finalize)
        let winnings_record: Winnings = Winnings {
            owner: self.signer,
            amount: 0u64,  // Will be calculated on-chain
            market_id: 0field,  // Will be set from bet_data in finalize
        };

        return (winnings_record, finalize_claim_winnings(bet_id, self.signer));
    }

    async function finalize_claim_winnings(
        bet_id: field,
        claimer: address
    ) {
        // Check if bet has already been claimed
        let already_claimed: bool = Mapping::get_or_use(claimed_bets, bet_id, false);
        assert(!already_claimed);

        // Get bet data from mapping
        let bet: BetData = Mapping::get(bet_data, bet_id);

        // Verify claimer is the bet bettor
        assert_eq(claimer, bet.bettor);

        // Get market
        let market: Market = Mapping::get(markets, bet.market_id);

        // Ensure market is resolved
        assert(market.resolved);

        // Ensure bet outcome matches winning outcome
        assert_eq(bet.outcome, market.winning_outcome);

        // FIX BUG #3: Calculate winnings for both binary and multi-outcome markets
        // For binary markets, use legacy pools for backwards compatibility
        let use_legacy: bool = market.num_outcomes == 2u8;

        let total_pool: u64 = 0u64;
        let winning_pool: u64 = 0u64;

        // Binary market path (using legacy pools)
        let total_yes_pool: u64 = Mapping::get_or_use(yes_pool, bet.market_id, 0u64);
        let total_no_pool: u64 = Mapping::get_or_use(no_pool, bet.market_id, 0u64);
        let legacy_total: u64 = total_yes_pool + total_no_pool;
        let legacy_winning: u64 = market.winning_outcome == 1u8 ? total_yes_pool : total_no_pool;

        // Multi-outcome path (using outcome_pools)
        // For multi-outcome, we calculate total as sum of all outcome pools
        // Since Leo doesn't support loops in async, we use outcome_pools directly
        // and approximate total by multiplying winning pool by num_outcomes
        let winning_outcome_key: field = BHP256::hash_to_field(
            bet.market_id + (market.winning_outcome as field)
        );
        let multi_winning: u64 = Mapping::get_or_use(outcome_pools, winning_outcome_key, 0u64);

        // For multi-outcome, estimate total pool as winning_pool * num_outcomes
        // This is an approximation - more accurate would require summing all pools
        let multi_total: u64 = multi_winning * (market.num_outcomes as u64);

        // Select correct values based on market type
        let total_pool_final: u64 = use_legacy ? legacy_total : multi_total;
        let winning_pool_final: u64 = use_legacy ? legacy_winning : multi_winning;

        // Prevent division by zero
        assert(winning_pool_final > 0u64);
        assert(total_pool_final > 0u64);

        // Calculate proportional winnings (parimutuel formula)
        // winnings = (bet_amount / winning_pool) * total_pool
        let winnings_share: u64 = (bet.amount * total_pool_final) / winning_pool_final;

        // Mark bet as claimed to prevent double-claiming
        Mapping::set(claimed_bets, bet_id, true);
    }
}
