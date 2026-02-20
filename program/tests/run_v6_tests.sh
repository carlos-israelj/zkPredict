#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZKPREDICT V6 — TEST RUNNER
# ═══════════════════════════════════════════════════════════════════════════════
# Runs both Leo unit tests and integration tests for zkpredict_v6.aleo.
#
# Usage:
#   cd program/
#   chmod +x tests/run_v6_tests.sh
#   ./tests/run_v6_tests.sh [--unit-only | --integration-only]
#
# Options:
#   --unit-only          Run only Leo @test unit tests (no on-chain txs)
#   --integration-only   Run only shell integration tests (on-chain txs)
#   (no flag)            Run both
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROGRAM_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

RUN_UNIT=true
RUN_INTEGRATION=true

if [ "$1" = "--unit-only" ]; then
    RUN_INTEGRATION=false
elif [ "$1" = "--integration-only" ]; then
    RUN_UNIT=false
fi

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         ZKPREDICT V6 — FULL TEST SUITE                   ║${NC}"
echo -e "${BOLD}║         Program: zkpredict_v6.aleo                       ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

UNIT_EXIT=0
INTEGRATION_EXIT=0

# ─────────────────────────────────────────────────────────────────────────────
# PART 1 — LEO UNIT TESTS
# ─────────────────────────────────────────────────────────────────────────────

if [ "$RUN_UNIT" = true ]; then
    echo -e "${BLUE}┌──────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│  PART 1: Leo @test Unit Tests                            │${NC}"
    echo -e "${BLUE}│  File: tests/zkpredict_v6_tests.leo                      │${NC}"
    echo -e "${BLUE}└──────────────────────────────────────────────────────────┘${NC}"
    echo ""
    echo "  Tests cover:"
    echo "  ● Section 1  — Time multiplier (7 cases, boundary conditions)"
    echo "  ● Section 2  — Tier calculation (7 cases, edge cases)"
    echo "  ● Section 3  — Tier bonuses (4 cases)"
    echo "  ● Section 4  — Max parlay legs by tier (4 cases)"
    echo "  ● Section 5  — Reputation initialization (1 case)"
    echo "  ● Section 6  — Reputation updates win/loss/bet (4 cases)"
    echo "  ● Section 7  — FIX 1: prove_reputation ternary (2 cases)"
    echo "  ● Section 8  — FIX 4/5: payout math (4 cases)"
    echo "  ● Section 9  — Parlay payout math (4 cases)"
    echo "  ● Section 10 — FIX 6: end_time enforcement logic (3 cases)"
    echo "  ● Section 11 — FIX 7: pool key uniqueness (2 cases)"
    echo "  ● Section 12 — Double-claim flag logic (1 case)"
    echo "  ● Section 13 — FIX 3: claim_parlay dummy fallback (4 cases)"
    echo "  ● Section 14 — Outcome bounds check (3 cases)"
    echo "  ● Section 15 — Market resolution logic (2 cases)"
    echo "  ● Section 16 — Proof validity window (1 case)"
    echo ""

    cd "$PROGRAM_DIR"

    if leo test --build-tests 2>&1; then
        echo ""
        echo -e "${GREEN}✅ All Leo unit tests passed${NC}"
        UNIT_EXIT=0
    else
        echo ""
        echo -e "${RED}❌ Some Leo unit tests failed${NC}"
        UNIT_EXIT=1
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PART 2 — INTEGRATION TESTS (on-chain)
# ─────────────────────────────────────────────────────────────────────────────

if [ "$RUN_INTEGRATION" = true ]; then
    echo ""
    echo -e "${BLUE}┌──────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│  PART 2: Integration Tests (testnet transactions)        │${NC}"
    echo -e "${BLUE}│  File: tests/test_v6_integration.sh                      │${NC}"
    echo -e "${BLUE}│  Program: zkpredict_v6.aleo                              │${NC}"
    echo -e "${BLUE}└──────────────────────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "  ${YELLOW}⚠  This will submit real transactions to testnet.${NC}"
    echo -e "  ${YELLOW}   Estimated cost: ~2-4 credits for automated tests.${NC}"
    echo ""

    if [ "${CI:-false}" != "true" ]; then
        read -p "  Proceed with on-chain tests? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}  Skipping integration tests.${NC}"
            RUN_INTEGRATION=false
            INTEGRATION_EXIT=0
        fi
    fi

    if [ "$RUN_INTEGRATION" = true ]; then
        cd "$PROGRAM_DIR"
        chmod +x "$SCRIPT_DIR/test_v6_integration.sh"

        if "$SCRIPT_DIR/test_v6_integration.sh"; then
            INTEGRATION_EXIT=0
        else
            INTEGRATION_EXIT=1
        fi
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# FINAL SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  FINAL RESULTS                                           ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════╣${NC}"

if [ "$RUN_UNIT" = true ]; then
    if [ "$UNIT_EXIT" -eq 0 ]; then
        echo -e "${BOLD}║  ${GREEN}✅ Unit Tests:        PASSED${NC}${BOLD}                           ║${NC}"
    else
        echo -e "${BOLD}║  ${RED}❌ Unit Tests:        FAILED${NC}${BOLD}                           ║${NC}"
    fi
fi

if [ "$RUN_INTEGRATION" = true ]; then
    if [ "$INTEGRATION_EXIT" -eq 0 ]; then
        echo -e "${BOLD}║  ${GREEN}✅ Integration Tests: PASSED (automated)${NC}${BOLD}               ║${NC}"
    else
        echo -e "${BOLD}║  ${RED}❌ Integration Tests: FAILED${NC}${BOLD}                           ║${NC}"
    fi
fi

echo -e "${BOLD}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${BOLD}║  Manual tests (require private records from wallet):     ║${NC}"
echo -e "${BOLD}║  ⏭  claim_winnings    — verify Fix 4 (credits transfer) ║${NC}"
echo -e "${BOLD}║  ⏭  claim_two_winnings — verify Fix 5 (combined payout) ║${NC}"
echo -e "${BOLD}║  ⏭  create_parlay_2   — verify Fix 2 (get_or_use)       ║${NC}"
echo -e "${BOLD}║  ⏭  claim_parlay      — verify Fix 3 (dummy fallback)   ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL_EXIT=$(( UNIT_EXIT + INTEGRATION_EXIT ))
exit $TOTAL_EXIT
