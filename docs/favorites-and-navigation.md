# Favorites and asset navigation

The wallet now separates the main asset experiences:

- **Tokens** (`/assets`): token balances and local hide/show controls.
- **NFTs** (`/nfts`): a dedicated NFT collection display with marketplace listing lookups.
- **dApp directory** (`/dapps`): supported dApps and local favorite toggles.
- **Favorite dApps** (`/favorites`): locally persisted favorite dApps only.

The shell provides a responsive navigation menu. Desktop users see the full navigation row; smaller screens use the menu button. Favorite dApps are stored locally and do not grant transaction permissions or establish a connection by themselves. Opening a dApp in a new tab also does not constitute wallet approval.
