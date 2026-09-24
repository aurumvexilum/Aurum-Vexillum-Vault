# Production QA and release polish

This release pass focuses on code clarity, UX maturity, and a realistic wallet interaction model.

## UX and quality goals

- Use a single persistent MUI theme with explicit light and dark mode storage via localStorage.
- Keep a single route shell with Dashboard, Send, Assets, Recovery, and dApp tabs.
- Preference-driven wallet configuration should be isolated from transaction logic.
- Screens should clearly separate user intent, preview state, and final signing steps.

## dApp connectivity model

The wallet can maintain sessions for trusted origins with explicit approval and disconnect controls.

- `DappConnector.connect(origin, account, permissions)` stores a connection record.
- `DappConnector.revoke(origin)` removes the stored session.
- All dApp actions must request explicit user approval before a transaction is signed.
- Validate the origin, account, and permission domain before accepting a dApp request.
- Do not log or persist signatures, private keys, or session secrets in shared state.

## Security and release checklist

- Pin dependencies and verify lockfiles for every release.
- Keep secrets and private keys outside React state, global maps, and URL parameters.
- Audit all dApp requests before enabling signing or token approvals.
- Add unit tests for validation, connector session lifecycle, and failover path logic.
- Verify the browser vault export/import format and test recovery from an encrypted backup.
- Use platform-native Keychain/Keystore and biometric-only access on mobile.
- Replace the starter mnemonic derivation before handling production funds.

## Running locally

```bash
npm install
npm run dev
npm test
npm run build
```
