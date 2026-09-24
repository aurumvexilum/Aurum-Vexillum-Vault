import React from "react";
import { Alert, Button, Card, CardContent, Chip, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDashboardStore } from "../application/dashboard-store-v2";
import { fetchLowestNftPrice } from "../infrastructure/nft-market-service";

export function AssetsScreen() {
  const { balances, nfts, hiddenTokens, toggleTokenVisibility, showAllTokens } = useDashboardStore();
  const [prices, setPrices] = React.useState<Record<string, any>>({});
  const [error, setError] = React.useState("");
  async function price(id: string) { try { setPrices((current) => ({ ...current, [id]: await fetchLowestNftPrice(id) })); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } }
  return <Stack spacing={3}>
    <Card><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h5">Assets</Typography>{hiddenTokens.length > 0 && <Button size="small" onClick={showAllTokens}>Show all tokens</Button>}</Stack><Stack spacing={1} sx={{ mt: 2 }}>{balances.length ? balances.map((token: any, index: number) => { const hidden = hiddenTokens.includes(`${token.contract ?? ""}:${token.symbol ?? ""}`); return <Stack key={`${token.symbol}-${index}`} direction="row" alignItems="center" justifyContent="space-between" sx={{ opacity: hidden ? .58 : 1, borderBottom: 1, borderColor: "divider", py: .75 }}><Stack direction="row" spacing={1} alignItems="center"><Chip label={`${token.symbol}: ${hidden ? "Hidden" : token.balance}`} /><Typography variant="caption" color="text.secondary">{token.contract}</Typography></Stack><Tooltip title={hidden ? "Show token" : "Hide token"}><IconButton aria-label={hidden ? `Show ${token.symbol}` : `Hide ${token.symbol}`} onClick={() => toggleTokenVisibility(token)}>{hidden ? <VisibilityOff /> : <Visibility />}</IconButton></Tooltip></Stack>; }) : <Typography color="text.secondary">No balances loaded yet.</Typography>}</Stack></CardContent></Card>
    {error && <Alert severity="error">{error}</Alert>}
    <Typography variant="h5">NFT gallery</Typography><Grid container spacing={2}>{nfts.map((n: any) => <Grid item xs={12} sm={6} md={3} key={n.asset_id}><Card><CardContent><Typography variant="h6">#{n.asset_id}</Typography><Typography>{n.name || n.data?.name || "WAX NFT"}</Typography><Typography variant="body2" color="text.secondary">{n.collection?.collection_name || "Unknown collection"}</Typography>{prices[n.asset_id]?.lowestPrice != null && <Typography sx={{ mt: 1 }}>Lowest: {prices[n.asset_id].lowestPrice} {prices[n.asset_id].symbol}</Typography>}<Button sx={{ mt: 1 }} onClick={() => price(n.asset_id)}>{prices[n.asset_id] ? "Refresh price" : "Show lowest price"}</Button></CardContent></Card></Grid>)}</Grid>
  </Stack>;
}
