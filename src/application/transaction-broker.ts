import { Api } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import { Token } from "../lib/wax";
import { RpcBroker } from "../infrastructure/rpc-broker";
import { assertTransfer } from "../../packages/core/src/validation";
import { assertTrustedAction } from "../infrastructure/trusted-contracts";

export function buildTransferAction(from: string, to: string, token: Token, amount: string, memo: string) {
  assertTransfer({ from, to, token, amount, memo });
  const action = { account: token.contract, name: "transfer", authorization: [{ actor: from, permission: "active" }], data: { from, to, quantity: `${Number(amount).toFixed(token.precision)} ${token.symbol}`, memo } };
  assertTrustedAction(action, token.symbol);
  return action;
}

export class TransactionBroker {
  constructor(private readonly rpc: RpcBroker) {}
  async sendApproved(actions: ReturnType<typeof buildTransferAction>[], privateKey: string, approval: { approvedAt: string }) {
    if (!approval?.approvedAt) throw new Error("Transaction has not been explicitly approved.");
    actions.forEach((action) => assertTrustedAction(action));
    return this.rpc.call(async (rpc) => new Api({ rpc, signatureProvider: new JsSignatureProvider([privateKey]) }).transact({ actions }, { blocksBehind: 3, expireSeconds: 30 }));
  }
}
