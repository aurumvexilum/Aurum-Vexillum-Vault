import React from "react";
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { verifyAccountPublicKey } from "../infrastructure/account-verification";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function RecoveryScreen() {
  const { setAccount } = useDashboardStore();
  const [accountName, setAccountName] = React.useState("");
  const [publicKey, setPublicKey] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);

  const handleVerify = async () => {
    try {
      const result = await verifyAccountPublicKey(accountName, publicKey, "https://wax.greymass.com", "active");
      setAccount(result.account);
      setStatus(`Verified: ${result.account} contains the active permission key ${result.publicKey}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  return <Card>
    <CardContent>
      <Stack spacing={2}>
        <Typography variant="h5">Recovery & verification</Typography>
        <Typography variant="body2" color="text.secondary">Use the imported public key to prove the account can be controlled before signing transactions.</Typography>
        <TextField label="WAX account" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        <TextField label="Public key" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
        <Button variant="contained" onClick={handleVerify}>Verify active permission</Button>
        {status && <Alert severity={status.startsWith("Verified") ? "success" : "error"}>{status}</Alert>}
      </Stack>
    </CardContent>
  </Card>;
}
