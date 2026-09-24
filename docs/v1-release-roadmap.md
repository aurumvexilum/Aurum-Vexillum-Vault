# WAX Vault v1 release plan

## Trading and fees

- Trading fee is defined as **0.01% (1 basis point)** in `src/application/trading-service.ts`.
- The fee recipient is deliberately configuration-driven: set `VITE_WAX_FEE_RECIPIENT` to the verified 1–12 character WAX account controlled by Aurum Vexilum. Do not assume a brand name is a valid WAX account name.
- The current UI creates an indicative quote only. Before enabling execution, implement and audit a specific DEX adapter, verify token contracts, add slippage/deadline protection, and include the fee transfer in the same atomic transaction where supported.

## Prices and portfolio value

`src/infrastructure/price-service.ts` fetches WAX/USD from CoinGecko and exposes portfolio aggregation. Prices for AUBAR, TLM, GPU, and other tokens remain zero until a verified price source and contract-to-market mapping is configured. Never display zero as a claim of zero value; show “price unavailable” in production UI.

## Localization

The shell supports English, Spanish, French, German, Portuguese, and Simplified Chinese through `src/i18n.ts`. Persist the locale locally and move strings into versioned translation files before adding more screens.

## dApp transaction approval design

1. Validate the requesting origin and display its normalized origin.
2. Resolve the requested account and permission; reject mismatches.
3. Render every action, contract, method, quantity, memo, and fee in a confirmation screen.
4. Require an unlocked vault and explicit user confirmation.
5. Re-fetch chain context, validate resource/expiration limits, then sign.
6. Broadcast through the RPC broker; show endpoint and transaction ID.
7. Allow users to disconnect/revoke the origin and review connection history.

## App Store release checklist

- [ ] Apple and Google developer accounts, legal entity, privacy policy, support URL, and export-compliance answers.
- [ ] App icons, screenshots, accessibility labels, onboarding, and localized store metadata.
- [ ] HTTPS/CSP, no secrets in logs, dependency lockfile, SBOM, signed reproducible builds.
- [ ] Keychain/Keystore with device-only access, biometrics, auto-lock, backup and restore tests.
- [ ] Testnet/mainnet environment separation and a visible network indicator.
- [ ] Deep links, QR flows, offline/error states, RPC failover, and upgrade migration tests.
- [ ] TestFlight/internal-track testing, crash-free smoke tests, privacy manifest, and review notes.

## Wallet security review checklist

- [ ] Replace starter mnemonic derivation with an audited WAX-compatible path and test vectors.
- [ ] Threat model, secure coding review, dependency/SAST scan, fuzzing, and independent audit.
- [ ] Verify account permissions before every signing session; never trust token metadata for contracts.
- [ ] Encrypt vaults, clear secrets from memory where feasible, prevent screenshots on sensitive native screens.
- [ ] Origin allowlist and dApp approval anti-phishing protections.
- [ ] Transaction parsing, simulation/chain-context checks, slippage/deadline limits, and replay protection.
- [ ] Incident response, key compromise procedure, disclosure policy, and monitoring without sensitive data.

## v1.0 roadmap

- Phase 1: audited key lifecycle, account import verification, native vaults, core transfer flows.
- Phase 2: verified token/NFT dashboard, live price providers, localization, accessibility, and analytics-free privacy controls.
- Phase 3: audited DEX adapter, fee accounting, dApp session protocol, transaction approvals, and hardware-wallet support.
- Phase 4: testnet beta, external audit remediation, app-store submission, staged mainnet rollout, and post-launch monitoring.
