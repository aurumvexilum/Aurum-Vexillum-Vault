import { AppBar, Toolbar, Typography, Stack, Button, IconButton } from "@mui/material";
import { Dashboard, Send, Wallet, Security, Brightness4, Brightness7 } from "@mui/icons-material";
import { Link } from "react-router-dom";

export function NavigationBar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <AppBar position="static" color={dark ? "transparent" : "default"} enableColorOnDark>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>WAX Vault</Typography>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/" startIcon={<Dashboard />}>Dashboard</Button>
          <Button component={Link} to="/send" startIcon={<Send />}>Send</Button>
          <Button component={Link} to="/assets" startIcon={<Wallet />}>Assets</Button>
          <Button component={Link} to="/recovery" startIcon={<Security />}>Recovery</Button>
          <IconButton onClick={onToggle}>{dark ? <Brightness7 /> : <Brightness4 />}</IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
