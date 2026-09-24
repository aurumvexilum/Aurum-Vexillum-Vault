import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  buildBuyRamAction,
  buildDelegateBandwidthAction,
  estimateRamBytes,
  getWaxRamMarket,
  getWaxResourceAccount,
  parseWax,
  WaxResourceAccount,
} from "../infrastructure/wax-resource-service";
import { useDashboardStore } from "../application/dashboard-store-v2";

type Health = "Healthy" | "Warning" | "Critical";
type ActionType = "stake" | "ram";

const usedPercent = (used = 0, max = 0) => (max > 0 ? Math.min(100, (used / max) * 100) : 0);
const waxValue = (value?: string) => Number(String(value || "0").split(" ")[0]) || 0;
const healthColor = (health: Health) => (health === "Critical" ? "error" : health === "Warning" ? "warning" : "success");

function healthFor(info: WaxResourceAccount): Health {
  const highest = Math.max(
    usedPercent(info.cpu_limit?.used, info.cpu_limit?.max),
    usedPercent(info.net_limit?.used, info.net_limit?.max),
    usedPercent(info.ram_usage, info.ram_quota),
  );
  return highest >= 95 ? "Critical" : highest >= 75 ? "Warning" : "Healthy";
}

function ResourceCard({ title, value, detail, percent }: { title: string; value: string; detail: string; percent?: number }) {
  const progress = percent ?? 0;
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="body2" color="text.secondary">{detail}</Typography>
          {percent != null && (
            <LinearProgress
              variant="determinate"
              value={progress}
              color={progress >= 95 ? "error" : progress >= 75 ? "warning" : "success"}
              sx={{ height: 8, borderRadius: 4 }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ResourcesScreen() {
  const { account, balances, history } = useDashboardStore();
  const [info, setInfo] = React.useState<WaxResourceAccount | null>(null);
  const [market, setMarket] = React.useState<any>(null);
  const [cpu, setCpu] = React.useState("");
  const [net, setNet] = React.useState("");
  const [ram, setRam] = React.useState("");
  const [receiver, setReceiver] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [actionType, setActionType] = React.useState<ActionType | null>(null);
  const [preview, setPreview] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");

  const load = React.useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      setError("");
      const [nextInfo, nextMarket] = await Promise.all([getWaxResourceAccount(account), getWaxRamMarket()]);
      setInfo(nextInfo);
      setMarket(nextMarket);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [account]);

  React.useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const target = receiver.trim() || account || "";
  const health = info ? healthFor(info) : "Healthy";
  const ramEstimate = market && ram ? (() => {
    try { return estimateRamBytes(market, ram); } catch { return null; }
  })() : null;
  const liquidWax = waxValue(balances.find((token: any) => token.symbol === "WAX")?.balance);
  const stakedWax = waxValue(info?.total_resources?.cpu_weight) + waxValue(info?.total_resources?.net_weight);
  const resourceHistory = history
    .filter((item: any) => ["delegatebw", "undelegatebw", "buyram", "buyrambytes"].includes(item.act?.name))
    .slice(0, 8);

  const openStakePreview = () => {
    try {
      if (!account) throw new Error("Verify an account before staking.");
      const action = buildDelegateBandwidthAction(account, target, cpu, net);
      setPreview(action);
      setConfirmation("");
      setError("");
      setActionType("stake");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const openRamPreview = () => {
    try {
      if (!account) throw new Error("Verify an account before buying RAM.");
      const action = buildBuyRamAction(account, target, ram);
      setPreview(action);
      setConfirmation("");
      setError("");
      setActionType("ram");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const approve = () => {
    if (confirmation.trim() !== "I CONFIRM") {
      setError("Type I CONFIRM to approve this resource action.");
      return;
    }
    setStatus(`Approved ${preview.name}. The action is ready for the configured signing provider.`);
    setActionType(null);
    setPreview(null);
    setConfirmation("");
    void load();
  };

  const quickAction = (kind: "cpu" | "net" | "ram" | "rebalance") => {
    if (!info) return;
    if (kind === "cpu") {
      setCpu(Math.max(0, Number(info.cpu_limit?.available || 0) / 1000).toFixed(8));
      setNet("");
    } else if (kind === "net") {
      setNet(Math.max(0, Number(info.net_limit?.available || 0) / 1000).toFixed(8));
      setCpu("");
    } else if (kind === "ram") {
      setRam("1.00000000");
    } else {
      setCpu("0.50000000");
      setNet("0.50000000");
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h4">WAX resources</Typography>
                <Typography color="text.secondary">
                  CPU and NET provide transaction bandwidth. RAM provides persistent account storage.
                </Typography>
              </Box>
              <Chip color={healthColor(health) as any} label={health} sx={{ alignSelf: { xs: "flex-start", sm: "center" } }} />
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Account: ${account || "Not selected"}`} />
              <Button component={Link} to="/recovery" size="small">Verify account</Button>
              <Button onClick={() => void load()} disabled={!account || loading}>
                {loading ? <CircularProgress size={16} /> : "Refresh totals"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!account && <Alert severity="info">Verify an account before viewing totals or preparing resource actions.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {status && <Alert severity="success">{status}</Alert>}

      {info && (
        <>
          <Alert severity={healthColor(health) as any}>
            {health === "Critical"
              ? "A resource is nearly exhausted. Transactions may fail; add resources before signing."
              : health === "Warning"
                ? "Resource capacity is getting low. Consider staking CPU/NET or buying RAM."
                : "CPU, NET, and RAM are within healthy ranges."}
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <ResourceCard title="RAM" value={`${info.ram_usage.toLocaleString()} / ${info.ram_quota.toLocaleString()} bytes`} detail={`${Math.max(0, info.ram_quota - info.ram_usage).toLocaleString()} available`} percent={usedPercent(info.ram_usage, info.ram_quota)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <ResourceCard title="CPU" value={info.cpu_limit ? `${info.cpu_limit.available.toLocaleString()} / ${info.cpu_limit.max.toLocaleString()}` : "—"} detail="available / max" percent={usedPercent(info.cpu_limit?.used, info.cpu_limit?.max)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <ResourceCard title="NET" value={info.net_limit ? `${info.net_limit.available.toLocaleString()} / ${info.net_limit.max.toLocaleString()}` : "—"} detail="available / max" percent={usedPercent(info.net_limit?.used, info.net_limit?.max)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <ResourceCard title="Account totals" value={`${stakedWax.toFixed(4)} WAX staked`} detail={`${liquidWax.toFixed(4)} WAX liquid`} />
            </Grid>
          </Grid>
        </>
      )}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Quick actions</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" onClick={() => quickAction("cpu")} disabled={!info}>Stake max CPU</Button>
              <Button variant="outlined" onClick={() => quickAction("net")} disabled={!info}>Stake max NET</Button>
              <Button variant="outlined" onClick={() => quickAction("ram")}>Buy small RAM</Button>
              <Button variant="outlined" onClick={() => quickAction("rebalance")} disabled={!info}>Rebalance resources</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Stake CPU / NET</Typography>
                <TextField label="Receiver account" value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder={account || "wax account"} />
                <TextField label="CPU WAX" value={cpu} onChange={(e) => setCpu(e.target.value)} inputMode="decimal" />
                <TextField label="NET WAX" value={net} onChange={(e) => setNet(e.target.value)} inputMode="decimal" />
                <Button variant="contained" onClick={openStakePreview} disabled={!account}>Review stake</Button>
                <Typography variant="body2" color="text.secondary">Staking affects bandwidth and is separate from your liquid WAX balance.</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Purchase RAM</Typography>
                <TextField label="Receiver account" value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder={account || "wax account"} />
                <TextField label="WAX to spend" value={ram} onChange={(e) => setRam(e.target.value)} inputMode="decimal" />
                <Typography color="text.secondary">Estimated bytes: {ramEstimate == null ? "—" : ramEstimate.toLocaleString()}</Typography>
                <Button variant="contained" onClick={openRamPreview} disabled={!account}>Review RAM purchase</Button>
                <Typography variant="body2" color="text.secondary">RAM is persistent storage purchased from the live RAM market.</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Resource history</Typography>
            {resourceHistory.length ? resourceHistory.map((item: any, index: number) => (
              <Stack key={index} direction="row" justifyContent="space-between" sx={{ borderBottom: 1, borderColor: "divider", pb: 1 }}>
                <Typography>{item.act?.name || "resource action"}</Typography>
                <Typography variant="caption" color="text.secondary">{item.block_time || item.timestamp || "recent"}</Typography>
              </Stack>
            )) : <Typography color="text.secondary">No resource changes found in recent account history.</Typography>}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={Boolean(actionType)} onClose={() => setActionType(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction preview</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Typography>Network: <strong>WAX mainnet</strong></Typography>
            <Typography>Action: <strong>{preview?.name}</strong></Typography>
            <Typography>Source: <strong>eosio</strong></Typography>
            <Typography>Payer / sender: <strong>{account}</strong></Typography>
            <Typography>Receiver: <strong>{target}</strong></Typography>
            <Box component="pre" sx={{ p: 1.5, overflow: "auto", bgcolor: "action.hover", borderRadius: 1, fontSize: 12 }}>{JSON.stringify(preview, null, 2)}</Box>
            <TextField label="Type I CONFIRM to approve" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            <Alert severity="warning">Review the exact action JSON before sending it to your signing provider.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionType(null)}>Cancel</Button>
          <Button variant="contained" onClick={approve}>Approve for signing</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
