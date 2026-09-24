# Final pass

The web shell now provides a persisted dark/light theme, responsive dashboard cards, token balances, activity stream, NFT count, and refresh states. The transaction broker creates validated actions, fetches fresh chain context for previews, and uses the RPC broker for failover-aware broadcast. Because WAX RPC does not expose a universal dry-run API, simulation is explicitly chain-context validation rather than a guarantee of execution.

Browser secrets are encrypted in IndexedDB with AES-GCM and PBKDF2 and support save/load/clear/export/import. Native storage uses Keychain/Keystore with device-only accessibility and biometric prompts. Never log secrets or place them in application state.

The React Native scaffold uses the same RPC broker and shared core contracts and follows the device color scheme. Generate native projects with the React Native CLI, install native keychain dependencies, and complete platform-specific biometric configuration before release.

Run `npm install`, `npm test`, and `npm run build`. This remains unaudited software; use test accounts until the key derivation, native storage, and transaction flows receive independent security review.
