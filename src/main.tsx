import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { DashboardScreen } from "./presentation/DashboardScreen";
import { AssetsScreen } from "./presentation/AssetsScreen";
import { TokenAnalysisScreen } from "./presentation/TokenAnalysisScreen";
import { Shell } from "./presentation/Shell";
import { SendScreen } from "./presentation/SendScreen";
import { ReceiveScreen } from "./presentation/ReceiveScreen";
import { TradeScreen } from "./presentation/TradeScreen";
import { NftScreen } from "./presentation/NftScreen";
import { RecoveryScreen } from "./presentation/RecoveryScreen";
import { DappScreen } from "./presentation/DappScreen";
import { FavoritesScreen } from "./presentation/FavoritesScreen";
import { ExplorerScreen } from "./presentation/ExplorerScreen";
import { SettingsScreen } from "./presentation/SettingsScreen";
import { ResourcesScreen } from "./presentation/ResourcesScreen";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<DashboardScreen />} />
          <Route path="assets" element={<AssetsScreen />} />
          <Route path="assets/analysis" element={<TokenAnalysisScreen />} />
          <Route path="nfts" element={<NftScreen />} />
          <Route path="resources" element={<ResourcesScreen />} />
          <Route path="send" element={<SendScreen />} />
          <Route path="receive" element={<ReceiveScreen />} />
          <Route path="trade" element={<TradeScreen />} />
          <Route path="dapps" element={<DappScreen />} />
          <Route path="favorites" element={<FavoritesScreen />} />
          <Route path="explorer" element={<ExplorerScreen />} />
          <Route path="recovery" element={<RecoveryScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
