import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Shell } from "./presentation/Shell";
import { DashboardScreen } from "./presentation/DashboardScreen";
import { SendScreen } from "./presentation/SendScreen";
import { AssetsScreen } from "./presentation/AssetsScreen";
import { RecoveryScreen } from "./presentation/RecoveryScreen";
import { DappScreen } from "./presentation/DappScreen";
import { TradeScreen } from "./presentation/TradeScreen";
export default function App() { return <BrowserRouter><Routes><Route element={<Shell />}><Route path="/" element={<DashboardScreen />} /><Route path="/send" element={<SendScreen />} /><Route path="/assets" element={<AssetsScreen />} /><Route path="/recovery" element={<RecoveryScreen />} /><Route path="/dapps" element={<DappScreen />} /><Route path="/trade" element={<TradeScreen />} /></Route></Routes></BrowserRouter>; }
