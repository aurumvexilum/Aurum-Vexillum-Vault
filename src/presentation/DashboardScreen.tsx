import React from "react";
import { Card, CardContent, Grid, Typography, Box, Chip, Stack } from "@mui/material";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function DashboardScreen() {
  const { account, balances, history, nfts, loading, error } = useDashboardStore();

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h5">Portfolio</Typography>
          <Typography variant="body2" color="text.secondary">Account: {account || "Not selected"}</Typography>
          {error && <Typography color="error.main">{error}</Typography>}
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {balances.map((token, index) => (
          <Grid item xs={12} sm={6} md={3} key={`${token.symbol}-${index}`}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{token.symbol}</Typography>
                  <Chip label={token.contract} size="small" />
                </Stack>
                <Typography variant="h4">{token.balance}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent activity</Typography>
              <Box sx={{ mt: 2 }}>
                {history.length ? history.slice(0, 5).map((item, index) => (
                  <Typography key={`${item.act?.name}-${index}`} variant="body2">{item.act?.name ?? "action"}</Typography>
                )) : <Typography>No activity yet.</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">NFT gallery</Typography>
              <Typography>{nfts.length} collectibles</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
