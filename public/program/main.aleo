program zkpredict.aleo;

record Bet:
    owner as address.private;
    market_id as field.private;
    bet_id as field.private;
    outcome as u8.private;
    amount as u64.private;
    odds_at_bet as u64.private;

record Winnings:
    owner as address.private;
    amount as u64.private;
    market_id as field.private;

struct Market:
    creator as address;
    end_time as u32;
    resolved as boolean;
    winning_outcome as u8;
    num_outcomes as u8;
    category as u8;
    auto_resolve as boolean;

mapping markets:
    key as field.public;
    value as Market.public;

mapping outcome_pools:
    key as field.public;
    value as u64.public;

mapping claimed_bets:
    key as field.public;
    value as boolean.public;

mapping yes_pool:
    key as field.public;
    value as u64.public;

mapping no_pool:
    key as field.public;
    value as u64.public;

function initialize:
    async initialize into r0;
    output r0 as zkpredict.aleo/initialize.future;

finalize initialize:
    assert.eq true true;

function create_market:
    input r0 as field.public;
    input r1 as u32.public;
    input r2 as u8.public;
    input r3 as u8.public;
    input r4 as boolean.public;
    async create_market r0 r1 r2 r3 r4 self.signer into r5;
    output r5 as zkpredict.aleo/create_market.future;

finalize create_market:
    input r0 as field.public;
    input r1 as u32.public;
    input r2 as u8.public;
    input r3 as u8.public;
    input r4 as boolean.public;
    input r5 as address.public;
    contains markets[r0] into r6;
    not r6 into r7;
    assert.eq r7 true;
    gte r2 2u8 into r8;
    assert.eq r8 true;
    lte r3 4u8 into r9;
    assert.eq r9 true;
    cast r5 r1 false 0u8 r2 r3 r4 into r10 as Market;
    set r10 into markets[r0];
    is.eq r2 2u8 into r11;
    branch.eq r11 false to end_then_0_0;
    set 0u64 into yes_pool[r0];
    set 0u64 into no_pool[r0];
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;

function place_bet:
    input r0 as field.public;
    input r1 as u8.public;
    input r2 as u64.public;
    input r3 as field.public;
    hash.bhp256 r3 into r4 as field;
    cast self.signer r0 r4 r1 r2 10000u64 into r5 as Bet.record;
    async place_bet r0 r1 r2 into r6;
    output r5 as Bet.record;
    output r6 as zkpredict.aleo/place_bet.future;

finalize place_bet:
    input r0 as field.public;
    input r1 as u8.public;
    input r2 as u64.public;
    get markets[r0] into r3;
    not r3.resolved into r4;
    assert.eq r4 true;
    lt r1 r3.num_outcomes into r5;
    assert.eq r5 true;
    hash.bhp256 r0 into r6 as field;
    get.or_use outcome_pools[r6] 0u64 into r7;
    add r7 r2 into r8;
    set r8 into outcome_pools[r6];
    is.eq r3.num_outcomes 2u8 into r9;
    branch.eq r9 false to end_then_0_2;
    get.or_use yes_pool[r0] 0u64 into r10;
    get.or_use no_pool[r0] 0u64 into r11;
    is.eq r1 1u8 into r12;
    add r10 r2 into r13;
    ternary r12 r13 r10 into r14;
    is.eq r1 0u8 into r15;
    add r11 r2 into r16;
    ternary r15 r16 r11 into r17;
    set r14 into yes_pool[r0];
    set r17 into no_pool[r0];
    branch.eq true true to end_otherwise_0_3;
    position end_then_0_2;
    position end_otherwise_0_3;

function resolve_market:
    input r0 as field.public;
    input r1 as u8.public;
    input r2 as u32.public;
    async resolve_market r0 r1 r2 self.signer into r3;
    output r3 as zkpredict.aleo/resolve_market.future;

finalize resolve_market:
    input r0 as field.public;
    input r1 as u8.public;
    input r2 as u32.public;
    input r3 as address.public;
    get markets[r0] into r4;
    not r4.resolved into r5;
    assert.eq r5 true;
    lt r1 r4.num_outcomes into r6;
    assert.eq r6 true;
    is.eq r4.creator r3 into r7;
    gte r2 r4.end_time into r8;
    and r4.auto_resolve r8 into r9;
    or r7 r9 into r10;
    assert.eq r10 true;
    not r7 into r11;
    branch.eq r11 false to end_then_0_4;
    assert.eq r8 true;
    branch.eq true true to end_otherwise_0_5;
    position end_then_0_4;
    position end_otherwise_0_5;
    cast r4.creator r4.end_time true r1 r4.num_outcomes r4.category r4.auto_resolve into r12 as Market;
    set r12 into markets[r0];

function claim_winnings:
    input r0 as Bet.record;
    assert.eq r0.owner self.signer;
    cast self.signer 0u64 r0.market_id into r1 as Winnings.record;
    async claim_winnings r0.market_id r0.bet_id r0.outcome r0.amount into r2;
    output r1 as Winnings.record;
    output r2 as zkpredict.aleo/claim_winnings.future;

finalize claim_winnings:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u8.public;
    input r3 as u64.public;
    get.or_use claimed_bets[r1] false into r4;
    not r4 into r5;
    assert.eq r5 true;
    get markets[r0] into r6;
    assert.eq r6.resolved true;
    assert.eq r2 r6.winning_outcome;
    get yes_pool[r0] into r7;
    get no_pool[r0] into r8;
    add r7 r8 into r9;
    is.eq r6.winning_outcome 1u8 into r10;
    ternary r10 r7 r8 into r11;
    gt r11 0u64 into r12;
    assert.eq r12 true;
    gt r9 0u64 into r13;
    assert.eq r13 true;
    mul r3 r9 into r14;
    div r14 r11 into r15;
    set true into claimed_bets[r1];
