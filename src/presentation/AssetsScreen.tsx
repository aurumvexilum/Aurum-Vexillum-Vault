import React from "react";
import { Alert, Button, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Analytics, Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useDashboardStore } from "../application/dashboard-store-v2";

export function AssetsScreen() {
  const { balances, hiddenTokens, toggleTokenVisibility, showAllTokens } = useDashboardStore();

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Stack>
              <Typography variant="h4">Tokens</Typography>
              <Typography color="text.secondary">Balances, visibility preferences, and token analysis.</Typography>
            </Stack>
            {hiddenTokens.length > 0 && <Button size="small" onClick={showAllTokens}>Show all tokens</Button>}
          </Stack>
        </CardContent>
      </Card>

      {balances.length === 0 && <Alert severity="info">No token balances loaded yet. Connect an account and refresh the dashboard.</Alert>}

      {balances.map((token: any) => {
        const key = `${token.contract ?? ""}:${token.symbol ?? ""}`;
        const hidden = hiddenTokens.includes(key);

        return (
          <Card key={key}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                <Stack sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{token.icon || "◈"} {token.symbol}</Typography>
                  <Typography color="text.secondary">{token.name || token.contract}</Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{token.balance}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip size="small" label={hidden ? "Hidden" : "Visible"} />
                    <Chip size="small" variant="outlined" label={token.contract} />
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button component={Link} to="/assets/analysis" state={{ token }} variant="contained" startIcon={<Analytics />}>
                    Analyze token
                  </Button>
                  <Tooltip title={hidden ? "Show token" : "Hide token"}>
                    <IconButton onClick={() => toggleTokenVisibility(token)} aria-label={hidden ? `Show ${token.symbol}` : `Hide ${token.symbol}`}>
                      {hidden ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
