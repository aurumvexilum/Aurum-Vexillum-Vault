import React from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Grid, IconButton, LinearProgress, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { Memory, Refresh, TrendingUp, Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useDashboardStore } from "../application/dashboard-store-v2";
import { SUPPORTED_DAPPS, useFavoriteDappStore } from "../application/favorite-dapp-store";
import { getWaxResourceAccount } from "../infrastructure/wax-resource-service";

const percent = (used = 0, max = 0) => (max > 0 ? Math.min(100, (used / max) * 100) : 0);
const amount = (value?: string) => Number(String(value || "0").split(" ")[0]) || 0;

export function DashboardScreen() {
  const { account, balances, history, nfts, loading, error, refresh, isTokenHidden, toggleTokenVisibility } = useDashboardStore();
  const { favoriteUrls } = useFavoriteDappStore();
  const [resources, setResources] = React.useState<any>(null);
  const visibleBalances = balances.filter((token: any) => !isTokenHidden(token));
  const favoriteApps = SUPPORTED_DAPPS.filter((dapp) => favoriteUrls.includes(dapp.url)).slice(0, 3);

  React.useEffect(() => {
    if (!account) {
      setResources(null);
      return;
    }
    void getWaxResourceAccount(account).then(setResources).catch(() => setResources(null));
  }, [account]);

  const liquidWax = amount(balances.find((token: any) => token.symbol === "WAX")?.balance);
  const stakedWax = amount(resources?.total_resources?.cpu_weight) + amount(resources?.total_resources?.net_weight);
  const ramUsed = percent(resources?.ram_usage, resources?.ram_quota);
  const cpuUsed = percent(resources?.cpu_limit?.used, resources?.cpu_limit?.max);
  const netUsed = percent(resources?.net_limit?.used, resources?.net_limit?.max);
  const highestUsage = Math.max(ramUsed, cpuUsed, netUsed);
  const health = highestUsage >= 95 ? "Critical" : highestUsage >= 75 ? "Warning" : "Healthy";
  const healthColor = health === "Critical" ? "error" : health === "Warning" ? "warning" : "success";

  return (
    <Stack spacing={3}>
      <Card sx={{ background: "linear-gradient(135deg, #17130a, #b8860b)", color: "white" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="overline">Portfolio overview</Typography>
              <Typography variant="h4" fontWeight={800}>{account || "Connect a WAX account"}</Typography>
              <Typography sx={{ opacity: 0.85 }}>Non-custodial assets, resources, and dApp activity.</Typography>
            </Box>
            <Button variant="contained" color="inherit" startIcon={<Refresh />} onClick={() => refresh()} disabled={loading} sx={{ color: "#4938b5", alignSelf: "center" }}>
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {!account && <Alert severity="info">Verify or connect a WAX account to unlock wallet and resource activity.</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Card sx={{ height: "100%" }}><CardContent><Stack spacing={2}><Stack direction="row" justifyContent="space-between"><Typography variant="h6">Favorites</Typography><Button component={Link} to="/favorites" size="small">Manage</Button></Stack>{favoriteApps.length ? favoriteApps.map((dapp) => <Stack key={dapp.url} direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={700}>{dapp.name}</Typography><Button component="a" href={dapp.url} target="_blank" rel="noreferrer" size="small">Open</Button></Stack>) : <Typography color="text.secondary">No favorite dApps yet.</Typography>}</Stack></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card sx={{ height: "100%" }}><CardContent><Stack spacing={2}><Stack direction="row" justifyContent="space-between"><Stack direction="row" spacing={1} alignItems="center"><Memory color="primary" /><Typography variant="h6">Resources</Typography></Stack><Button component={Link} to="/resources" size="small">Manage</Button></Stack>{resources ? <><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="body2">Account health</Typography><Chip size="small" color={healthColor as any} label={health} /></Stack><Typography variant="body2">Liquid WAX: <strong>{liquidWax.toFixed(4)}</strong></Typography><Typography variant="body2">Staked WAX: <strong>{stakedWax.toFixed(4)}</strong></Typography><Typography variant="body2">RAM used: <strong>{ramUsed.toFixed(1)}%</strong></Typography><LinearProgress variant="determinate" value={ramUsed} color={ramUsed >= 95 ? "error" : ramUsed >= 75 ? "warning" : "success"} sx={{ height: 8, borderRadius: 4 }} /></> : <Typography color="text.secondary">Load account resources from the Resources page.</Typography>}</Stack></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card sx={{ height: "100%" }}><CardContent><Stack spacing={2}><Typography variant="h6">Settings</Typography><Typography variant="body2" color="text.secondary">Theme: {localStorage.getItem("wax-theme") === "dark" ? "Dark" : "Light"}</Typography><Typography variant="body2" color="text.secondary" noWrap>RPC: {localStorage.getItem("wax-rpc") || "https://wax.greymass.com"}</Typography><Button variant="contained" component={Link} to="/settings">Review settings</Button></Stack></CardContent></Card></Grid>
      </Grid>

      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2}>{(loading ? [1, 2, 3, 4] : visibleBalances).map((token: any, index: number) => <Grid item xs={12} sm={6} md={3} key={token?.symbol ?? index}><Card variant="outlined"><CardContent>{loading ? <Skeleton height={72} /> : <><Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>{token.icon ?? "◈"} {token.symbol}</Typography><Tooltip title={isTokenHidden(token) ? "Show token" : "Hide token"}><IconButton size="small" onClick={() => toggleTokenVisibility(token)}>{isTokenHidden(token) ? <VisibilityOff /> : <Visibility />}</IconButton></Tooltip></Stack><Typography variant="h5" sx={{ mt: 2 }}>{token.balance}</Typography><Typography variant="caption" color="text.secondary">{token.name ?? token.contract}</Typography></>}</CardContent></Card></Grid>)}</Grid>
      {!loading && balances.length > 0 && visibleBalances.length === 0 && <Alert severity="info">All tokens are hidden. Open Assets to restore them.</Alert>}
      <Grid container spacing={2}><Grid item xs={12} md={7}><Card><CardContent><Stack direction="row" justifyContent="space-between"><Typography variant="h6">Activity stream</Typography><TrendingUp color="primary" /></Stack><Stack spacing={1.5} sx={{ mt: 2 }}>{history.length ? history.slice(0, 8).map((item: any, index: number) => <Stack key={index} direction="row" justifyContent="space-between"><Typography>{item.act?.name ?? "chain action"}</Typography><Chip size="small" label={item.trx_id ? `${item.trx_id.slice(0, 8)}…` : "action"} /></Stack>) : <Typography color="text.secondary">No activity loaded yet.</Typography>}</Stack></CardContent></Card></Grid><Grid item xs={12} md={5}><Card><CardContent><Typography variant="h6">NFT gallery</Typography><Typography variant="h3" sx={{ my: 2 }}>{nfts.length}</Typography><Button component={Link} to="/nfts">View NFTs</Button></CardContent></Card></Grid></Grid>
    </Stack>
  );
}
