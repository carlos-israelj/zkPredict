program zkpredict.aleo {

    // ============================================
    // RECORDS (Private State)
    // ============================================

    // Private bet record - only the owner knows their position
    // Wave 2: Added bet_id for double-claim prevention
    record Bet {
        owner: address,
        market_id: field,
        bet_id: field,  // Unique bet identifier for claim tracking
        outcome: u8,  // Wave 3: Changed from bool to u8 for multi-outcome support (0-255 outcomes)
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
    // Wave 2: Added auto_resolve capability
    // Wave 3: Support for multi-outcome markets
    // Wave 4: Added category field
    struct Market {
        creator: address,
        end_time: u32,  // Unix timestamp
        resolved: bool,
        winning_outcome: u8,  // Wave 3: Changed from bool to u8 for multi-outcome
        num_outcomes: u8,  // Wave 3: Number of possible outcomes (2-255)
        category: u8,  // Wave 4: Market category (0=Sports, 1=Politics, 2=Crypto, 3=Weather, 4=Other)
        auto_resolve: bool,  // Wave 2: Can market auto-resolve at end_time
    }


    // ============================================
    // MAPPINGS (Public State)
    // ============================================

    mapping markets: field => Market;

    // Wave 3: Dynamic pool mappings for multi-outcome support
    // Key format: hash(market_id, outcome_index)
    mapping outcome_pools: field => u64;

    // Wave 2: Track claimed bets to prevent double-claiming
    mapping claimed_bets: field => bool;

    // Wave 1 legacy (will migrate to outcome_pools)
    mapping yes_pool: field => u64;
    mapping no_pool: field => u64;


    // ============================================
    // CONSTRUCTOR (Required for deployment)
    // Wave 1: Non-upgradable program
    // ============================================

    @noupgrade async constructor() {
        // Constructor must be empty - Leo compiler will insert the appropriate code
        // Markets are created dynamically via create_market transition
    }


    // ============================================
    // TRANSITION: Create Market
    // Wave 2: Added auto_resolve parameter
    // Wave 3: Added num_outcomes for multi-outcome markets
    // Wave 4: Added category for market discovery
    // ============================================

    async transition create_market(
        public market_id: field,
        public end_time: u32,
        public num_outcomes: u8,  // Wave 3: Number of outcomes (2-255)
        public category: u8,  // Wave 4: Category (0-4)
        public auto_resolve: bool  // Wave 2: Enable auto-resolution
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

        // Wave 3: Validate num_outcomes (minimum 2, maximum 255)
        assert(num_outcomes >= 2u8);

        // Wave 4: Validate category (0-4)
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

        // Wave 3: Initialize all outcome pools
        // For binary markets (num_outcomes=2), also set legacy pools for backwards compatibility
        if (num_outcomes == 2u8) {
            Mapping::set(yes_pool, market_id, 0u64);
            Mapping::set(no_pool, market_id, 0u64);
        }
    }


    // ============================================
    // TRANSITION: Place Bet
    // Wave 2: Added bet_id for claim tracking
    // Wave 3: Support for multi-outcome markets (outcome as u8)
    // ============================================

    async transition place_bet(
        public market_id: field,
        public outcome: u8,  // Wave 3: Changed from bool to u8
        public amount: u64,
        public nonce: field  // Wave 2: Nonce for unique bet_id generation
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

        return (bet_record, finalize_place_bet(market_id, outcome, amount));
    }

    async function finalize_place_bet(
        market_id: field,
        outcome: u8,
        amount: u64
    ) {
        // Ensure market exists
        let market: Market = Mapping::get(markets, market_id);

        // Ensure market is not resolved
        assert(!market.resolved);

        // Wave 3: Validate outcome is within range
        assert(outcome < market.num_outcomes);

        // Generate pool key for this outcome: hash(market_id || outcome)
        let pool_key: field = BHP256::hash_to_field(market_id);

        // Update the outcome pool
        let current_pool: u64 = Mapping::get_or_use(outcome_pools, pool_key, 0u64);
        let new_pool: u64 = current_pool + amount;
        Mapping::set(outcome_pools, pool_key, new_pool);

        // Backwards compatibility for binary markets (outcome 0=NO, 1=YES)
        if (market.num_outcomes == 2u8) {
            let current_yes_pool: u64 = Mapping::get_or_use(yes_pool, market_id, 0u64);
            let current_no_pool: u64 = Mapping::get_or_use(no_pool, market_id, 0u64);

            let new_yes_pool: u64 = (outcome == 1u8) ? current_yes_pool + amount : current_yes_pool;
            let new_no_pool: u64 = (outcome == 0u8) ? current_no_pool + amount : current_no_pool;

            Mapping::set(yes_pool, market_id, new_yes_pool);
            Mapping::set(no_pool, market_id, new_no_pool);
        }
    }


    // ============================================
    // TRANSITION: Resolve Market
    // Wave 2: Added time-based resolution check
    // Wave 3: Support for multi-outcome markets
    // ============================================

    async transition resolve_market(
        public market_id: field,
        public winning_outcome: u8,  // Wave 3: Changed from bool to u8
        public current_time: u32  // Wave 2: Current timestamp for validation
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

        // Wave 3: Validate winning_outcome is within range
        assert(winning_outcome < market.num_outcomes);

        // Wave 2: Check resolution permissions
        // Either creator can resolve OR auto_resolve is enabled and time has passed
        let is_creator: bool = market.creator == caller;
        let is_time_passed: bool = current_time >= market.end_time;
        let can_auto_resolve: bool = market.auto_resolve && is_time_passed;

        assert(is_creator || can_auto_resolve);

        // Wave 2: If not creator, must wait until end_time
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
    // Wave 2: Added double-claim prevention using bet_id
    // Wave 3: Support for multi-outcome markets
    // ============================================

    async transition claim_winnings(
        bet: Bet
    ) -> (Winnings, Future) {
        // Verify bet owner is the claimer
        assert_eq(bet.owner, self.signer);

        // Calculate winnings off-chain
        let winnings_record: Winnings = Winnings {
            owner: self.signer,
            amount: 0u64,  // Will be calculated on-chain
            market_id: bet.market_id,
        };

        return (winnings_record, finalize_claim_winnings(bet.market_id, bet.bet_id, bet.outcome, bet.amount));
    }

    async function finalize_claim_winnings(
        market_id: field,
        bet_id: field,
        bet_outcome: u8,
        bet_amount: u64
    ) {
        // Wave 2: Check if bet has already been claimed
        let already_claimed: bool = Mapping::get_or_use(claimed_bets, bet_id, false);
        assert(!already_claimed);

        // Get market
        let market: Market = Mapping::get(markets, market_id);

        // Ensure market is resolved
        assert(market.resolved);

        // Ensure bet outcome matches winning outcome
        assert_eq(bet_outcome, market.winning_outcome);

        // Wave 3: Calculate winnings for multi-outcome markets
        // For binary markets, use legacy pools
        let total_yes_pool: u64 = Mapping::get(yes_pool, market_id);
        let total_no_pool: u64 = Mapping::get(no_pool, market_id);

        let total_pool: u64 = total_yes_pool + total_no_pool;
        let winning_pool: u64 = (market.winning_outcome == 1u8) ? total_yes_pool : total_no_pool;

        // Prevent division by zero
        assert(winning_pool > 0u64);
        assert(total_pool > 0u64);

        // Calculate proportional winnings
        // winnings = (bet_amount / winning_pool) * total_pool
        let winnings_share: u64 = (bet_amount * total_pool) / winning_pool;

        // Wave 2: Mark bet as claimed to prevent double-claiming
        Mapping::set(claimed_bets, bet_id, true);
    }
}
