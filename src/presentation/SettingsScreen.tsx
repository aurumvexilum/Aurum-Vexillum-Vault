import React from "react";
import { Alert, Button, Card, CardContent, FormControlLabel, Grid, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";

export function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(localStorage.getItem("wax-theme") === "dark");
  const [showHidden, setShowHidden] = React.useState(true);
  const [rpc, setRpc] = React.useState("https://wax.greymass.com");
  const [language, setLanguage] = React.useState("en");

  const persistSettings = () => {
    localStorage.setItem("wax-theme", darkMode ? "dark" : "light");
    localStorage.setItem("wax-show-hidden", String(showHidden));
    localStorage.setItem("wax-rpc", rpc);
    localStorage.setItem("wax-locale", language);
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h4">Settings</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Local wallet preferences and display controls.</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Appearance</Typography>
                <FormControlLabel control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />} label="Dark mode" />
                <Select value={language} onChange={(e) => setLanguage(String(e.target.value))}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Wallet preferences</Typography>
                <FormControlLabel control={<Switch checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />} label="Show hidden tokens in dashboard" />
                <TextField label="Preferred RPC endpoint" value={rpc} onChange={(e) => setRpc(e.target.value)} />
                <Alert severity="warning">These settings are local to this browser and do not change your WAX account or your keys.</Alert>
                <Button variant="contained" onClick={persistSettings}>Save settings</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
