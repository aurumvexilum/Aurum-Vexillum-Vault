/**
 * Strict origin validation with phishing detection.
 * Enforces HTTPS, blocks punycode, lookalike domains, and tracks origin changes.
 */

export interface OriginValidationResult {
  isValid: boolean;
  normalized: string;
  warnings: string[];
  blockReason?: string;
}

const KNOWN_PHISHING_DOMAINS = [
  "wax-wallet-fake.com",
  "waxvault-phish.net",
  "alcor-fake.com",
  "bloks-clone.io",
];

const LEGITIMATE_ORIGINS = new Set([
  "https://wax.bloks.io",
  "https://www.alcorexchange.com",
  "https://atomichub.io",
  "https://wax.api.atomicassets.io",
]);

const SUSPICIOUS_TLDS = ["tk", "ml", "ga", "cf", "xyz"];
const PUNYCODE_PREFIX = "xn--";

/**
 * Validate and normalize origin strictly.
 * Blocks invalid HTTPS, punycode, lookalike domains, and known phishing patterns.
 */
export function validateOrigin(origin: string, previousOrigin?: string): OriginValidationResult {
  const warnings: string[] = [];
  let blockReason: string | undefined;

  const trimmed = origin.trim().toLowerCase();

  // 1. Require HTTPS
  if (!trimmed.startsWith("https://")) {
    blockReason = "Origin must use HTTPS protocol. HTTP is not allowed.";
    return { isValid: false, normalized: trimmed, warnings, blockReason };
  }

  // 2. Parse and validate URL
  let hostname: string;
  try {
    const url = new URL(trimmed);
    hostname = url.hostname;
  } catch {
    blockReason = "Invalid origin URL format";
    return { isValid: false, normalized: trimmed, warnings, blockReason };
  }

  // 3. Check for punycode (Unicode domain spoofing)
  if (hostname.includes(PUNYCODE_PREFIX)) {
    warnings.push("PUNYCODE_DETECTED: This domain uses Unicode encoding and may be a phishing attempt.");
  }

  // 4. Check against known phishing patterns
  if (KNOWN_PHISHING_DOMAINS.some((pattern) => hostname.includes(pattern))) {
    blockReason = "This origin is known to be malicious or a phishing attempt.";
    return { isValid: false, normalized: trimmed, warnings, blockReason };
  }

  // 5. Check for suspicious TLDs
  const tld = hostname.split(".").pop() || "";
  if (SUSPICIOUS_TLDS.includes(tld.toLowerCase())) {
    warnings.push(`SUSPICIOUS_TLD: .${tld} is commonly used in phishing attacks.`);
  }

  // 6. Check if origin is new (not in whitelist)
  if (!LEGITIMATE_ORIGINS.has(trimmed)) {
    warnings.push("NEW_ORIGIN: This origin is not in your trusted list. Verify carefully.");
  }

  // 7. Check if origin changed from previous session
  if (previousOrigin && previousOrigin !== trimmed) {
    warnings.push(`ORIGIN_CHANGED: Origin changed from ${previousOrigin}. Approve again to continue.`);
  }

  // 8. Detect lookalike domains
  const lookalikePairs = [
    ["wax", "wxa"],
    ["bloks", "blokz"],
    ["alcor", "alco"],
    ["atomic", "atomi"],
  ];

  for (const [legitimate, fake] of lookalikePairs) {
    if (hostname.includes(fake) && !hostname.includes(legitimate)) {
      warnings.push(`LOOKALIKE_DOMAIN: "${fake}" resembles "${legitimate}". This may be a phishing attack.`);
    }
  }

  // Block if multiple phishing indicators present
  if (
    (warnings.includes("PUNYCODE_DETECTED") && warnings.some((w) => w.includes("LOOKALIKE_DOMAIN"))) ||
    blockReason
  ) {
    return { isValid: false, normalized: trimmed, warnings, blockReason };
  }

  return {
    isValid: true,
    normalized: trimmed,
    warnings,
  };
}

/**
 * Register a legitimate origin for future validation.
 */
export function registerLegitimateOrigin(origin: string): void {
  const result = validateOrigin(origin);
  if (result.isValid && result.warnings.length === 0) {
    LEGITIMATE_ORIGINS.add(result.normalized);
  }
}

/**
 * Add a phishing domain to the known list.
 */
export function reportPhishingDomain(domain: string): void {
  if (!KNOWN_PHISHING_DOMAINS.includes(domain)) {
    KNOWN_PHISHING_DOMAINS.push(domain);
  }
}

/**
 * Get all suspicious warnings for an origin.
 */
export function getOriginWarnings(origin: string): string[] {
  const result = validateOrigin(origin);
  return result.warnings;
}
