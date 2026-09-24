import React from "react";
import { Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";

const dapps = [
  { name: "WAX Arena", url: "https://arena.wax.io", status: "Connected" },
  { name: "Alien Worlds", url: "https://alienworlds.io", status: "Pending" },
  { name: "WAX DAO", url: "https://dao.wax.io", status: "Connected" },
];

export function DappScreen() {
  return <Stack spacing={2}>
    <Card>
      <CardContent>
        <Typography variant="h5">dApp connections</Typography>
        <Typography variant="body2" color="text.secondary">Connect to a trusted WAX dApp and approve transactions explicitly before signing.</Typography>
      </CardContent>
    </Card>

    <Grid container spacing={2}>
      {dapps.map((dapp) => (
        <Grid item xs={12} md={4} key={dapp.name}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">{dapp.name}</Typography>
                <Chip label={dapp.status} color={dapp.status === "Connected" ? "success" : "default"} />
                <Typography variant="body2" color="text.secondary">{dapp.url}</Typography>
                <Button variant="contained">Connect</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Stack>;
}
