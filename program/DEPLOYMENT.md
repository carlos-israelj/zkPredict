# zkPredict Deployment Guide - Complete Reference

This document provides complete deployment instructions for zkPredict contracts on Aleo, including all lessons learned and best practices.

## 📋 Table of Contents

1. [Critical Prerequisites](#critical-prerequisites)
2. [Constructor Requirements](#constructor-requirements)
3. [Deployment Commands](#deployment-commands)
4. [Troubleshooting](#troubleshooting)
5. [Deployment History](#deployment-history)
6. [Post-Deployment](#post-deployment)

---

## 🚨 Critical Prerequisites

### 1. Constructor Annotation (REQUIRED)

**⚠️ CRITICAL**: All Aleo programs deployed after Leo v3.1.0 **MUST** have a constructor with one of these annotations:

```leo
// Option 1: Non-upgradable (recommended for production)
@noupgrade
async constructor() {
    // The Leo compiler automatically generates the constructor logic.
}

// Option 2: Admin-controlled upgrades
@admin(address="aleo1your_admin_address_here")
async constructor() {
    // The Leo compiler automatically generates the constructor logic.
}

// Option 3: DAO/voting-controlled upgrades
@checksum(mapping="voting_program.aleo/approved_checksum", key="true")
async constructor() {
    // The Leo compiler automatically generates the constructor logic.
}

// Option 4: Custom upgrade logic
@custom
async constructor() {
    // Write your own upgrade validation logic
    if self.edition > 0u16 {
        assert(block.height >= 1300u32); // Time-lock example
    }
}
```

**Why this matters**:
- Leo CLI will show: `⚠️ The program does not contain a constructor. The deployment will likely fail`
- Deployment will fail with HTTP 500 error if constructor is missing or invalid
- The constructor is **immutable** after first deployment - any bugs are permanent

### 2. Network Configuration

Create/verify `.env` file in your program directory:

```env
NETWORK=testnet
PRIVATE_KEY=APrivateKey1zkp...your_key_here...
ENDPOINT=https://api.explorer.provable.com/v1
```

**Important**: Use the correct endpoint:
- ✅ Correct: `https://api.explorer.provable.com/v1`
- ❌ Wrong: `https://api.explorer.aleo.org/v1` (redirects, will cause issues)
- ❌ Wrong: `https://api.provable.com/v2` (API v2 is different service)

### 3. Sufficient Credits

Check your balance:
```bash
# Your balance is shown in deployment output
leo deploy --network testnet -y --broadcast
# Output: "💰Your current public balance is X credits"
```

**Deployment costs vary by program size**:
- Small program (40 statements): ~4 credits
- Medium program (500 statements): ~10-15 credits
- Large program (1200+ statements): ~15-25 credits

Get testnet credits: https://faucet.aleo.org

---

## 🔧 Constructor Requirements

### The Anatomy of a Valid Constructor

Leo CLI validates constructors by checking:

1. **Annotation present**: `@noupgrade`, `@admin`, `@checksum`, or `@custom`
2. **Signature**: `async constructor()` with no parameters
3. **Empty body** (for `@noupgrade`, `@admin`, `@checksum`) or custom logic (for `@custom`)

### Generated AVM Code

For `@noupgrade`, Leo generates:
```aleo
constructor:
    assert.eq edition 0u16;
```

This prevents any future upgrades by ensuring `edition` stays at 0.

### Common Constructor Errors

**❌ Missing annotation:**
```leo
async transition initialize() -> Future {
    return finalize_initialize();
}
```
**Error**: `The program does not contain a constructor`

**❌ Wrong function name:**
```leo
@noupgrade
async transition initialize() -> Future {  // Wrong! Should be "constructor"
    // ...
}
```

**✅ Correct:**
```leo
@noupgrade
async constructor() {
    // The Leo compiler automatically generates the constructor logic.
}
```

---

## 🚀 Deployment Commands

### Standard Deployment (Interactive)

```bash
cd /path/to/your/program
leo build
leo deploy --network testnet --broadcast
```

### Non-Interactive Deployment (CI/CD)

```bash
leo deploy --network testnet -y --broadcast
```

**Flags explained**:
- `--network testnet` - Target network (testnet or mainnet)
- `-y` or `--yes` - Skip confirmation prompt (required for non-TTY environments)
- `--broadcast` - Broadcast transaction to network (default is local-only)

### Save Transaction Locally (Without Broadcasting)

```bash
leo deploy --network testnet -y --save deployment_transaction
```

This creates `deployment_transaction/your_program.aleo.deployment.json`

**Use case**: Review transaction details before broadcasting, or broadcast manually later.

### Deployment Process Stages

When you run `leo deploy`, it goes through these stages:

1. **Compilation** (~5-10 seconds)
   ```
   Leo ✅ Compiled 'your_program.aleo' into Aleo instructions.
   ```

2. **Constructor Validation** (instant)
   ```
   🔧 Your program has the following constructor:
   constructor:
       assert.eq edition 0u16;
   ```

3. **Transaction Synthesis** (varies by program size)
   - Small: 10-30 seconds
   - Medium: 30-90 seconds
   - Large (1000+ statements): 2-5 minutes

   ```
   📦 Creating deployment transaction for 'your_program.aleo'...
   ```

4. **Cost Calculation**
   ```
   💰 Cost Breakdown:
     Transaction Storage: X credits
     Program Synthesis:   Y credits
     Namespace:           1.000000 credits
     Constructor:         0.002000 credits
     Total Fee:           Z credits
   ```

5. **Broadcasting** (~5-15 seconds)
   ```
   📡 Broadcasting deployment...
   ✉️ Broadcasted transaction with:
     - transaction ID: 'at1...'
     - fee ID: 'au1...'
   ```

6. **Confirmation** (~30-60 seconds)
   ```
   🔄 Searching up to 12 blocks to confirm transaction...
   ✅ Deployment confirmed!
   ```

---

## 🐛 Troubleshooting

### Issue 1: "The program does not contain a constructor"

**Symptoms**:
- Warning during deployment
- HTTP 500 error when broadcasting
- Constructor cost shows: `0.000000 credits`

**Root Cause**: Missing or invalid constructor annotation

**Solution**:
1. Add `@noupgrade` annotation to your constructor function:
   ```leo
   @noupgrade
   async constructor() {
       // The Leo compiler automatically generates the constructor logic.
   }
   ```

2. Ensure function is named `constructor`, not `initialize`

3. Rebuild: `leo build`

4. Verify constructor in output:
   ```
   🔧 Your program has the following constructor:
   constructor:
       assert.eq edition 0u16;
   ```

5. Redeploy

### Issue 2: "IO error: not a terminal"

**Symptoms**:
```
Failed to prompt user: IO error: not a terminal
```

**Root Cause**: Leo CLI trying to show interactive prompt in non-interactive environment

**Solution**: Add `-y` flag:
```bash
leo deploy --network testnet -y --broadcast
```

### Issue 3: HTTP 500 on Broadcast

**Possible Causes**:

1. **Missing/invalid constructor** (most common)
   - See Issue 1 above

2. **Endpoint issues**
   - Verify `.env` uses: `https://api.explorer.provable.com/v1`
   - NOT `https://api.explorer.aleo.org/v1` (redirects)

3. **Network congestion**
   - Try again after 1-2 minutes
   - Check https://testnet.explorer.provable.com for network status

4. **Insufficient balance**
   - Verify you have enough credits for deployment cost

### Issue 4: Transaction Synthesis Taking Too Long

**Normal behavior**:
- Programs with 1000+ statements can take 2-5 minutes to synthesize
- Leo is generating proving keys for your entire program
- This is a one-time cost

**What to do**:
- Wait patiently - don't interrupt the process
- Monitor the process if running in background:
  ```bash
  # If using background process
  ps aux | grep leo
  ```

### Issue 5: "Program already exists"

**Symptoms**:
```
Error: Program 'your_program.aleo' already exists on testnet
```

**Solutions**:

**Option A: Use existing deployment**
- The program is already deployed
- Use the existing program ID in your application

**Option B: Deploy with new name**
1. Update `program.json`:
   ```json
   {
     "program": "your_program_v2.aleo",
     ...
   }
   ```

2. Update `src/main.leo`:
   ```leo
   program your_program_v2.aleo {
       // ...
   }
   ```

3. Rebuild and deploy:
   ```bash
   leo build
   leo deploy --network testnet -y --broadcast
   ```

---

## 📊 Deployment History

### zkpredict_parlays_2leg.aleo - February 13, 2026

**Status:** ✅ Successfully Deployed

**Transaction Details:**
- **Transaction ID**: `at1qqnyzpyp2kpjczxqp7n8myhkq7ls25ajh4l7x2szceyc2xzxssgqsjv90v`
- **Fee ID**: `au1chptepsvjqk8x2agng97vdz5frcu4zuj8wa7twh4l64n4s6uqy8qmxx6fl`
- **Fee Transaction ID**: `at1wq84yuhnv7w9qct043ps6xxrndrcx2caa8jsxdj78h6d64xymcxsrn06eq`

**Program Statistics:**
- Total Variables: 165,167
- Total Constraints: 127,626
- Statements: 38 (after optimization)

**Cost Breakdown:**
- Transaction Storage: 2.624 credits
- Program Synthesis: 0.292793 credits
- Namespace: 1.000 credits
- Constructor: 0.002 credits
- **Total Fee**: 3.918793 credits

**Explorer Links:**
- Program: https://testnet.explorer.provable.com/program/zkpredict_parlays_2leg.aleo
- Transaction: https://testnet.explorer.provable.com/transaction/at1qqnyzpyp2kpjczxqp7n8myhkq7ls25ajh4l7x2szceyc2xzxssgqsjv90v

**Key Learnings:**
- Constructor annotation (`@noupgrade`) was CRITICAL for success
- Without annotation, deployment failed with HTTP 500
- Modular architecture (38 statements) deploys quickly (~60 seconds synthesis)

### zkpredict2.aleo - January 30, 2026

**Status:** ✅ Successfully Deployed

**Transaction Details:**
- **Transaction ID**: `at1uaezw9wsrskwex086wu6aj6ryas6m6eq90xn5qydwj7ymlva2qgstgl3vt`
- **Network**: Aleo Testnet
- **Total Fee**: 6.908620 credits

**Program Statistics:**
- Total Variables: 130,407
- Total Constraints: 101,213

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment

**Check transaction status:**
```bash
# In explorer
https://testnet.explorer.provable.com/transaction/YOUR_TX_ID

# Or via Leo CLI
leo query transaction YOUR_TX_ID --network testnet
```

**Wait for confirmation:**
- Typically 1-3 minutes for transaction inclusion
- Explorer will show "Accepted" status

### 2. Test Basic Functionality

**Query a mapping:**
```bash
leo query YOUR_MAPPING_NAME "YOUR_KEY" --network testnet
```

**Execute a transition:**
```bash
leo execute YOUR_FUNCTION_NAME \
  "param1" \
  "param2" \
  --network testnet
```

### 3. Update Frontend Configuration

If you have a frontend application:

```typescript
// src/types/index.ts or config file
export const PROGRAM_ID = "your_program.aleo";
export const NETWORK = "testnet";
export const RPC_URL = "https://testnet.aleorpc.com";
```

### 4. Document Deployment

Save key information:
- Transaction ID
- Program ID
- Constructor type used
- Deployment cost
- Any issues encountered

### 5. Monitor Initial Usage

- Watch for any errors in first user transactions
- Monitor gas costs for common operations
- Check for any edge cases in your logic

---

## 🔐 Security Best Practices

### Private Key Management

```bash
# ❌ Never commit .env to git
echo ".env" >> .gitignore

# ✅ Use different keys for testnet/mainnet
# Testnet key (okay to use liberally)
PRIVATE_KEY_TESTNET=APrivateKey1zkp...

# Mainnet key (high security)
PRIVATE_KEY_MAINNET=APrivateKey1zkp... # Store in password manager
```

### Constructor Security

```leo
// ❌ Bad: Empty constructor with bugs
@custom
async constructor() {
    // Forgot to add validation!
}

// ✅ Good: Properly validated
@custom
async constructor() {
    if self.edition > 0u16 {
        // Only allow upgrades after time-lock
        assert(block.height >= self.Program::deployed_height() + 100000u32);
    }
}
```

**Remember**: Constructor logic is **IMMUTABLE** after deployment!

### Upgrade Strategy

If you need upgradeability:

```leo
// For admin-controlled upgrades
@admin(address="aleo1your_multisig_address")
async constructor() {}

// For DAO-controlled upgrades
@checksum(mapping="dao.aleo/approved_checksums", key="true")
async constructor() {}
```

**Best practice**: Use multisig or DAO, not single admin address

---

## 📚 Additional Resources

### Official Documentation
- [Leo Language Guide](https://developer.aleo.org/leo)
- [Leo Deploy Command](https://developer.aleo.org/leo/commands#leo-deploy)
- [Aleo Upgradability Guide](https://developer.aleo.org/leo/upgrading-programs)
- [Constructor Documentation](https://developer.aleo.org/leo/language#constructors)

### Tools
- [Testnet Faucet](https://faucet.aleo.org)
- [Testnet Explorer](https://testnet.explorer.provable.com)
- [Aleo Package Manager](https://aleo.pm)

### Community
- [Aleo Discord](https://discord.gg/aleo)
- [Aleo GitHub](https://github.com/AleoHQ)

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check Leo CLI version**: `leo --version` (recommend v2.2.0+)
2. **Search existing issues**: [Leo GitHub Issues](https://github.com/AleoHQ/leo/issues)
3. **Ask in Discord**: #developer-support channel
4. **Create GitHub issue**: Include full error output and program.json

---

**Last Updated**: February 13, 2026
**Leo Version**: v2.2.0+
**Network**: Aleo Testnet Beta
**Deployment Status**: ✅ Actively deploying zkpredict_v5.aleo
