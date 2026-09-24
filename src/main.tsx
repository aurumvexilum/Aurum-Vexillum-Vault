import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { DashboardScreen } from "./presentation/DashboardScreen";
import { SendScreen } from "./presentation/SendScreen";
import { AssetsScreen } from "./presentation/AssetsScreen";
import { RecoveryScreen } from "./presentation/RecoveryScreen";
import { DappScreen } from "./presentation/DappScreen";
import { Shell } from "./presentation/Shell";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <DashboardScreen /> },
      { path: "send", element: <SendScreen /> },
      { path: "assets", element: <AssetsScreen /> },
      { path: "recovery", element: <RecoveryScreen /> },
      { path: "dapps", element: <DappScreen /> },
    ],
  },
]);

const getPreferredTheme = () => (localStorage.getItem("wax-theme") === "dark" ? "dark" : "light");
const theme = createTheme({
  palette: {
    mode: getPreferredTheme(),
    primary: { main: "#6c5ce7" },
    secondary: { main: "#00b894" },
    background: { default: getPreferredTheme() === "dark" ? "#0b1020" : "#f3f6fb" },
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: "Inter, system-ui, sans-serif" },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <RouterProvider router={router} />
      </Box>
    </ThemeProvider>
  </React.StrictMode>,
);
