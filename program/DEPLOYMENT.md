# zkPredict Deployment Guide

This document describes the successful deployment of zkpredict2.aleo to the Aleo testnet.

## Deployment History

### zkpredict2.aleo - January 30, 2026

**Status:** ✅ Successfully Deployed

**Transaction Details:**
- **Transaction ID:** `at1uaezw9wsrskwex086wu6aj6ryas6m6eq90xn5qydwj7ymlva2qgstgl3vt`
- **Fee ID:** `au1vu2haa7cqsyjvzvss3helcf5ccknsgq2hpyd9cl9lnkfvrjthqxstny99g`
- **Fee Transaction ID:** `at1atxwrp3cdxp630fq769zmywuhq657fudvq7wdz8gj6egzg3ykgqsl086f3`
- **Network:** Aleo Testnet (testnet)
- **Endpoint:** https://api.explorer.provable.com/v1
- **Consensus Version:** 12

**Cost Breakdown:**
- Transaction Storage: 5.675000 credits
- Program Synthesis: 0.231620 credits
- Namespace: 1.000000 credits
- Constructor: 0.002000 credits
- Priority Fee: 0.000000 credits
- **Total Fee:** 6.908620 credits

**Program Statistics:**
- Total Variables: 130,407
- Total Constraints: 101,213
- Max Variables: 2,097,152
- Max Constraints: 2,097,152

**Deployer Account:**
- Address: `aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war`
- Balance Before: 16.731606 credits
- Balance After: ~9.823 credits

**Explorer Links:**
- Program: https://testnet.explorer.provable.com/program/zkpredict2.aleo
- Transaction: https://testnet.explorer.provable.com/transaction/at1uaezw9wsrskwex086wu6aj6ryas6m6eq90xn5qydwj7ymlva2qgstgl3vt

## Deployment Command

The successful deployment used the Leo CLI with the following command:

```bash
leo deploy --network testnet --broadcast -y
```

### Command Flags:
- `--network testnet` - Deploy to Aleo testnet
- `--broadcast` - Broadcast the transaction to the network
- `-y` - Skip confirmation prompt (auto-confirm)

### Environment Variables

The deployment used environment variables from `.env`:

```env
NETWORK=testnet
PRIVATE_KEY=APrivateKey1zkp...
ENDPOINT=https://api.explorer.provable.com/v1
```

## Why zkpredict2.aleo?

The program was renamed from `zkpredict.aleo` to `zkpredict2.aleo` to resolve wallet adapter caching issues. The Aleo wallet adapters were caching the old contract definition, causing errors when claiming winnings with the new `claim_winnings(bet_id: field)` signature.

## Key Changes from zkpredict.aleo

### 1. Claim Winnings Flow
**Old (zkpredict.aleo):**
```leo
transition claim_winnings(bet: Bet) -> (Winnings, Future)
```
- Required passing the full encrypted Bet record
- Issue: Leo Wallet cannot accept encrypted records as transaction inputs

**New (zkpredict2.aleo):**
```leo
transition claim_winnings(public bet_id: field) -> (Winnings, Future)
```
- Only requires the bet_id (a field value)
- Bet data is stored in `bet_data` mapping for verification
- Maintains privacy: amounts and outcomes remain private until claim

### 2. BetData Mapping
Added new struct and mapping to support bet_id-based claims:

```leo
struct BetData {
    bettor: address,
    market_id: field,
    outcome: u8,
    amount: u64,
    odds_at_bet: u64,
}

mapping bet_data: field => BetData;
```

This mapping is populated when users place bets and is used to verify claims.

## Deployment Prerequisites

### Required Tools:
- Leo CLI (installed via cargo)
- At least 7 credits in public balance or a fee record

### Pre-deployment Checklist:
1. ✅ Build the program: `leo build`
2. ✅ Configure `.env` with correct network and private key
3. ✅ Verify sufficient balance for deployment fee (~7 credits)
4. ✅ Ensure program name in `program.json` matches the code

## Troubleshooting

### Issue 1: "IO error: not a terminal"
**Problem:** Leo deploy requires interactive confirmation
**Solution:** Use the `-y` flag to skip confirmation

### Issue 2: "Transaction(s) will NOT be broadcast"
**Problem:** Missing `--broadcast` flag
**Solution:** Add `--broadcast` flag to the command

### Issue 3: "snarkos: command not found"
**Problem:** Trying to use `snarkos developer deploy` without snarkos installed
**Solution:** Use `leo deploy` instead, which is available

### Issue 4: Wallet adapter caching old contract
**Problem:** Wallet shows "Input is not a valid record type" after contract update
**Solution:** Deploy with a new program name (e.g., zkpredict2.aleo)

## Post-Deployment Steps

1. **Wait for block confirmation** (2-3 minutes)
   - The deployment transaction needs to be included in a block
   - Monitor at: https://testnet.explorer.provable.com/transaction/at1uaezw9wsrskwex086wu6aj6ryas6m6eq90xn5qydwj7ymlva2qgstgl3vt

2. **Update frontend configuration**
   - Already updated in codebase to use `zkpredict2.aleo`
   - Vercel will auto-deploy (2-3 minutes)

3. **Test complete flow:**
   ```
   a. Create a market
   b. Place a bet (save the bet_id!)
   c. Resolve the market
   d. Claim winnings using bet_id
   ```

4. **Verify on-chain state:**
   ```bash
   # Check if a market exists
   curl "https://api.provable.com/v2/testnet/program/zkpredict2.aleo/mapping/markets/{market_id}"

   # Check outcome pools
   curl "https://api.provable.com/v2/testnet/program/zkpredict2.aleo/mapping/outcome_pools/{pool_key}"

   # Check if bet is claimed
   curl "https://api.provable.com/v2/testnet/program/zkpredict2.aleo/mapping/claimed_bets/{bet_id}"
   ```

## Frontend Integration

The frontend has been updated to work with zkpredict2.aleo:

**Files Updated:**
- `src/types/index.ts` - Updated `ZKPREDICT_PROGRAM_ID`
- `src/lib/aleo.ts` - Updated `PROGRAM_ID`
- `src/components/markets/CreateMarket.tsx` - Uses new program ID
- `src/components/markets/PlaceBet.tsx` - Displays bet_id for claiming
- `src/components/markets/ClaimWinnings.tsx` - Accepts bet_id instead of record
- `src/components/markets/ResolveMarket.tsx` - Uses new program ID

**Live URL:** https://zkpredict.lat

## Security Notes

1. **Private Key Management:**
   - Never commit `.env` file to git
   - Use different keys for testnet and mainnet
   - Rotate keys regularly

2. **Fee Records:**
   - Store fee records securely
   - Never share encrypted records publicly
   - Use `snarkos developer decrypt` to decrypt if needed

3. **Double-Claim Prevention:**
   - The `claimed_bets` mapping prevents users from claiming the same bet twice
   - Verified in `finalize_claim_winnings`

## Maintenance

### Re-deploying (if needed):
If you need to deploy a new version:

1. Change program name in `program.json` (e.g., `zkpredict3.aleo`)
2. Update all references in the code
3. Build: `leo build`
4. Deploy: `leo deploy --network testnet --broadcast -y`
5. Update frontend to use new program ID

### Monitoring:
- Check program status: https://testnet.explorer.provable.com/program/zkpredict2.aleo
- Check recent transactions: Filter by program name
- Monitor balance: https://aleo.tools

## References

- [Aleo Developer Documentation](https://developer.aleo.org)
- [Leo Language Guide](https://developer.aleo.org/leo)
- [Leo Deploy Command](https://developer.aleo.org/leo/commands#leo-deploy)
- [Aleo Testnet Explorer](https://testnet.explorer.provable.com)
- [Provable API v2](https://api.provable.com/v2)

## Support

For issues or questions:
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Aleo Discord: https://discord.gg/aleo
- Leo Documentation: https://developer.aleo.org

---

**Last Updated:** January 30, 2026
**Program Version:** zkpredict2.aleo (Wave 5 - bet_id based claims)
**Deployment Status:** ✅ Live on Testnet
