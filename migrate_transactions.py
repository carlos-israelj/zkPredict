#!/usr/bin/env python3
"""
Script to migrate Transaction.createTransaction to executeTransaction
"""
import re
import sys

def migrate_transaction(content):
    """
    Replace Transaction.createTransaction pattern with executeTransaction
    """
    # Pattern matches:
    # const transaction = Transaction.createTransaction(
    #   address,
    #   'network',
    #   'program',
    #   'function',
    #   inputs,
    #   fee,
    #   privateFee
    # );
    # const txId = await executeTransaction(transaction);

    pattern = r'''const\s+(\w+)\s*=\s*Transaction\.createTransaction\(\s*
        address,\s*
        '[^']+',\s*
        ([^\n]+?),\s*
        ([^\n]+?),\s*
        ([^\n]+?),\s*
        ([^\n]+?),?\s*
        (?:false|true)?\s*
      \);?\s*
      (?://[^\n]*)?\s*
      (?://[^\n]*)?\s*
      const\s+(\w+)\s*=\s*await\s+executeTransaction\(\1\);?'''

    def replace_fn(match):
        var_name = match.group(1)
        program = match.group(2).strip()
        function = match.group(3).strip()
        inputs = match.group(4).strip()
        fee = match.group(5).strip()
        result_var = match.group(6)

        return f'''const result = await executeTransaction({{
        program: {program},
        function: {function},
        inputs: {inputs},
        fee: {fee},
      }});

      const {result_var} = result?.transactionId;
      if (!{result_var}) {{
        throw new Error('Transaction failed: No transaction ID returned');
      }}'''

    # Use VERBOSE and DOTALL flags
    content = re.sub(pattern, replace_fn, content, flags=re.VERBOSE | re.DOTALL)

    return content

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python migrate_transactions.py <file>")
        sys.exit(1)

    filepath = sys.argv[1]
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = migrate_transaction(content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Migrated {filepath}")
