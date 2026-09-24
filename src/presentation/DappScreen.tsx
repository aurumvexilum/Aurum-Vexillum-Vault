import React from "react";
import { Button, Card, CardContent, Chip, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Favorite, FavoriteBorder, OpenInNew } from "@mui/icons-material";
import { SUPPORTED_DAPPS, useFavoriteDappStore } from "../application/favorite-dapp-store";

export function DappScreen() {
  const { toggleFavorite, isFavorite } = useFavoriteDappStore();
  return <Stack spacing={3}>
    <Card><CardContent><Typography variant="h4">dApp directory</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Connect to supported WAX dApps and save trusted destinations to your favorites.</Typography></CardContent></Card>
    <Grid container spacing={2}>{SUPPORTED_DAPPS.map((dapp) => { const favorite = isFavorite(dapp.url); return <Grid item xs={12} md={4} key={dapp.url}><Card sx={{ height: "100%" }}><CardContent><Stack spacing={1.5}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><BoxTitle name={dapp.name} /><Tooltip title={favorite ? "Remove from favorites" : "Add to favorites"}><IconButton aria-label={`${favorite ? "Remove" : "Add"} ${dapp.name} favorite`} onClick={() => toggleFavorite(dapp.url)} color={favorite ? "error" : "default"}>{favorite ? <Favorite /> : <FavoriteBorder />}</IconButton></Tooltip></Stack><Chip sx={{ alignSelf: "flex-start" }} label={dapp.status} color={dapp.status === "Connected" ? "success" : "default"} /><Typography variant="body2" color="text.secondary">{dapp.description}</Typography><Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>{dapp.url}</Typography><Button component="a" href={dapp.url} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<OpenInNew />}>Open dApp</Button></Stack></CardContent></Card></Grid>; })}</Grid>
  </Stack>;
}
function BoxTitle({ name }: { name: string }) { return <Typography variant="h6" fontWeight={750}>{name}</Typography>; }
