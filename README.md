# Aurum Vexillum Vault

<p align="center">
  <img src="public/logo.png" width="180" alt="Aurum Vexillum Vault emblem" />
</p>

<p align="center"><strong>Secure your WAX. Own your digital world.</strong></p>

<p align="center">A non-custodial WAX wallet foundation for tokens, NFTs, dApps, trading, and explicit transaction approvals.</p>

## What it does

Aurum Vexillum Vault is designed to give users clear control over WAX assets without taking custody of private keys or funds.

- WAX accounts, permissions, balances, and history
- Token and NFT portfolio views
- Explicit transaction approval and trusted-contract controls
- dApp sessions with origin and permission checks
- Trading previews with fee, slippage, quote expiry, and minimum-output controls
- AtomicMarket lowest-active-listing display for NFTs
- Encrypted browser-vault boundary and native secure-storage boundary
- RPC failover, dark/light themes, and multi-language UI

## Security model

Every signing request must pass four gates: validate the action, verify the contract and network, display a complete preview, and require explicit user approval before signing.

This repository is not independently audited. Do not use it for valuable funds until key derivation, secure storage, recovery, trusted-contract registries, dApp flows, and release gates have been reviewed by qualified security professionals.

## Run locally

```bash
npm install
npm run dev
npm test
npm run build
```

## Brand assets

- Approved logo: [`public/logo.png`](public/logo.png)
- Logo specification: [`docs/logo-spec.md`](docs/logo-spec.md)
- Tagline: **Secure your WAX. Own your digital world.**

## License

A project license has not yet been selected. Review licensing and third-party asset obligations before redistribution.
