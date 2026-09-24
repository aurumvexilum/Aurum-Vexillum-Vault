import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { DashboardScreen } from "./presentation/DashboardScreen";
import { SendScreen } from "./presentation/SendScreen";
import { AssetsScreen } from "./presentation/AssetsScreen";
import { NftScreen } from "./presentation/NftScreen";
import { RecoveryScreen } from "./presentation/RecoveryScreen";
import { DappScreen } from "./presentation/DappScreen";
import { FavoritesScreen } from "./presentation/FavoritesScreen";
import { ExplorerScreen } from "./presentation/ExplorerScreen";
import { SettingsScreen } from "./presentation/SettingsScreen";
import { Shell } from "./presentation/Shell";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <DashboardScreen /> },
      { path: "assets", element: <AssetsScreen /> },
      { path: "nfts", element: <NftScreen /> },
      { path: "dapps", element: <DappScreen /> },
      { path: "favorites", element: <FavoritesScreen /> },
      { path: "explorer", element: <ExplorerScreen /> },
      { path: "send", element: <SendScreen /> },
      { path: "recovery", element: <RecoveryScreen /> },
      { path: "settings", element: <SettingsScreen /> },
    ],
  },
]);

const getPreferredTheme = () => (localStorage.getItem("wax-theme") === "dark" ? "dark" : "light");
const theme = createTheme({
  palette: {
    mode: getPreferredTheme(),
    primary: { main: "#D4AF37" },
    secondary: { main: "#B8860B" },
    background: { default: getPreferredTheme() === "dark" ? "#080808" : "#FBFAF6", paper: getPreferredTheme() === "dark" ? "#141414" : "#FFFFFF" },
    text: { primary: getPreferredTheme() === "dark" ? "#F7F4EA" : "#171717", secondary: getPreferredTheme() === "dark" ? "#B9B4A5" : "#625D50" },
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif" },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
