import { Token } from "../lib/wax";
import { assertTransfer } from "../../packages/core/src/validation";
import { assertTrustedAction } from "../infrastructure/trusted-contracts";

export type ApprovalRequest = {
  origin?: string;
  account: string;
  permission: string;
  actions: Array<{ account: string; name: string; authorization: unknown[]; data: Record<string, unknown> }>;
  reason: string;
};

export function createTransferApproval(account: string, token: Token, to: string, amount: string, memo: string, origin?: string): ApprovalRequest {
  assertTransfer({ from: account, to, token, amount, memo });
  const action = { account: token.contract, name: "transfer", authorization: [{ actor: account, permission: "active" }], data: { from: account, to, quantity: `${Number(amount).toFixed(token.precision)} ${token.symbol}`, memo } };
  assertTrustedAction(action, token.symbol);
  return { origin, account, permission: "active", actions: [action], reason: "User-requested token transfer" };
}

export function approveRequest(request: ApprovalRequest, confirmationText: string) {
  if (!confirmationText.trim()) throw new Error("Explicit confirmation is required before signing.");
  request.actions.forEach((action) => assertTrustedAction(action, String(action.data.quantity).split(" ").pop()));
  return { ...request, approvedAt: new Date().toISOString() };
}
