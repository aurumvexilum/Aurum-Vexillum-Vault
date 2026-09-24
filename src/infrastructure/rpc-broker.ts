import { JsonRpc } from "eosjs";

export type RpcFactory = (endpoint: string) => JsonRpc;

export class RpcBroker {
  private active = 0;

  constructor(
    private readonly endpoints: string[],
    private readonly factory: RpcFactory = (endpoint) => new JsonRpc(endpoint),
  ) {
    if (!endpoints.length) throw new Error("At least one RPC endpoint is required.");
  }

  async call<T>(operation: (rpc: JsonRpc) => Promise<T>): Promise<T> {
    let last: unknown;
    for (let offset = 0; offset < this.endpoints.length; offset++) {
      const index = (this.active + offset) % this.endpoints.length;
      try {
        const result = await operation(this.factory(this.endpoints[index]));
        this.active = index;
        return result;
      } catch (error) {
        last = error;
      }
    }
    throw last;
  }
}
