# WAX token support policy

The wallet now discovers the complete token list published by the WAX Foundation token-list source and uses it for balance discovery, portfolio display, and Alcor market discovery.

## Security boundary

Remote token-list entries are untrusted metadata. They may be displayed and queried for balances, but they do not automatically become trusted signing targets. Transfers and swap actions remain blocked unless the token contract, symbol, precision, and action are present in the reviewed trusted-contract registry.

Each token is identified by:

```text
contract + symbol + precision
```

This prevents a malicious token with a familiar symbol from being treated as the legitimate asset. Token logos, names, and prices are display data only.

## Supported behavior

- Fetch all valid WAX token-list entries.
- Preserve the reviewed built-in token defaults when the remote list is unavailable.
- Display balances for discovered token contracts.
- Make discovered tokens available for market-pair lookup.
- Mark only explicitly reviewed defaults as verified.
- Fail closed for signing of unreviewed token contracts.

Before enabling transfers or live swaps for a newly discovered token, review its contract, precision, ABI, market route, and risk profile, then add it explicitly to the trusted registry.
