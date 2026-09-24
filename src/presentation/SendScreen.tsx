import React, { useState } from "react";
import { Card, CardContent, Stack, TextField, Button, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { buildTransferAction } from "../application/transaction-broker";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function SendScreen() {
  const { account, tokens } = useDashboardStore();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = tokens.find((item) => item.symbol === "WAX") ?? { symbol: "WAX", contract: "eosio.token", precision: 8 };

  const handlePreview = () => {
    try {
      setError(null);
      const action = buildTransferAction(account, recipient, token, amount, memo);
      setPreview(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPreview(null);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Send</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="From" value={account} disabled />
          <TextField label="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          <TextField label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <TextField label="Memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
          <Button variant="contained" onClick={handlePreview} disabled={!account || !recipient || !amount}>Review transaction</Button>
        </Stack>
        {preview && (
          <Dialog open={Boolean(preview)} onClose={() => setPreview(null)}>
            <DialogTitle>Confirm transfer</DialogTitle>
            <DialogContent>
              <Typography>To: {preview.data.to}</Typography>
              <Typography>Amount: {preview.data.quantity}</Typography>
              <Typography>Memo: {preview.data.memo}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreview(null)}>Cancel</Button>
              <Button variant="contained" onClick={() => setPreview(null)}>Sign</Button>
            </DialogActions>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
