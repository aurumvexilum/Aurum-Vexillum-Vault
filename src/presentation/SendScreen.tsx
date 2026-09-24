import React from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from "@mui/material";
import { buildTransferAction } from "../application/transaction-broker";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function SendScreen() {
  const { account, tokens } = useDashboardStore();
  const [recipient, setRecipient] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [memo, setMemo] = React.useState("");
  const [preview, setPreview] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

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
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5">Send</Typography>
            <Typography variant="body2" color="text.secondary">Prepare a validated transfer before signing.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="From" value={account} disabled />
          <TextField label="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          <TextField label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <TextField label="Memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
          <Button variant="contained" onClick={handlePreview} disabled={!account || !recipient || !amount}>Review transaction</Button>
        </Stack>

        {preview && <Dialog open onClose={() => setPreview(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm transfer</DialogTitle>
          <DialogContent>
            <Stack spacing={1.5}>
              <Typography><strong>To:</strong> {preview.data.to}</Typography>
              <Typography><strong>Amount:</strong> {preview.data.quantity}</Typography>
              <Typography><strong>Memo:</strong> {preview.data.memo || "none"}</Typography>
              <Chip label={`Token: ${token.symbol}`} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreview(null)}>Cancel</Button>
            <Button variant="contained" onClick={() => setPreview(null)}>Sign now</Button>
          </DialogActions>
        </Dialog>}
      </CardContent>
    </Card>
  );
}
