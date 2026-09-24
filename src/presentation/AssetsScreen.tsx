import React from "react";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function AssetsScreen() {
  const { balances, nfts } = useDashboardStore();

  return <Card>
    <CardContent>
      <Typography variant="h5">Assets</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
        {balances.length ? balances.map((token, index) => <Chip key={`${token.symbol}-${index}`} label={`${token.symbol}: ${token.balance}`} />) : <Typography color="text.secondary">No balances loaded yet.</Typography>}
      </Stack>
      <Typography variant="h6" sx={{ mt: 4 }}>NFT collection</Typography>
      <Typography sx={{ mt: 1 }}>{nfts.length} collectibles</Typography>
    </CardContent>
  </Card>;
}
