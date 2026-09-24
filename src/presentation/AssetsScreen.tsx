import React from "react";
import { Alert, Button, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function AssetsScreen() {
  const { balances, hiddenTokens, toggleTokenVisibility, showAllTokens } = useDashboardStore();
  return <Stack spacing={3}><Card><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><BoxTitle /><>{hiddenTokens.length > 0 && <Button size="small" onClick={showAllTokens}>Show all tokens</Button>}</></Stack><Stack spacing={1} sx={{ mt: 2 }}>{balances.length ? balances.map((token: any, index: number) => { const hidden = hiddenTokens.includes(`${token.contract ?? ""}:${token.symbol ?? ""}`); return <Stack key={`${token.symbol}-${index}`} direction="row" alignItems="center" justifyContent="space-between" sx={{ opacity: hidden ? .58 : 1, borderBottom: 1, borderColor: "divider", py: .75 }}><Stack direction="row" spacing={1} alignItems="center"><Chip label={`${token.symbol}: ${hidden ? "Hidden" : token.balance}`} /><Typography variant="caption" color="text.secondary">{token.contract}</Typography></Stack><Tooltip title={hidden ? "Show token" : "Hide token"}><IconButton aria-label={hidden ? `Show ${token.symbol}` : `Hide ${token.symbol}`} onClick={() => toggleTokenVisibility(token)}>{hidden ? <VisibilityOff /> : <Visibility />}</IconButton></Tooltip></Stack>; }) : <Typography color="text.secondary">No balances loaded yet.</Typography>}</Stack></CardContent></Card><Alert severity="info">Token visibility is a local display preference. It does not change your on-chain balances.</Alert></Stack>;
}
function BoxTitle() { return <Stack><Typography variant="h4">Tokens</Typography><Typography color="text.secondary">Balances and visibility preferences</Typography></Stack>; }
