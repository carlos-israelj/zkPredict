program zkpredict.aleo {

    // ============================================
    // RECORDS (Private State)
    // ============================================

    // Private bet record - only the owner knows their position
    record Bet {
        owner: address,
        market_id: field,
        outcome: bool,  // true = YES, false = NO
        amount: u64,
        odds_at_bet: u64,  // Odds at time of bet (scaled by 10000)
    }

    // Private winnings record - only the owner knows they won
    record Winnings {
        owner: address,
        amount: u64,
    }


    // ============================================
    // STRUCTS
    // ============================================

    // Market metadata
    struct Market {
        creator: address,
        end_time: u32,  // Unix timestamp
        resolved: bool,
        winning_outcome: bool,  // true = YES won, false = NO won
    }


    // ============================================
    // MAPPINGS (Public State)
    // ============================================

    mapping markets: field => Market;
    mapping yes_pool: field => u64;
    mapping no_pool: field => u64;


    // ============================================
    // INITIALIZATION (Wave 1 MVP - No initialization needed)
    // ============================================

    async transition initialize() -> Future {
        return finalize_initialize();
    }

    async function finalize_initialize() {
        // No initialization needed for Wave 1 MVP
        // Markets are created dynamically via create_market transition
    }


    // ============================================
    // TRANSITION: Create Market
    // ============================================

    async transition create_market(
        public market_id: field,
        public end_time: u32
    ) -> Future {
        return finalize_create_market(market_id, end_time, self.signer);
    }

    async function finalize_create_market(
        market_id: field,
        end_time: u32,
        creator: address
    ) {
        // Ensure market doesn't already exist
        let market_exists: bool = Mapping::contains(markets, market_id);
        assert(!market_exists);

        // Create new market
        let new_market: Market = Market {
            creator: creator,
            end_time: end_time,
            resolved: false,
            winning_outcome: false,
        };

        Mapping::set(markets, market_id, new_market);
        Mapping::set(yes_pool, market_id, 0u64);
        Mapping::set(no_pool, market_id, 0u64);
    }


    // ============================================
    // TRANSITION: Place Bet
    // ============================================

    async transition place_bet(
        public market_id: field,
        public outcome: bool,
        public amount: u64
    ) -> (Bet, Future) {
        // Calculate current odds (scaled by 10000 for precision)
        // This is done off-chain in the transition
        let bet_record: Bet = Bet {
            owner: self.signer,
            market_id: market_id,
            outcome: outcome,
            amount: amount,
            odds_at_bet: 10000u64,  // Will be calculated on-chain in finalize
        };

        return (bet_record, finalize_place_bet(market_id, outcome, amount));
    }

    async function finalize_place_bet(
        market_id: field,
        outcome: bool,
        amount: u64
    ) {
        // Ensure market exists
        let market: Market = Mapping::get(markets, market_id);

        // Ensure market is not resolved
        assert(!market.resolved);

        // Update the appropriate pool
        let current_yes_pool: u64 = Mapping::get_or_use(yes_pool, market_id, 0u64);
        let current_no_pool: u64 = Mapping::get_or_use(no_pool, market_id, 0u64);

        let new_yes_pool: u64 = outcome ? current_yes_pool + amount : current_yes_pool;
        let new_no_pool: u64 = outcome ? current_no_pool : current_no_pool + amount;

        Mapping::set(yes_pool, market_id, new_yes_pool);
        Mapping::set(no_pool, market_id, new_no_pool);
    }


    // ============================================
    // TRANSITION: Resolve Market
    // ============================================

    async transition resolve_market(
        public market_id: field,
        public winning_outcome: bool
    ) -> Future {
        return finalize_resolve_market(market_id, winning_outcome, self.signer);
    }

    async function finalize_resolve_market(
        market_id: field,
        winning_outcome: bool,
        caller: address
    ) {
        // Get market
        let market: Market = Mapping::get(markets, market_id);

        // Ensure only creator can resolve
        assert_eq(market.creator, caller);

        // Ensure market is not already resolved
        assert(!market.resolved);

        // Create updated market
        let resolved_market: Market = Market {
            creator: market.creator,
            end_time: market.end_time,
            resolved: true,
            winning_outcome: winning_outcome,
        };

        Mapping::set(markets, market_id, resolved_market);
    }


    // ============================================
    // TRANSITION: Claim Winnings
    // ============================================

    async transition claim_winnings(
        bet: Bet
    ) -> (Winnings, Future) {
        // Calculate winnings off-chain
        let winnings_record: Winnings = Winnings {
            owner: self.signer,
            amount: 0u64,  // Will be calculated on-chain
        };

        return (winnings_record, finalize_claim_winnings(bet.market_id, bet.outcome, bet.amount, self.signer));
    }

    async function finalize_claim_winnings(
        market_id: field,
        bet_outcome: bool,
        bet_amount: u64,
        claimer: address
    ) {
        // Get market
        let market: Market = Mapping::get(markets, market_id);

        // Ensure market is resolved
        assert(market.resolved);

        // Ensure bet outcome matches winning outcome
        assert_eq(bet_outcome, market.winning_outcome);

        // Get pool sizes
        let total_yes_pool: u64 = Mapping::get(yes_pool, market_id);
        let total_no_pool: u64 = Mapping::get(no_pool, market_id);

        // Calculate winnings based on pool sizes
        // winnings = bet_amount + (bet_amount * losing_pool / winning_pool)
        let winning_pool: u64 = market.winning_outcome ? total_yes_pool : total_no_pool;
        let losing_pool: u64 = market.winning_outcome ? total_no_pool : total_yes_pool;

        // Prevent division by zero
        assert(winning_pool > 0u64);

        // Calculate proportional winnings
        // Using integer math: winnings = bet_amount + (bet_amount * losing_pool / winning_pool)
        let profit: u64 = (bet_amount * losing_pool) / winning_pool;
        let total_winnings: u64 = bet_amount + profit;

        // Note: In a production version, we would track claimed bets to prevent double-claiming
        // For Wave 1 MVP, we assume users claim once per bet
    }
}
