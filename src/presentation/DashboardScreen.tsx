import React from "react";
import { Alert, Button, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { Refresh, TrendingUp } from "@mui/icons-material";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function DashboardScreen() {
  const { account, balances, history, nfts, loading, error, refresh } = useDashboardStore();
  return <Stack spacing={3}>
    <Card sx={{ background: "linear-gradient(135deg,#6c5ce7,#00b894)", color: "white" }}><CardContent>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
        <Box><Typography variant="overline">Portfolio overview</Typography><Typography variant="h4" fontWeight={800}>{account || "Connect a WAX account"}</Typography><Typography sx={{ opacity: .85 }}>Non-custodial assets and on-chain activity</Typography></Box>
        <Button variant="contained" color="inherit" startIcon={<Refresh />} onClick={() => refresh()} disabled={loading} sx={{ color: "#4938b5", alignSelf: "center" }}>{loading ? "Refreshing…" : "Refresh"}</Button>
      </Stack>
    </CardContent></Card>
    {error && <Alert severity="error">{error}</Alert>}
    <Grid container spacing={2}>{(loading ? [1,2,3,4] : balances).map((token: any, index: number) => <Grid item xs={12} sm={6} md={3} key={token.symbol ?? index}><Card variant="outlined"><CardContent>
      {loading ? <Skeleton height={70} /> : <><Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>{token.icon ?? "◈"} {token.symbol}</Typography><Chip size="small" label={token.verified ? "Verified" : "Token"} color={token.verified ? "success" : "default"} /></Stack><Typography variant="h5" sx={{ mt: 2 }}>{token.balance}</Typography><Typography variant="caption" color="text.secondary">{token.name ?? token.contract}</Typography></>}
    </CardContent></Card></Grid>)}</Grid>
    <Grid container spacing={2}><Grid item xs={12} md={7}><Card><CardContent><Stack direction="row" justifyContent="space-between"><Typography variant="h6">Activity stream</Typography><TrendingUp color="primary" /></Stack><Stack spacing={1.5} sx={{ mt: 2 }}>{history.length ? history.slice(0, 8).map((item: any, index: number) => <Stack key={index} direction="row" justifyContent="space-between" sx={{ borderBottom: 1, borderColor: "divider", pb: 1 }}><Box><Typography fontWeight={600}>{item.act?.name ?? "chain action"}</Typography><Typography variant="caption" color="text.secondary">{item.act?.data?.quantity ?? item.block_time ?? "WAX blockchain"}</Typography></Box><Chip size="small" label={item.trx_id ? `${item.trx_id.slice(0, 8)}…` : "action"} /></Stack>) : <Typography color="text.secondary">No activity loaded yet.</Typography>}</Stack></CardContent></Card></Grid><Grid item xs={12} md={5}><Card><CardContent><Typography variant="h6">NFT gallery</Typography><Typography variant="h3" sx={{ my: 2 }}>{nfts.length}</Typography><Typography color="text.secondary">AtomicAssets held by this account</Typography><Button sx={{ mt: 2 }} href="/assets">View assets</Button></CardContent></Card></Grid></Grid>
  </Stack>;
}
