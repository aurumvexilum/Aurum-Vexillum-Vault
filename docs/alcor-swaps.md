# Alcor swap integration and fee policy

## Quote source

Swap prices are read from the official Alcor WAX market API:

```text
https://wax.alcor.exchange/api/markets
```

The adapter matches both token contract and symbol, supports either market orientation, and rejects missing or invalid prices. Quotes expire after 30 seconds and display the market ID, route, input amount, fee, slippage, minimum received, and fee recipient.

## Fee

The wallet fee is **0.01% (1 basis point)**. The current configured recipient is:

```text
aurumvexilum
```

The fee must be included in the final user-approved transaction as an explicit, atomic token transfer to `aurumvexilum`. The fee recipient, fee amount, token, and action must be visible in the approval screen. If the fee action cannot be included atomically with the audited Alcor swap route, execution must remain disabled.

## Execution safety

The current implementation provides Alcor market quotes and an approval preview. It deliberately does not whitelist or execute an Alcor swap action because the exact production ABI, route, and action payload must be verified against the deployed Alcor contract before signing.

Before enabling execution:

- Verify the deployed Alcor contract and ABI on WAX mainnet.
- Review the exact action name and payload for the selected market type.
- Add the swap contract/action/token combinations to `TRUSTED_CONTRACTS`.
- Construct the swap and fee actions atomically.
- Encode minimum output and quote expiry where supported.
- Re-fetch market state immediately before signing.
- Require explicit approval of the final immutable action list.
- Test price movement, failed swaps, fee failures, replay, and RPC failover.
