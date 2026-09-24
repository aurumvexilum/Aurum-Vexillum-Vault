# Explicit approval and trusted-contract controls

Every user or dApp transaction must pass three gates:

1. **Build**: validate account names, amounts, memo length, token precision, and action shape.
2. **Trust**: verify the contract/symbol/action against `TRUSTED_CONTRACTS`; remote token metadata cannot authorize signing.
3. **Approve**: show origin, contract, action, authorization, recipient, quantity, memo, fee, and expiry; require an explicit user confirmation before invoking the signing service.

Rejected requests never reach the signing provider. dApp sessions also require HTTPS origins, matching account/permission, and a connected session. The current UI demonstrates the approval boundary; wire the approved request to the unlocked vault/signing broker only after adding authenticated unlock and final chain-context refresh.
