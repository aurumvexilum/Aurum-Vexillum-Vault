import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Button, Stack, Box, ThemeProvider, CssBaseline, createTheme, Select, MenuItem } from "@mui/material";
import { Dashboard, Send, Wallet, Security, Brightness4, Brightness7, Public, SwapHoriz } from "@mui/icons-material";
import { Link, Outlet } from "react-router-dom";
import { Locale, translations } from "../i18n";

export function Shell() {
  const [dark, setDark] = React.useState(() => localStorage.getItem("wax-theme") === "dark");
  const [locale, setLocale] = React.useState<Locale>(() => (localStorage.getItem("wax-locale") as Locale) || "en");
  const theme = React.useMemo(() => createTheme({ palette: { mode: dark ? "dark" : "light", primary: { main: "#6c5ce7" }, secondary: { main: "#00b894" } }, shape: { borderRadius: 14 }, typography: { fontFamily: "Inter, system-ui, sans-serif" } }), [dark]);
  React.useEffect(() => { localStorage.setItem("wax-theme", dark ? "dark" : "light"); }, [dark]); React.useEffect(() => { localStorage.setItem("wax-locale", locale); }, [locale]);
  const t = (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key;
  return <ThemeProvider theme={theme}><CssBaseline /><Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}><AppBar position="sticky" elevation={0} color="inherit"><Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", flexWrap: "wrap", gap: 1 }}><Wallet sx={{ color: "primary.main" }} /><Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>WAX Vault</Typography><Stack direction="row" spacing={0.25} sx={{ alignItems: "center", flexWrap: "wrap" }}><Button component={Link} to="/">{t("dashboard")}</Button><Button component={Link} to="/send" startIcon={<Send />}>{t("send")}</Button><Button component={Link} to="/assets" startIcon={<Wallet />}>{t("assets")}</Button><Button component={Link} to="/trade" startIcon={<SwapHoriz />}>{t("trade")}</Button><Button component={Link} to="/recovery" startIcon={<Security />}>{t("recovery")}</Button><Button component={Link} to="/dapps" startIcon={<Public />}>{t("dapps")}</Button><Select size="small" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>{Object.keys(translations).map((key) => <MenuItem key={key} value={key}>{key.toUpperCase()}</MenuItem>)}</Select><IconButton onClick={() => setDark((value) => !value)}>{dark ? <Brightness7 /> : <Brightness4 />}</IconButton></Stack></Toolbar></AppBar><Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}><Outlet /></Box></Box></ThemeProvider>;
}
