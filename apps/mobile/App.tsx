import React from "react";
import { SafeAreaView, View, Text, Button, useColorScheme, StyleSheet } from "react-native";
import { rpcBroker } from "../../src/infrastructure/dapp-connector";

export default function App() {
  const scheme = useColorScheme();
  const [status, setStatus] = React.useState("Ready");

  return <SafeAreaView style={[styles.safe, { backgroundColor: scheme === "dark" ? "#0b1020" : "#f5f7fb" }]}>
    <View style={styles.container}>
      <Text style={[styles.title, { color: scheme === "dark" ? "#ffffff" : "#0f172a" }]}>WAX Vault Mobile</Text>
      <Text style={[styles.text, { color: scheme === "dark" ? "#cbd5e1" : "#475569" }]}>Shared core services and dApp connectors power this app.</Text>
      <Button title="Check network" onPress={async () => {
        try {
          await rpcBroker.call((rpc) => rpc.get_info());
          setStatus("WAX network available");
        } catch {
          setStatus("All RPC endpoints unavailable");
        }
      }} />
      <Text style={[styles.status, { color: scheme === "dark" ? "#93c5fd" : "#1d4ed8" }]}>{status}</Text>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1 }, container: { flex: 1, padding: 24, justifyContent: "center", gap: 18 }, title: { fontSize: 32, fontWeight: "800" }, text: { fontSize: 16, lineHeight: 24 }, status: { marginTop: 8, fontSize: 16 } });
