import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";

export async function verifyAccountPublicKey(
  accountName: string,
  publicKey: string,
  endpoint = "https://wax.greymass.com",
  permission = "active",
) {
  const rpc = new JsonRpc(endpoint);
  const account = await rpc.get_account(accountName);
  const hasKey = account.permissions?.some(
    (perm: any) => perm.perm_name === permission && perm.required_auth?.keys?.some((item: any) => item.key === publicKey),
  );
  if (!hasKey) {
    throw new Error(`The ${permission} permission does not include this public key.`);
  }
  return { account: accountName, permission, publicKey };
}

export async function previewTransfer(
  from: string,
  to: string,
  amount: string,
  token: { symbol: string; precision: number; contract: string },
  memo: string,
  privateKey: string,
  endpoint = "https://wax.greymass.com",
) {
  const rpc = new JsonRpc(endpoint);
  const api = new Api({ rpc, signatureProvider: new JsSignatureProvider([privateKey]) });
  const transaction = {
    actions: [{
      account: token.contract,
      name: "transfer",
      authorization: [{ actor: from, permission: "active" }],
      data: {
        from,
        to,
        quantity: `${Number(amount).toFixed(token.precision)} ${token.symbol}`,
        memo,
      },
    }],
  };
  return { preview: transaction, transaction };
}
