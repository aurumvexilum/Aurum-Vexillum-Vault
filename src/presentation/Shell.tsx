import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Button, Stack, Box } from "@mui/material";
import { Dashboard, Send, Wallet, Security, Brightness4, Brightness7 } from "@mui/icons-material";
import { Link, Outlet } from "react-router-dom";

export function Shell() {
  const [dark, setDark] = React.useState(false);
  return (
    <Box sx={{ minHeight: "100vh", background: dark ? "#0b1020" : "#f5f7fb" }}>
      <AppBar position="static" color={dark ? "transparent" : "default"} enableColorOnDark>
        <Toolbar>
          <Wallet sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>WAX Vault</Typography>
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/" startIcon={<Dashboard />}>Dashboard</Button>
            <Button component={Link} to="/send" startIcon={<Send />}>Send</Button>
            <Button component={Link} to="/assets" startIcon={<Wallet />}>Assets</Button>
            <Button component={Link} to="/recovery" startIcon={<Security />}>Recovery</Button>
            <IconButton onClick={() => setDark((value) => !value)}>{dark ? <Brightness7 /> : <Brightness4 />}</IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
