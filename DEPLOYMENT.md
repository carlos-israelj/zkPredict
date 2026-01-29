# zkPredict Deployment Information

## Testnet Deployment - January 29, 2026

### Contract Information
- **Program ID**: `zkpredict.aleo`
- **Network**: Aleo Testnet
- **Endpoint**: `https://api.explorer.provable.com/v1`
- **Consensus Version**: 12

### Deployment Transaction
- **Transaction ID**: `at1l87a0xcnu28pjaudlcm0vjee2cfna7rck7ghsd7rugh5v8tamyzs4usrdr`
- **Fee Transaction ID**: `at1jsk84x2rvfd8mlvqa08kdhk3xacs56fc92hl7d257hxy8hxqzufq6j6080`
- **Total Cost**: 15.755450 credits

### Cost Breakdown
- Transaction Storage: 5.480000 credits
- Program Synthesis: 0.273450 credits
- Namespace: 10.000000 credits
- Constructor: 0.002000 credits
- Priority Fee: 0.000000 credits

### Program Statistics
- Total Variables: 154,019
- Total Constraints: 119,431
- Program Checksum: `[66u8, 174u8, 227u8, 61u8, 91u8, 187u8, 90u8, 138u8, 151u8, 28u8, 70u8, 159u8, 111u8, 176u8, 15u8, 210u8, 39u8, 138u8, 235u8, 244u8, 77u8, 53u8, 230u8, 83u8, 221u8, 211u8, 53u8, 228u8, 167u8, 219u8, 49u8, 11u8]`

### Available Transitions
1. `constructor` - Program constructor (@noupgrade)
2. `create_market` - Create new prediction market
3. `place_bet` - Place a private bet on a market
4. `resolve_market` - Resolve market outcome (creator or auto-resolve)
5. `claim_winnings` - Claim winnings with bet record

### Explorer Links
- Transaction: `https://explorer.provable.com/transaction/at1l87a0xcnu28pjaudlcm0vjee2cfna7rck7ghsd7rugh5v8tamyzs4usrdr`
- Program: `https://explorer.provable.com/program/zkpredict.aleo`

### Next Steps

1. ✅ Smart contract deployed successfully
2. ⏭️ Update frontend configuration to use deployed program
3. ⏭️ Test contract functions via Leo CLI
4. ⏭️ Integrate with frontend UI
5. ⏭️ Set up metadata backend (Supabase)

### Testing the Deployed Contract

```bash
# Create a market
leo execute create_market \
  "1field" \
  "1740000000u32" \
  "2u8" \
  "0u8" \
  "false" \
  --network testnet

# Place a bet
leo execute place_bet \
  "1field" \
  "1u8" \
  "1000000u64" \
  "123field" \
  --network testnet

# Resolve market (creator only)
leo execute resolve_market \
  "1field" \
  "1u8" \
  "1740000000u32" \
  --network testnet
```

### Important Notes

- This deployment uses `@noupgrade` constructor - the program **CANNOT be upgraded**
- All future changes will require deploying a new program with a different name
- The program is now live on Aleo testnet and ready for integration
