import React from "react";
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { buildBuyRamAction, buildDelegateBandwidthAction, getWaxResourceAccount, WaxResourceAccount } from "../infrastructure/wax-resource-service";
import { useDashboardStore } from "../application/dashboard-store-v2";

function bytes(value?: number) { return value == null ? "—" : `${value.toLocaleString()} bytes`; }
function resourceLabel(resource?: { used: number; available: number; max: number }) { return resource ? `${resource.used.toLocaleString()} used / ${resource.max.toLocaleString()} max` : "—"; }

export function ResourcesScreen() {
  const { account } = useDashboardStore();
  const [info, setInfo] = React.useState<WaxResourceAccount | null>(null);
  const [cpu, setCpu] = React.useState("");
  const [net, setNet] = React.useState("");
  const [ram, setRam] = React.useState("");
  const [receiver, setReceiver] = React.useState("");
  const [dialog, setDialog] = React.useState<"stake" | "ram" | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");

  const load = async () => {
    if (!account) return;
    try { setLoading(true); setError(""); setInfo(await getWaxResourceAccount(account)); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setLoading(false); }
  };
  React.useEffect(() => { void load(); }, [account]);

  const target = receiver || account || "";
  const reviewStake = () => { if (!account || !target || (Number(cpu) <= 0 && Number(net) <= 0)) { setError("Enter a receiver and a CPU or NET amount."); return; } setDialog("stake"); };
  const reviewRam = () => { if (!account || !target || Number(ram) <= 0) { setError("Enter a receiver and a WAX amount for RAM."); return; } setDialog("ram"); };
  const approve = () => {
    if (!account) return;
    const action = dialog === "stake" ? buildDelegateBandwidthAction(account, target, cpu, net) : buildBuyRamAction(account, target, ram);
    setDialog(null);
    setStatus(`Action prepared: ${action.name}. Connect an audited signer to approve and broadcast it.`);
  };

  return <Stack spacing={3}>
    <Card><CardContent><Stack spacing={1}><Typography variant="h4">WAX resources</Typography><Typography color="text.secondary">Monitor RAM, CPU, and NET for the active account. Resource actions are always reviewed before signing.</Typography><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={`Account: ${account || "Not selected"}`} /><Button component={Link} to="/recovery" size="small">Verify account</Button><Button onClick={load} disabled={!account || loading} startIcon={loading ? <CircularProgress size={16} /> : undefined}>{loading ? "Loading" : "Refresh totals"}</Button></Stack></Stack></CardContent></Card>
    {!account && <Alert severity="info">Verify or select a WAX account to view resource totals and prepare resource actions.</Alert>}
    {error && <Alert severity="error">{error}</Alert>}{status && <Alert severity="info">{status}</Alert>}
    {info && <Grid container spacing={2}><Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">RAM</Typography><Typography variant="h5" sx={{ mt: 1 }}>{bytes(info.ram_usage)} / {bytes(info.ram_quota)}</Typography><Typography color="text.secondary">{Math.max(0, info.ram_quota - info.ram_usage).toLocaleString()} bytes available</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">CPU</Typography><Typography variant="h5" sx={{ mt: 1 }}>{resourceLabel(info.cpu_limit)}</Typography><Typography color="text.secondary">Staked: {info.total_resources?.cpu_weight || "—"}</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">NET</Typography><Typography variant="h5" sx={{ mt: 1 }}>{resourceLabel(info.net_limit)}</Typography><Typography color="text.secondary">Staked: {info.total_resources?.net_weight || "—"}</Typography></CardContent></Card></Grid></Grid>}
    <Grid container spacing={2}><Grid item xs={12} md={6}><Card><CardContent><Stack spacing={2}><Typography variant="h6">Stake CPU / NET</Typography><TextField label="Receiver account" value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder={account || "wax account"} /><TextField label="CPU WAX" value={cpu} onChange={(e) => setCpu(e.target.value)} inputMode="decimal" /><TextField label="NET WAX" value={net} onChange={(e) => setNet(e.target.value)} inputMode="decimal" /><Button variant="contained" onClick={reviewStake} disabled={!account}>Review stake</Button></Stack></CardContent></Card></Grid><Grid item xs={12} md={6}><Card><CardContent><Stack spacing={2}><Typography variant="h6">Purchase RAM</Typography><TextField label="Receiver account" value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder={account || "wax account"} /><TextField label="WAX to spend" value={ram} onChange={(e) => setRam(e.target.value)} inputMode="decimal" /><Typography variant="body2" color="text.secondary">The exact bytes received depend on the live RAM market price.</Typography><Button variant="contained" onClick={reviewRam} disabled={!account}>Review RAM purchase</Button></Stack></CardContent></Card></Grid></Grid>
    <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)}><DialogTitle>Review resource action</DialogTitle><DialogContent><Stack spacing={1} sx={{ pt: 1 }}><Typography>Account: <strong>{account}</strong></Typography><Typography>Receiver: <strong>{target}</strong></Typography>{dialog === "stake" ? <><Typography>CPU: <strong>{cpu || "0"} WAX</strong></Typography><Typography>NET: <strong>{net || "0"} WAX</strong></Typography></> : <Typography>RAM spend: <strong>{ram} WAX</strong></Typography>}<Alert severity="warning">This prepares an eosio resource action. Confirm the receiver, amounts, and signer prompt before broadcasting.</Alert></Stack></DialogContent><DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" onClick={approve}>Approve for signing</Button></DialogActions></Dialog>
  </Stack>;
}
