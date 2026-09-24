import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { DashboardScreen } from "./presentation/DashboardScreen";
import { SendScreen } from "./presentation/SendScreen";
import { AssetsScreen } from "./presentation/AssetsScreen";
import { NftScreen } from "./presentation/NftScreen";
import { RecoveryScreen } from "./presentation/RecoveryScreen";
import { DappScreen } from "./presentation/DappScreen";
import { FavoritesScreen } from "./presentation/FavoritesScreen";
import { Shell } from "./presentation/Shell";

const router = createBrowserRouter([{ path: "/", element: <Shell />, children: [
  { index: true, element: <DashboardScreen /> },
  { path: "send", element: <SendScreen /> },
  { path: "assets", element: <AssetsScreen /> },
  { path: "nfts", element: <NftScreen /> },
  { path: "favorites", element: <FavoritesScreen /> },
  { path: "recovery", element: <RecoveryScreen /> },
  { path: "dapps", element: <DappScreen /> },
] }]);

createRoot(document.getElementById("root")!).render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>);
