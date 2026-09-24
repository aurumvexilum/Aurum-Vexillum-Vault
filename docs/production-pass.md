# WAX Vault production pass

The wallet now has platform-neutral vault contracts, an encrypted browser adapter, a native Keychain/Keystore boundary, live permission verification, transaction previews based on fresh chain data, and an RPC broker with failover telemetry.

Browser vault secrets are encrypted with AES-GCM. The passphrase is never stored. Native builds should use `react-native-keychain` with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, biometric access controls, auto-lock, and no secret logging.

Account recovery must verify that the imported public key appears in the requested WAX permission. A mnemonic alone does not restore a WAX account. Transaction preview fetches chain info and the irreversible block before confirmation; broadcast must still be performed only after a final user approval.

Run:

```bash
npm install
npm test
npm run build
```

This remains unaudited software. Replace the starter mnemonic derivation with a documented audited WAX-compatible derivation, add native platform projects and biometric prompts, and complete security review before handling valuable funds.
