import React from "react";
import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function AssetsScreen() {
  const { balances, nfts } = useDashboardStore();
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Assets</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          {balances.map((token, index) => (
            <Chip key={`${token.symbol}-${index}`} label={`${token.symbol}: ${token.balance}`} />
          ))}
        </Stack>
        <Typography sx={{ mt: 3 }}>NFTs: {nfts.length}</Typography>
      </CardContent>
    </Card>
  );
}
