/**
 * Hardened approval service with strict validation pipeline.
 * Enforces: build → trust → origin → mutation → approve.
 */

import { Token } from '../lib/wax';
import { validateOrigin, OriginValidationResult } from '../infrastructure/origin-validator';
import {
  assertTrustedContractAction,
  validateSignableAction,
  detectUnlimitedApprovalRisk,
} from '../infrastructure/trusted-contracts-v2';
import {
  createTransactionSnapshot,
  verifyTransactionIntegrity,
  TransactionSnapshot,
} from '../infrastructure/transaction-mutation-detector';

export interface ApprovalRequestV2 {
  id: string; // Unique request ID for tracking
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

export interface ApprovedRequest extends ApprovalRequestV2 {
  approvedAt: string;
  approvedBy: string; // User confirmation text/signature
  snapshotHash: string;
  originValidation: OriginValidationResult;
}

/**
 * Validate an approval request through strict gates.
 * Returns detailed validation results with specific errors and warnings.
 */
export function validateApprovalRequest(
  request: ApprovalRequestV2,
  previousOrigin?: string
): ApprovalValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // GATE 1: Validate origin
  let originValidation: OriginValidationResult | undefined;
  if (request.origin) {
    originValidation = validateOrigin(request.origin, previousOrigin);
    if (!originValidation.isValid) {
      errors.push(`ORIGIN BLOCKED: ${originValidation.blockReason}`);
      return { isValid: false, errors, warnings };
    }
    // Add warnings to the approval
    if (originValidation.warnings.length > 0) {
      warnings.push(
        `ORIGIN WARNING: This origin has flags: ${originValidation.warnings.join(', ')}`
      );
    }
  }

  // GATE 2: Validate account and permission
  if (!request.account || request.account.length === 0) {
    errors.push('Account is required');
  }
  if (!request.permission || request.permission.length === 0) {
    errors.push('Permission is required');
  }

  // GATE 3: Validate network
  if (!request.network || !['mainnet', 'testnet'].includes(request.network)) {
    errors.push('Invalid network specified');
  }

  // GATE 4: Validate actions
  if (!request.actions || request.actions.length === 0) {
    errors.push('At least one action is required');
    return { isValid: false, errors, warnings };
  }

  for (let i = 0; i < request.actions.length; i++) {
    const action = request.actions[i];

    // Validate action structure
    const structureValidation = validateSignableAction(action);
    if (!structureValidation.isValid) {
      errors.push(`Action ${i}: ${structureValidation.errors.join('; ')}`);
      continue;
    }

    // GATE 5: Validate against trusted registry
    const symbol = (action.data.quantity as string | undefined)?.split(' ')[1] || 'UNKNOWN';
    const trustResult = assertTrustedContractAction(action.account, symbol, action.name);
    if (!trustResult.isValid) {
      errors.push(`Action ${i}: ${trustResult.reason}`);
      continue;
    }

    // GATE 6: Detect unlimited approvals
    const unlimitedWarnings = detectUnlimitedApprovalRisk(action);
    warnings.push(...unlimitedWarnings);
  }

  // If any errors, reject immediately
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Create snapshot for mutation detection
  const snapshot = createTransactionSnapshot(
    request.actions,
    request.origin || 'user-initiated',
    request.account,
    request.network
  );

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
  request: ApprovalRequestV2,
  confirmationText: string,
  snapshotHash: string,
  validationResult: ApprovalValidationResult
): ApprovedRequest {
  // Require explicit confirmation
  if (!confirmationText || confirmationText.trim().length < 3) {
    throw new Error('Explicit confirmation is required (minimum 3 characters)');
  }

  // Verify transaction integrity
  const integrityCheck = verifyTransactionIntegrity(
    request.actions,
    snapshotHash,
    request.origin || 'user-initiated',
    request.account,
    request.network
  );

  if (!integrityCheck.isValid) {
    throw new Error(integrityCheck.error || 'Transaction integrity check failed');
  }

  if (!validationResult.originValidation) {
    throw new Error('Origin validation is required');
  }

  return {
    ...request,
    approvedAt: new Date().toISOString(),
    approvedBy: confirmationText,
    snapshotHash,
    originValidation: validationResult.originValidation,
  };
}
