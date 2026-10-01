/**
 * Enhanced approval service with strict security gates.
 * Implements: build → trust → origin → mutation → approve flow.
 */

import { validateOrigin, OriginValidationResult } from "../infrastructure/origin-validator";
import { getTrustedContract } from "../infrastructure/trusted-contracts";
import {
  createTransactionSnapshot,
  verifyTransactionIntegrity,
  TransactionSnapshot,
} from "../infrastructure/transaction-mutation-detector";

export interface ApprovalRequest {
  id: string;
  origin?: string;
  account: string;
  permission: string;
  actions: Array<{ account: string; name: string; authorization: unknown[]; data: Record<string, unknown> }>;
  reason: string;
  network: string;
}

export interface ApprovalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  originValidation?: OriginValidationResult;
  snapshot?: TransactionSnapshot;
}

export interface ApprovedRequest extends ApprovalRequest {
  approvedAt: string;
  approvedBy: string;
  snapshotHash: string;
  originValidation: OriginValidationResult;
}

/**
 * Validate an approval request through strict gates.
 * Returns detailed validation results with specific errors and warnings.
 */
export function validateApprovalRequest(
  request: ApprovalRequest,
  previousOrigin?: string,
): ApprovalValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // GATE 1: Validate basic structure
  if (!request.account || request.account.length === 0) {
    errors.push("Account is required.");
  }
  if (!request.permission || request.permission.length === 0) {
    errors.push("Permission is required.");
  }
  if (!request.network || !["mainnet", "testnet"].includes(request.network)) {
    errors.push("Invalid network. Must be 'mainnet' or 'testnet'.");
  }
  if (!request.actions || request.actions.length === 0) {
    errors.push("At least one action is required.");
    return { isValid: false, errors, warnings };
  }

  // GATE 2: Validate origin (strict HTTPS-only)
  let originValidation: OriginValidationResult | undefined;
  if (request.origin) {
    originValidation = validateOrigin(request.origin, previousOrigin);
    if (!originValidation.isValid) {
      errors.push(`ORIGIN BLOCKED: ${originValidation.blockReason}`);
      return { isValid: false, errors, warnings };
    }
    if (originValidation.warnings.length > 0) {
      warnings.push(...originValidation.warnings.map((w) => `ORIGIN: ${w}`));
    }
  } else {
    // User-initiated transaction
    originValidation = { isValid: true, normalized: "user-initiated", warnings: [] };
  }

  // GATE 3: Validate each action against trusted registry
  for (let i = 0; i < request.actions.length; i++) {
    const action = request.actions[i];

    // Validate action structure
    if (!action.account) {
      errors.push(`Action ${i}: Missing contract account.`);
      continue;
    }
    if (!action.name) {
      errors.push(`Action ${i}: Missing action name.`);
      continue;
    }
    if (!Array.isArray(action.authorization) || action.authorization.length === 0) {
      errors.push(`Action ${i}: Missing authorization.`);
      continue;
    }

    // Extract symbol from quantity field
    const symbol = (action.data?.quantity as string | undefined)?.split(" ").pop() || "UNKNOWN";

    // Validate against trusted contract registry (exact match only)
    try {
      const contract = getTrustedContract(action.account, symbol, action.name);
      if (contract.auditStatus === "pending-audit") {
        warnings.push(
          `ACTION ${i}: Contract "${action.account}" is pending security audit. Use with caution.`,
        );
      }
    } catch (error) {
      // getTrustedContract throws with detailed reason
      errors.push(`Action ${i}: ${String(error).replace("Error: ", "")}`);
      continue;
    }

    // Check for suspiciously large amounts
    if (action.data?.quantity) {
      const [amountStr] = String(action.data.quantity).split(" ");
      const amount = parseFloat(amountStr);
      if (amount > 1_000_000) {
        warnings.push(`ACTION ${i}: Extremely large quantity (${action.data.quantity}). Review carefully.`);
      }
    }
  }

  // If any errors, reject immediately
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Create snapshot for mutation detection (5-minute window)
  let snapshot: TransactionSnapshot | undefined;
  try {
    const snapshotData = createTransactionSnapshot(
      request.actions,
      request.origin || "user-initiated",
      request.account,
      request.network,
    );
    snapshot = snapshotData.snapshot;
  } catch (error) {
    errors.push(`Failed to create transaction snapshot: ${String(error)}`);
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: true,
    errors: [],
    warnings,
    originValidation,
    snapshot,
  };
}

/**
 * Finalize an approval after user confirmation.
 * Verifies the transaction has not mutated since validation.
 */
export function approveRequest(
  request: ApprovalRequest,
  confirmationText: string,
  snapshotHash: string,
  validationResult: ApprovalValidationResult,
): ApprovedRequest {
  // Require explicit confirmation (minimum 3 characters)
  if (!confirmationText || confirmationText.trim().length < 3) {
    throw new Error("Explicit confirmation is required (minimum 3 characters).");
  }

  // Verify transaction integrity
  const integrityCheck = verifyTransactionIntegrity(
    request.actions,
    snapshotHash,
    request.origin || "user-initiated",
    request.account,
    request.network,
  );

  if (!integrityCheck.isValid) {
    throw new Error(integrityCheck.error || "Transaction integrity check failed.");
  }

  if (!validationResult.originValidation) {
    throw new Error("Origin validation is required.");
  }

  return {
    ...request,
    approvedAt: new Date().toISOString(),
    approvedBy: confirmationText,
    snapshotHash,
    originValidation: validationResult.originValidation,
  };
}

/**
 * Check if re-approval is needed due to context changes.
 */
export function requiresReApproval(
  previousOrigin?: string,
  currentOrigin?: string,
  previousAccount?: string,
  currentAccount?: string,
  previousNetwork?: string,
  currentNetwork?: string,
): { required: boolean; reason?: string } {
  if (previousOrigin && currentOrigin && previousOrigin !== currentOrigin) {
    return { required: true, reason: `Origin changed from ${previousOrigin} to ${currentOrigin}.` };
  }

  if (previousAccount && currentAccount && previousAccount !== currentAccount) {
    return { required: true, reason: `Account changed from ${previousAccount} to ${currentAccount}.` };
  }

  if (previousNetwork && currentNetwork && previousNetwork !== currentNetwork) {
    return { required: true, reason: `Network changed from ${previousNetwork} to ${currentNetwork}.` };
  }

  return { required: false };
}
