import React from "react";

export type TransactionSecurityWarningProps = {
  warnings: string[];
  title?: string;
  origin?: string;
  account?: string;
  permission?: string;
  contract?: string;
  action?: string;
  network?: string;
  showDetails?: boolean;
};

export function TransactionSecurityWarning({
  warnings,
  title = "Security warning",
  origin,
  account,
  permission,
  contract,
  action,
  network,
  showDetails = true,
}: TransactionSecurityWarningProps) {
  if (!warnings || warnings.length === 0) return null;

  const safeWarnings = warnings.map((warning) => warning.trim()).filter(Boolean);
  if (safeWarnings.length === 0) return null;

  return (
    <div
      role="alert"
      style={{
        border: "1px solid #f59e0b",
        background: "rgba(245, 158, 11, 0.08)",
        borderRadius: 12,
        padding: "16px 18px",
        margin: "12px 0",
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span aria-hidden="true" style={{ fontSize: 18 }}>⚠️</span>
        <strong style={{ fontSize: 15 }}>{title}</strong>
      </div>

      <ul style={{ margin: "0 0 8px 18px", padding: 0, lineHeight: 1.55 }}>
        {safeWarnings.map((warning, index) => (
          <li key={`${warning}-${index}`} style={{ color: "#374151" }}>
            {warning}
          </li>
        ))}
      </ul>

      {showDetails && (
        <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          {origin ? <div>Origin: {origin}</div> : null}
          {account ? <div>Account: {account}</div> : null}
          {permission ? <div>Permission: {permission}</div> : null}
          {contract ? <div>Contract: {contract}</div> : null}
          {action ? <div>Action: {action}</div> : null}
          {network ? <div>Network: {network}</div> : null}
          <div style={{ marginTop: 6, fontWeight: 600, color: "#7c2d12" }}>
            Do not sign this request unless you fully trust the origin and action.
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionSecurityWarning;
