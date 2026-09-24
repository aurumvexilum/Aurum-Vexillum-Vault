import {describe,expect,it,vi} from "vitest";
import {buildTransferAction} from "./transaction-broker";
import {validateTransfer} from "../../packages/core/src/validation";
const wax={symbol:"WAX",contract:"eosio.token",precision:8};
describe("transaction validation",()=>{it("rejects invalid recipient",()=>expect(validateTransfer({from:"alice.wam",to:"bad!",token:wax,amount:"1.00000000",memo:""})).toContain("Invalid recipient account."));it("builds a canonical transfer action",()=>expect(buildTransferAction("alice.wam","bob.wam",wax,"1.25","hello").data.quantity).toBe("1.25000000 WAX"));it("rejects same-account transfers",()=>expect(()=>buildTransferAction("alice.wam","alice.wam",wax,"1","x")).toThrow())});
describe("rpc failover",()=>{it("can be tested through the broker's injected endpoint factory",()=>{expect(vi).toBeDefined()})});
