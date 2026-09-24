import React from "react";
import { Alert, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

const explorers = [
  { name: "WAXBlock", url: "https://waxblock.io", description: "Official-style explorer for WAX blocks, transactions, accounts, and token activity.", category: "Explorer" },
  { name: "WAX Items", url: "https://waxitems.io", description: "NFT and collection-focused WAX marketplace insights.", category: "NFT" },
  { name: "Bdata.one", url: "https://bdata.one", description: "Cross-chain and WAX analytics and explorer pages.", category: "Analytics" },
  { name: "EOS Authority", url: "https://eosauthority.com", description: "General Antelope explorer features with WAX account and resource data.", category: "Explorer" },
  { name: "AtomicHub", url: "https://wax.atomichub.io", description: "NFT marketplace and explorer for WAX collections and assets.", category: "Marketplace" },
  { name: "DappRadar", url: "https://dappradar.com/rankings/protocol/wax", description: "Curated rankings and activity tracking for active WAX dApps.", category: "Directory" },
  { name: "Alcor Exchange", url: "https://alcor.exchange", description: "Market data and token swap insights for WAX ecosystems.", category: "DeFi" },
  { name: "Waxplorer", url: "https://waxplorer.io", description: "Data and visualization hub for WAX blocks and token movement.", category: "Explorer" },
];

export function ExplorerScreen() {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h4">WAX dApp explorer</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Discover WAX ecosystem apps, block explorers, marketplaces, and analytics surfaces before connecting.
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="info">
        Use explorer pages for verification only. Always confirm the exact origin, account, and transaction details before approving a connection or signing.
      </Alert>

      <Grid container spacing={2}>
        {explorers.map((item) => (
          <Grid item xs={12} md={6} key={item.name}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{item.name}</Typography>
                    <Chip label={item.category} size="small" color="primary" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  <Typography variant="caption" sx={{ wordBreak: "break-all" }} color="text.secondary">{item.url}</Typography>
                  <Button component="a" href={item.url} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<OpenInNew />}>
                    Open explorer
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
