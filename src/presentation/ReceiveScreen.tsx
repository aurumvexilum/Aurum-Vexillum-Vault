import React from "react";
import { Alert, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function ReceiveScreen() {
  const { account } = useDashboardStore(); const [selected, setSelected] = React.useState(false); const [copied, setCopied] = React.useState(false); const copy = async () => { if (!account) return; await navigator.clipboard?.writeText(account); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <Card><CardContent><Stack spacing={2} alignItems="center"><Typography variant="h4">Receive</Typography><Typography color="text.secondary">Share this WAX account only after verifying the sender and memo requirements.</Typography>{account ? <><Button variant="contained" onClick={() => setSelected(true)}>Show wallet information</Button>{selected && <Stack spacing={2} alignItems="center"><Typography variant="h5">{account}</Typography><QRCodeSVG value={`wax:${account}`} size={220} includeMargin /><Typography variant="body2" color="text.secondary">Scan to identify the WAX account. A QR code does not include your private key.</Typography><Button variant="outlined" onClick={copy}>{copied ? "Copied" : "Copy account name"}</Button></Stack>}</> : <Alert severity="info">Connect or verify a WAX account first.</Alert>}</Stack></CardContent></Card>;
}
