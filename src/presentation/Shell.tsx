import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Button, Stack, Box, ThemeProvider, CssBaseline, createTheme, Select, MenuItem } from "@mui/material";
import { Dashboard, Send, Wallet, Security, Brightness4, Brightness7, Public, Favorite, Image, Settings, Explore, Menu as MenuIcon } from "@mui/icons-material";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Locale, translations } from "../i18n";

const GOLD = "#D4AF37";
const DARK_GOLD = "#B8860B";

export function Shell() {
  const [dark, setDark] = React.useState(() => localStorage.getItem("wax-theme") === "dark");
  const [locale, setLocale] = React.useState<Locale>(() => (localStorage.getItem("wax-locale") as Locale) || "en");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: dark
          ? {
              mode: "dark",
              primary: { main: GOLD, contrastText: "#090909" },
              secondary: { main: "#F0D98A" },
              background: { default: "#080808", paper: "#141414" },
              text: { primary: "#F7F4EA", secondary: "#B9B4A5" },
              divider: "rgba(212,175,55,.22)",
            }
          : {
              mode: "light",
              primary: { main: DARK_GOLD, contrastText: "#FFFFFF" },
              secondary: { main: GOLD },
              background: { default: "#FBFAF6", paper: "#FFFFFF" },
              text: { primary: "#171717", secondary: "#625D50" },
              divider: "rgba(184,134,11,.22)",
            },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          h4: { fontWeight: 800, letterSpacing: "-.03em" },
          h5: { fontWeight: 750 },
        },
        components: {
          MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 700 } } },
          MuiAppBar: { styleOverrides: { root: { backgroundImage: "none", borderBottom: `1px solid ${dark ? "rgba(212,175,55,.18)" : "rgba(184,134,11,.18)"}` } } },
          MuiCard: { styleOverrides: { root: { backgroundImage: "none", border: `1px solid ${dark ? "rgba(212,175,55,.16)" : "rgba(184,134,11,.16)"}`, boxShadow: dark ? "0 12px 36px rgba(0,0,0,.28)" : "0 12px 36px rgba(80,59,10,.07)" } } },
        },
      }),
    [dark],
  );

  React.useEffect(() => {
    localStorage.setItem("wax-theme", dark ? "dark" : "light");
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  React.useEffect(() => {
    localStorage.setItem("wax-locale", locale);
  }, [locale]);

  const t = (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key;

  const nav = [
    { to: "/", label: t("dashboard"), icon: <Dashboard /> },
    { to: "/assets", label: "Tokens", icon: <Wallet /> },
    { to: "/nfts", label: "NFTs", icon: <Image /> },
    { to: "/dapps", label: t("dapps"), icon: <Public /> },
    { to: "/favorites", label: "Favorites", icon: <Favorite /> },
    { to: "/explorer", label: "Explorer", icon: <Explore /> },
    { to: "/send", label: t("send"), icon: <Send /> },
    { to: "/recovery", label: t("recovery"), icon: <Security /> },
    { to: "/settings", label: "Settings", icon: <Settings /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AppBar position="sticky" elevation={0} color="inherit">
          <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto", gap: 1, py: 1 }}>
            <Box component="img" src="/logo.png" alt="Aurum Vexillum Vault logo" sx={{ width: 46, height: 46, objectFit: "contain", borderRadius: "50%" }} />
            <Box sx={{ flexGrow: 1, minWidth: 180 }}>
              <Typography variant="h6" sx={{ fontWeight: 850, lineHeight: 1.1 }}>Aurum Vexillum Vault</Typography>
              <Typography variant="caption" color="text.secondary">Secure your WAX. Own your digital world.</Typography>
            </Box>

            <IconButton aria-label="Open navigation menu" onClick={() => setMenuOpen((value) => !value)} sx={{ display: { xs: "inline-flex", lg: "none" } }}>
              <MenuIcon />
            </IconButton>

            <Stack direction="row" spacing={0.25} sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", flexWrap: "wrap" }}>
              {nav.map((item) => (
                <Button key={item.to} component={Link} to={item.to} color={location.pathname === item.to ? "primary" : "inherit"} startIcon={item.icon}>
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Select aria-label="language" size="small" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
              {Object.keys(translations).map((key) => (
                <MenuItem key={key} value={key}>{key.toUpperCase()}</MenuItem>
              ))}
            </Select>

            <IconButton aria-label="toggle theme" onClick={() => setDark((value) => !value)}>
              {dark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>

          {menuOpen && (
            <Stack direction="row" spacing={1} sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: 2, pb: 1, flexWrap: "wrap" }}>
              {nav.map((item) => (
                <Button key={item.to} component={Link} to={item.to} color={location.pathname === item.to ? "primary" : "inherit"} startIcon={item.icon} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}
        </AppBar>

        <Box sx={{ maxWidth: 1280, mx: "auto", p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
