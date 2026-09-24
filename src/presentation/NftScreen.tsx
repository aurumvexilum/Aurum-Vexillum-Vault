import React from "react";
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { fetchLowestNftPrice } from "../infrastructure/nft-market-service";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function NftScreen() {
  const { nfts } = useDashboardStore();
  const [prices, setPrices] = React.useState<Record<string, any>>({});
  const [error, setError] = React.useState("");
  async function price(id: string) { try { setError(""); const result = await fetchLowestNftPrice(id); setPrices((current) => ({ ...current, [id]: result })); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } }
  return <Stack spacing={3}><Card><CardContent><Typography variant="h4">NFT collection</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{nfts.length} collectibles held by this account</Typography></CardContent></Card>{error && <Alert severity="error">{error}</Alert>}<Grid container spacing={2}>{nfts.length ? nfts.map((n: any) => <Grid item xs={12} sm={6} md={4} lg={3} key={n.asset_id}><Card sx={{ height: "100%" }}><CardContent><Stack spacing={1}><Typography variant="h6">#{n.asset_id}</Typography><Typography>{n.name || n.data?.name || "WAX NFT"}</Typography><Typography variant="body2" color="text.secondary">{n.collection?.collection_name || "Unknown collection"}</Typography>{prices[n.asset_id]?.lowestPrice != null && <Typography sx={{ mt: 1 }}>Lowest listing: {prices[n.asset_id].lowestPrice} {prices[n.asset_id].symbol}</Typography>}<Button onClick={() => price(n.asset_id)}>{prices[n.asset_id] ? "Refresh price" : "Show lowest listing"}</Button></Stack></CardContent></Card></Grid>) : <Grid item xs={12}><Typography color="text.secondary">No NFTs loaded yet.</Typography></Grid>}</Grid></Stack>;
}
