import { parsePhoneNumberFromString } from "libphonenumber-js";

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

/**
 * Validates and normalizes phone numbers into E.164 format (+CCXXXXXXXXXX).
 * Defaults to Indian region (IN) but parses any valid international input.
 */
export function validateAndNormalizePhone(rawInput: string): PhoneValidationResult {
  if (!rawInput || typeof rawInput !== "string") {
    return { isValid: false, error: "Phone number is required." };
  }

  // Pre-clean spaces, parentheses, and dashes to help the parser
  let cleanInput = rawInput.replace(/[\s\-\(\)\.]/g, "");

  // If it starts with a country code but doesn't have '+', parsePhoneNumberFromString can fail.
  // Prepend '+' if it starts with '91' (India) or other common prefixes if they are entered raw.
  if (!cleanInput.startsWith("+")) {
    if (cleanInput.startsWith("91") && cleanInput.length === 12) {
      cleanInput = `+${cleanInput}`;
    } else if (cleanInput.startsWith("0")) {
      // Local Indian trunk prefix - strip leading zero and prepend India country code
      cleanInput = `+91${cleanInput.slice(1)}`;
    } else if (cleanInput.length === 10) {
      // Assume local Indian number without country prefix
      cleanInput = `+91${cleanInput}`;
    } else {
      // General fallback - try prepending '+'
      cleanInput = `+${cleanInput}`;
    }
  }

  try {
    // Parse using India (IN) as default fallback region
    const parsed = parsePhoneNumberFromString(cleanInput, "IN");
    
    if (!parsed || !parsed.isValid()) {
      return { 
        isValid: false, 
        error: "Invalid phone number format. Please ensure you include the correct country code." 
      };
    }

    return {
      isValid: true,
      normalized: parsed.number, // returns standard E.164 format: "+919876543210"
    };
  } catch {
    return { 
      isValid: false, 
      error: "An error occurred during phone number parsing." 
    };
  }
}

/**
 * Masks a phone number for safe server-side logging (+91******3210).
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  if (phone.length < 8) return "***";
  return `${phone.slice(0, 3)}******${phone.slice(-4)}`;
}
