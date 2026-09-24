import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, Stack, Alert } from "@mui/material";
import { verifyAccountPublicKey } from "../infrastructure/account-verification";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function RecoveryScreen() {
  const { setAccount } = useDashboardStore();
  const [accountName, setAccountName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleVerify = async () => {
    try {
      const result = await verifyAccountPublicKey(accountName, publicKey, "https://wax.greymass.com", "active");
      setAccount(result.account);
      setStatus(`Verified: ${result.account} has the active permission for ${result.publicKey}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Recovery & account verification</Typography>
          <TextField label="WAX account" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <TextField label="Public key" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
          <Button variant="contained" onClick={handleVerify}>Verify public key</Button>
          {status && <Alert severity={status.startsWith("Verified") ? "success" : "error"}>{status}</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );
}
