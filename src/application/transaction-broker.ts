import { JsonRpc } from "eosjs";
import { Api } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";

import { Token } from "../lib/wax";
import { assertTransfer } from "../../packages/core/src/validation";

export function buildTransferAction(
  from: string,
  to: string,
  token: Token,
  amount: string,
  memo: string,
) {
  assertTransfer({ from, to, token, amount, memo });
  return {
    account: token.contract,
    name: "transfer",
    authorization: [{ actor: from, permission: "active" }],
    data: {
      from,
      to,
      quantity: `${Number(amount).toFixed(token.precision)} ${token.symbol}`,
      memo,
    },
  };
}

export class TransactionBroker {
  constructor(private readonly rpc: JsonRpc) {}

  async sendTransfer(
    from: string,
    to: string,
    token: Token,
    amount: string,
    memo: string,
    privateKey: string,
  ) {
    const api = new Api({
      rpc: this.rpc,
      signatureProvider: new JsSignatureProvider([privateKey]),
    });

    return api.transact(
      {
        actions: [buildTransferAction(from, to, token, amount, memo)],
      },
      { blocksBehind: 3, expireSeconds: 30 },
    );
  }
}
