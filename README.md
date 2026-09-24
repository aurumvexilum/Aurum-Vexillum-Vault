# Aurum Vexillum Vault

<p align="center">
  <img src="/aurum-vexillum-vault-logo.svg" width="180" alt="Aurum Vexillum Vault emblem" />
</p>

<p align="center"><strong>Secure your WAX. Own your digital world.</strong></p>

<p align="center">A non-custodial WAX wallet foundation for tokens, NFTs, dApps, trading, and explicit transaction approvals.</p>

<p align="center">
  <a href="https://github.com/aurumvexilum/wallet/actions"><img alt="Build" src="https://img.shields.io/badge/build-verify%20in%20CI- D4AF37" /></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img alt="WAX" src="https://img.shields.io/badge/network-WAX-0b1020" />
  <img alt="Security" src="https://img.shields.io/badge/security-not%20audited-red" />
</p>

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

Every signing request must pass four gates:

1. Validate the account, amount, precision, memo, and action shape.
2. Verify the contract, symbol, action, permission, and network.
3. Display a complete human-readable preview.
4. Require explicit user approval before unlocking and signing.

This repository is not independently audited. Do not use it for valuable funds until key derivation, secure storage, recovery, trusted-contract registries, dApp flows, and release gates have been reviewed by qualified security professionals.

## Run locally

```bash
npm install
npm run dev
npm test
npm run build
```

## Mobile packaging

```bash
npm run build
npx cap add android
npx cap add ios
npm run mobile:sync
npx cap open android
npx cap open ios
```

Native production builds must use platform-secure Keychain/Keystore storage and biometric protection. The app display name is **Aurum Vexillum Vault**.

## Architecture

```text
packages/core/       Shared validation and storage contracts
src/application/     Wallet use cases and transaction services
src/infrastructure/ RPC, vault, pricing, NFT, and dApp adapters
src/presentation/    Web screens and approval UI
apps/mobile/         Native mobile boundary
docs/                Security, release, brand, and architecture specs
```

## Brand assets

- [Logo specification](docs/logo-spec.md)
- [Primary SVG emblem](public/aurum-vexillum-vault-logo.svg)
- [Visual identity](docs/visual-identity.md)
- Tagline: **Secure your WAX. Own your digital world.**

## Contributing

Do not include private keys, recovery phrases, signing payloads, or sensitive user data in issues, logs, tests, or pull requests. Contract allowlist changes and signing-flow changes require focused review and tests.

## License

A project license has not yet been selected. Review licensing and third-party asset obligations before redistribution.
