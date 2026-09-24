# Aurum Vexillum Vault

Aurum Vexillum Vault is a non-custodial WAX wallet foundation for web, Android, and iOS.

## Features

- WAX account and permission verification
- Encrypted browser vault and native secure-storage boundaries
- WAX token balances, NFTs, trading controls, and transaction history
- Explicit transaction approval and trusted-contract controls
- dApp connection architecture
- RPC failover support
- Dark/light themes and multi-language UI

## Run the web app

```bash
npm install
npm run dev
npm run build
npm test
```

## Android/iOS packaging

After installing Android Studio and Xcode prerequisites:

```bash
npm run build
npx cap add android
npx cap add ios
npm run mobile:sync
npx cap open android
npx cap open ios
```

The native display name is **Aurum Vexillum Vault**. The Capacitor application ID remains `com.aurumvexilum.waxvault` to avoid invalidating existing native identifiers. Change it only as part of a deliberate new-app migration.

## Security status

This is an engineering foundation and is not an independently audited wallet. Replace the starter mnemonic derivation with an audited WAX-compatible implementation, complete native Keychain/Keystore integration, verify all contract allowlists, and complete an independent security review before handling valuable funds.

Remote token and NFT metadata is untrusted display data. Trading routes, fee recipients, dApp origins, and signing requests must be verified and explicitly approved by the user.
