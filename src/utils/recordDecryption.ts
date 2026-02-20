// Record Decryption Utility using snarkVM WASM
// This utility allows decrypting Aleo record ciphertexts using a view key

import { Account, ViewKey, RecordCiphertext, RecordPlaintext } from '@provablehq/sdk';

/**
 * Decrypts an encrypted Aleo record using a view key
 *
 * @param ciphertext - The encrypted record string (starts with "record1...")
 * @param viewKeyString - The user's view key (AViewKey1...)
 * @returns The decrypted record as a JSON object
 */
export async function decryptRecord(
  ciphertext: string,
  viewKeyString: string
): Promise<any> {
  try {
    // Validate inputs
    if (!ciphertext || !ciphertext.startsWith('record1')) {
      throw new Error('Invalid ciphertext format. Must start with "record1"');
    }

    if (!viewKeyString || !viewKeyString.startsWith('AViewKey1')) {
      throw new Error('Invalid view key format. Must start with "AViewKey1"');
    }

    // Create ViewKey instance from string
    const viewKey = ViewKey.from_string(viewKeyString);

    // Create RecordCiphertext instance from string
    const recordCiphertext = RecordCiphertext.from_string(ciphertext);

    // Decrypt the record
    const recordPlaintext = recordCiphertext.decrypt(viewKey);

    // Convert to JSON string then parse to object
    const recordJson = recordPlaintext.to_string();

    // Parse the Leo record format to JSON
    // Example: "{ owner: aleo1..., microcredits: 1000000u64, ... }"
    const parsedRecord = parseLeoRecordToJson(recordJson);

    return parsedRecord;
  } catch (error) {
    console.error('Error decrypting record:', error);
    throw new Error(`Failed to decrypt record: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse Leo record format to JSON
 * Converts: "{ owner: aleo1..., microcredits: 1000000u64 }"
 * To: { "owner": "aleo1...", "microcredits": "1000000u64" }
 */
function parseLeoRecordToJson(leoRecord: string): any {
  try {
    // Remove outer braces and split by commas
    const content = leoRecord.trim().replace(/^\{|\}$/g, '').trim();
    const pairs = content.split(',');

    const result: any = {};

    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split(':');
      const value = valueParts.join(':').trim();

      if (key && value) {
        const cleanKey = key.trim();
        const cleanValue = value.trim();

        // Handle different value types
        if (cleanValue.endsWith('.private') || cleanValue.endsWith('.public')) {
          // Address or typed value
          result[cleanKey] = cleanValue;
        } else if (cleanValue.includes('group')) {
          // Group value
          result[cleanKey] = cleanValue;
        } else {
          // Default: keep as string
          result[cleanKey] = cleanValue;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error parsing Leo record:', error);
    // Fallback: return as string
    return leoRecord;
  }
}

/**
 * Validate if a string is a valid Aleo view key
 */
export function isValidViewKey(viewKey: string): boolean {
  return viewKey.startsWith('AViewKey1') && viewKey.length > 50;
}

/**
 * Validate if a string is a valid encrypted record
 */
export function isValidRecordCiphertext(ciphertext: string): boolean {
  return ciphertext.startsWith('record1') && ciphertext.length > 100;
}
