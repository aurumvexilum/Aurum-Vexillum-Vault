# Repository rename instructions

The current repository is `aurumvexilum/wallet`. The project branding is now **Aurum Vexillum Vault**.

To rename the GitHub repository:

1. Open `https://github.com/aurumvexilum/wallet/settings`.
2. In **General**, find **Repository name**.
3. Enter the desired repository name, for example `aurum-vexillum-vault`.
4. Confirm the rename.
5. Update local remotes:

```bash
git remote set-url origin https://github.com/aurumvexilum/aurum-vexillum-vault.git
git remote -v
```

GitHub normally redirects the old repository URL, but update CI/CD, package registries, deployment secrets, badges, documentation links, and native build automation to the new URL.

The repository rename is separate from the application display-name change. The app display name, web metadata, mobile package display name, and Capacitor `appName` have already been updated in this project.
