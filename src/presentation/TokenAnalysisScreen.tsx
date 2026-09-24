import React from "react";
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { OpenInNew, Refresh } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { fetchTokenPools, PoolLiquidity } from "../infrastructure/token-liquidity-service";
import { Token } from "../lib/wax";

export function TokenAnalysisScreen() {
  const location = useLocation();
  const token = (location.state as { token?: Token } | null)?.token;
  const [pools, setPools] = React.useState<PoolLiquidity[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadPools = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      setPools(await fetchTokenPools(token));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void loadPools();
  }, [loadPools]);

  if (!token) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">No token was selected for analysis.</Alert>
        <Button component={Link} to="/assets" variant="contained">Back to tokens</Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h4">{token.name || token.symbol} analysis</Typography>
            <Typography color="text.secondary">
              {token.symbol} · {token.contract} · {token.precision} decimals
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label="Alcor + TacSwap" color="primary" variant="outlined" />
              <Button onClick={() => void loadPools()} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}>
                Refresh pools
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <BoxTitle />
            {loading ? (
              <CircularProgress />
            ) : pools.length === 0 ? (
              <Alert severity="info">No matching Alcor or TacSwap pools were returned for this token.</Alert>
            ) : (
              <Grid container spacing={2}>
                {pools.map((pool) => (
                  <Grid item xs={12} md={6} key={`${pool.exchange}-${pool.id}`}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                            <Typography variant="h6">{pool.pair}</Typography>
                            <Chip label={pool.exchange} size="small" color={pool.exchange === "Alcor" ? "primary" : "secondary"} />
                          </Stack>
                          <Typography variant="body2">Reserve A: {pool.reserveA || "Not provided"}</Typography>
                          <Typography variant="body2">Reserve B: {pool.reserveB || "Not provided"}</Typography>
                          <Typography variant="body2">Liquidity / TVL: {pool.liquidity || "Not provided"}</Typography>
                          <Typography variant="body2">Fee: {pool.fee || "Not provided"}</Typography>
                          {pool.price != null && <Typography variant="body2">Last price: {pool.price}</Typography>}
                          {pool.url && <Button component="a" href={pool.url} target="_blank" rel="noreferrer" endIcon={<OpenInNew />}>Open pool</Button>}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Alert severity="warning">
        Pool data is informational and may become stale. Verify token contracts, reserves, price impact, slippage, and route before approving a trade.
      </Alert>
    </Stack>
  );
}

function BoxTitle() {
  return (
    <Stack>
      <Typography variant="h5">Liquidity pools</Typography>
      <Typography variant="body2" color="text.secondary">
        Live data returned by the exchange API or WAX contract tables.
      </Typography>
    </Stack>
  );
}
