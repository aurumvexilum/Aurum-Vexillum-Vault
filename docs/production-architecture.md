# Production roadmap

## Boundaries

`src/domain` contains pure validation and wallet rules. `src/application` contains use cases and state orchestration. `src/infrastructure` contains RPC, indexer, metadata, and storage adapters. `src/presentation` contains web components. `apps/mobile` is a native presentation shell.

## State rules

Only public dashboard state is persisted by `useDashboardStore`. Secret material remains in the vault adapter and is loaded only for the duration of a signing operation. Never put private keys, mnemonics, or passphrases in Zustand, URL parameters, localStorage, telemetry, or error messages.

## Recovery and account verification

A recovery phrase restores signing keys, not a WAX account. Account import must verify that the entered account exists and that one of its linked permissions contains the derived public key. If the key is not present, the UI must stop and explain that the account cannot be controlled by the imported key. Account creation and permission linking are separate explicit flows.

## Token dashboard

Remote token metadata is treated as untrusted display data. Only allowlisted contract/symbol/precision combinations are marked verified or enabled for transfers. Balances come from on-chain `accounts` tables; metadata never determines a transfer contract automatically.

## Release gates

Before mainnet use: replace the starter mnemonic derivation with an audited WAX-compatible derivation implementation; add permission/public-key verification; add unit/property tests for serialization and validation; use native Keychain/Keystore adapters; pin dependencies; configure CSP; run SAST, dependency scanning, fuzzing, and an independent security audit; test RPC/indexer outage behavior; and publish reproducible builds.
