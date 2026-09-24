import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Button, Stack, Box, ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { Dashboard, Send, Wallet, Security, Brightness4, Brightness7 } from "@mui/icons-material";
import { Link, Outlet } from "react-router-dom";

export function Shell() {
  const [dark, setDark] = React.useState(() => localStorage.getItem("wax-theme") === "dark");
  const theme = React.useMemo(() => createTheme({ palette: { mode: dark ? "dark" : "light", primary: { main: "#6c5ce7" } }, shape: { borderRadius: 14 } }), [dark]);
  React.useEffect(() => localStorage.setItem("wax-theme", dark ? "dark" : "light"), [dark]);

  return <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} color="inherit">
        <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
          <Wallet sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>WAX Vault</Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <Button component={Link} to="/" startIcon={<Dashboard />}>Dashboard</Button>
            <Button component={Link} to="/send" startIcon={<Send />}>Send</Button>
            <Button component={Link} to="/assets" startIcon={<Wallet />}>Assets</Button>
            <Button component={Link} to="/recovery" startIcon={<Security />}>Recovery</Button>
            <IconButton aria-label="toggle theme" onClick={() => setDark((value) => !value)}>{dark ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}><Outlet /></Box>
    </Box>
  </ThemeProvider>;
}
function DarkModeIcon() { return <Brightness4 />; }
function LightModeIcon() { return <Brightness7 />; }
