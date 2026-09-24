import React from "react";
import { Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { Favorite, FavoriteBorder, OpenInNew } from "@mui/icons-material";
import { SUPPORTED_DAPPS, useFavoriteDappStore } from "../application/favorite-dapp-store";

export function FavoritesScreen() {
  const { favoriteUrls, toggleFavorite } = useFavoriteDappStore();
  const favorites = SUPPORTED_DAPPS.filter((dapp) => favoriteUrls.includes(dapp.url));
  return <Stack spacing={3}><Card><CardContent><Typography variant="h4">Favorite dApps</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Your saved WAX destinations, stored locally on this device.</Typography></CardContent></Card>{favorites.length ? <Grid container spacing={2}>{favorites.map((dapp) => <Grid item xs={12} md={4} key={dapp.url}><Card><CardContent><Stack spacing={1.5}><Stack direction="row" justifyContent="space-between"><Typography variant="h6">{dapp.name}</Typography><Button size="small" startIcon={<Favorite />} onClick={() => toggleFavorite(dapp.url)}>Remove</Button></Stack><Chip label={dapp.status} sx={{ alignSelf: "flex-start" }} /><Typography variant="body2" color="text.secondary">{dapp.description}</Typography><Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>{dapp.url}</Typography><Button component="a" href={dapp.url} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNew />}>Open dApp</Button></Stack></CardContent></Card></Grid>)}</Grid> : <Card><CardContent><Stack spacing={1}><FavoriteBorder color="primary" /><Typography variant="h6">No favorite dApps yet</Typography><Typography color="text.secondary">Open the dApp directory and tap the heart on a trusted destination.</Typography><Button href="/dapps" variant="contained">Browse dApps</Button></Stack></CardContent></Card>}</Stack>;
}
