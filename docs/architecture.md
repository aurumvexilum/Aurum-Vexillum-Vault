# WAX Vault application architecture

## Screens and routes

The web client now uses `react-router-dom` with Dashboard, Send, Assets, and Recovery screens. Presentation components do not own RPC, signing, or storage implementation.

## Shared core

`packages/core` contains storage contracts, recovery/public-key verification, and pure transaction validation. Both web and native clients should consume these modules through a workspace package in the next extraction step.

## Services

- `RpcBroker` rotates through WAX endpoints and remembers the last healthy endpoint.
- `TransactionBroker` validates and builds canonical token transfer actions before signing.
- `VaultService` depends on a platform-neutral encrypted storage contract.
- `KeychainVaultAdapter` is the native secure-storage boundary; the browser uses the existing IndexedDB/Web Crypto adapter.

## Recovery verification

A mnemonic derives a key; it does not create or automatically control a WAX account. Before signing, fetch `get_account` and verify the derived public key appears in the requested permission's `required_auth.keys`. Stop if it does not.

## Mobile

`apps/mobile` is a React Native scaffold. Generate the native project with the React Native CLI, then wire `apps/mobile/src/core.ts` into screens. Keep secrets out of Zustand, logs, navigation params, analytics, and crash reports. Use Keychain/Keystore with biometric unlock and auto-lock for release builds.

## Tests

```bash
npm install
npm test
npm run build
```

This remains an engineering foundation, not a security audit. Replace the starter mnemonic derivation, add real account verification to the UI, add permission-aware transaction simulation, and complete native secure storage before handling valuable funds.
