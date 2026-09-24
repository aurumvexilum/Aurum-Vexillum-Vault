# WAX Vault

A starter non-custodial WAX wallet with encrypted browser storage, local key signing, token balances, transaction history, NFTs, confirmation UI, and RPC failover.

## Run

```bash
npm install
npm run dev
```

## Security status

This is a development foundation, not an audited wallet. Private keys are encrypted with AES-GCM using a PBKDF2-derived key and stored in IndexedDB. The passphrase is never stored. Use HTTPS in production, add CSP, disable analytics on sensitive screens, and commission an independent security audit before handling real funds.

The included mnemonic-to-key function is explicitly a starter implementation. Before mainnet use, replace it with an audited WAX/EOS derivation implementation with a documented derivation path and compatibility tests. Never advertise this build as military-grade encryption or rely on a browser-only wallet for high-value funds without an audit.

Token contract identifiers can change or be project-specific. Verify every contract and precision from authoritative WAX sources before enabling transfers of AUBAR, TLM, or GPU.
