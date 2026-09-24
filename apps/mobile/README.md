# Native React Native client

This directory defines the native client boundary. It intentionally does not duplicate key-management or transaction rules from the web app.

- Use `@react-native-keychain/keychain` for encrypted Keychain/Keystore storage.
- Use the same domain validation and application use cases as the web client via a shared package.
- Keep seed phrases and private keys out of Redux/Zustand state, logs, crash reports, and analytics.
- Add biometric unlock, auto-lock, clipboard clearing, screen-capture protection, and deep-link validation before release.

Bootstrap a generated React Native app in this directory with the React Native CLI, then move shared modules into `packages/core` and import them from both clients.
