import React, { useState } from "react";
import TransactionSecurityWarning from "./TransactionSecurityWarning";

export interface TransactionApprovalScreenProps {
  origin?: string;
  account: string;
  permission: string;
  contract: string;
  action: string;
  recipient?: string;
  quantity?: string;
  fee?: string;
  slippage?: string;
  expiry?: string;
  network: string;
  warnings: string[];
  errors: string[];
  onApprove: (confirmationText: string) => void;
  onReject: () => void;
  loading?: boolean;
}

export function TransactionApprovalScreen({
  origin,
  account,
  permission,
  contract,
  action,
  recipient,
  quantity,
  fee,
  slippage,
  expiry,
  network,
  warnings,
  errors,
  onApprove,
  onReject,
  loading = false,
}: TransactionApprovalScreenProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isConfirmationValid = confirmationText.trim().length >= 3;

  const handleApprove = () => {
    if (!isConfirmationValid) return;
    onApprove(confirmationText);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "system-ui, sans-serif",
        background: "#f9fafb",
        borderRadius: 8,
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 700, color: "#111827" }}>
          Review Transaction
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
          Please review all details before confirming this request.
        </p>
      </div>

      {/* CRITICAL ERRORS - BLOCK SIGNING */}
      {hasErrors && (
        <div
          style={{
            border: "2px solid #dc2626",
            background: "rgba(220, 38, 38, 0.08)",
            borderRadius: 12,
            padding: "16px 18px",
            margin: "16px 0",
            color: "#7f1d1d",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span aria-hidden="true" style={{ fontSize: 20 }}>🚫</span>
            <strong style={{ fontSize: 15 }}>Cannot Sign - Critical Issues</strong>
          </div>
          <ul style={{ margin: "0 0 8px 18px", padding: 0, lineHeight: 1.6 }}>
            {errors.map((error, index) => (
              <li key={`error-${index}`} style={{ color: "#991b1b" }}>
                {error}
              </li>
            ))}
          </ul>
          <div style={{ fontSize: 12, color: "#7f1d1d", marginTop: 8 }}>
            Do not proceed. Reject this request immediately.
          </div>
        </div>
      )}

      {/* SECURITY WARNINGS */}
      {hasWarnings && (
        <TransactionSecurityWarning
          warnings={warnings}
          title="⚠️ Security Warning"
          origin={origin}
          account={account}
          permission={permission}
          contract={contract}
          action={action}
          network={network}
          showDetails={true}
        />
      )}

      {/* TRANSACTION DETAILS */}
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "16px 18px",
          margin: "16px 0",
        }}
      >
        <h2 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 600, color: "#111827" }}>
          Transaction Details
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px 16px", fontSize: 13 }}>
          {origin && (
            <>
              <div style={{ fontWeight: 600, color: "#374151" }}>Origin:</div>
              <div
                style={{
                  color: "#111827",
                  wordBreak: "break-all",
                  padding: "6px 8px",
                  background: "#f3f4f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                }}
              >
                {origin}
              </div>
            </>
          )}

          <div style={{ fontWeight: 600, color: "#374151" }}>Account:</div>
          <div
            style={{
              color: "#111827",
              padding: "6px 8px",
              background: "#f3f4f6",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            {account}
          </div>

          <div style={{ fontWeight: 600, color: "#374151" }}>Permission:</div>
          <div
            style={{
              color: "#111827",
              padding: "6px 8px",
              background: "#f3f4f6",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            {permission}
          </div>

          <div style={{ fontWeight: 600, color: "#374151" }}>Contract:</div>
          <div
            style={{
              color: "#111827",
              padding: "6px 8px",
              background: "#f3f4f6",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            {contract}
          </div>

          <div style={{ fontWeight: 600, color: "#374151" }}>Action:</div>
          <div
            style={{
              color: "#111827",
              padding: "6px 8px",
              background: "#f3f4f6",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            {action}
          </div>

          {recipient && (
            <>
              <div style={{ fontWeight: 600, color: "#374151" }}>Recipient:</div>
              <div
                style={{
                  color: "#111827",
                  padding: "6px 8px",
                  background: "#f3f4f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                }}
              >
                {recipient}
              </div>
            </>
          )}

          {quantity && (
            <>
              <div style={{ fontWeight: 600, color: "#374151" }}>Quantity:</div>
              <div
                style={{
                  color: "#111827",
                  padding: "6px 8px",
                  background: "#f3f4f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 14,
                }}
              >
                {quantity}
              </div>
            </>
          )}

          {fee && (
            <>
              <div style={{ fontWeight: 600, color: "#374151" }}>Fee:</div>
              <div
                style={{
                  color: "#111827",
                  padding: "6px 8px",
                  background: "#f3f4f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                }}
              >
                {fee}
              </div>
            </>
          )}

          {slippage && (
            <>
              <div style={{ fontWeight: 600, color: "#374151" }}>Slippage:</div>
              <div
                style={{
                  color: "#111827",
                  padding: "6px 8px",
                  background: "#f3f4f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                }}
              >
                {slippage}
              </div>
            </>
          )}

          {expiry && (
            <>
              <div style={{ fontWeight: 600, color: "#374151" }}>Expiry:</div>
              <div
                style={{
                  color: "#111827",
                  padding: "6px 8px",
                  background: "#f3f4f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                }}
              >
                {expiry}
              </div>
            </>
          )}

          <div style={{ fontWeight: 600, color: "#374151" }}>Network:</div>
          <div
            style={{
              color: "#111827",
              padding: "6px 8px",
              background: "#f3f4f6",
              borderRadius: 4,
              fontFamily: "monospace",
              fontWeight: 600,
            }}
          >
            {network.toUpperCase()}
          </div>
        </div>
      </div>

      {/* FINAL CONFIRMATION STEP */}
      {!showConfirmation ? (
        <div style={{ margin: "24px 0" }}>
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={hasErrors}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 6,
              background: hasErrors ? "#d1d5db" : "#2563eb",
              color: hasErrors ? "#6b7280" : "white",
              cursor: hasErrors ? "not-allowed" : "pointer",
            }}
          >
            {hasErrors ? "Cannot Sign - Critical Issues" : "Review and Confirm"}
          </button>
          <button
            onClick={onReject}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "white",
              color: "#374151",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Reject Request
          </button>
        </div>
      ) : (
        <div style={{ margin: "24px 0" }}>
          {/* FINAL CONFIRMATION WARNING */}
          <div
            style={{
              border: "2px solid #f59e0b",
              background: "rgba(245, 158, 11, 0.1)",
              borderRadius: 8,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "#78350f" }}>
              Final Confirmation Required
            </h3>
            <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
              You are about to sign a transaction. This action is irreversible.
            </p>
            {hasWarnings && (
              <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
                <strong>⚠️ Warning:</strong> This request has security warnings. Only proceed if you fully trust the
                origin and action.
              </p>
            )}
            <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
              Type the word <strong>"approve"</strong> below to confirm this transaction:
            </p>
          </div>

          <input
            type="text"
            placeholder='Type "approve" to confirm'
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 14,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              boxSizing: "border-box",
              marginBottom: 12,
              fontFamily: "system-ui, sans-serif",
            }}
          />

          <button
            onClick={handleApprove}
            disabled={!isConfirmationValid || loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 6,
              background: isConfirmationValid && !loading ? "#059669" : "#d1d5db",
              color: isConfirmationValid && !loading ? "white" : "#6b7280",
              cursor: isConfirmationValid && !loading ? "pointer" : "not-allowed",
              marginBottom: 8,
            }}
          >
            {loading ? "Signing..." : "Sign Transaction"}
          </button>

          <button
            onClick={() => {
              setShowConfirmation(false);
              setConfirmationText("");
            }}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "white",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Back to Review
          </button>
        </div>
      )}

      {/* SECURITY FOOTER */}
      <div
        style={{
          marginTop: 24,
          padding: "12px 14px",
          background: "#f0fdf4",
          border: "1px solid #dcfce7",
          borderRadius: 6,
          fontSize: 12,
          color: "#166534",
          lineHeight: 1.6,
        }}
      >
        <strong>🔒 Security Tips:</strong>
        <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
          <li>Never sign transactions from untrusted origins.</li>
          <li>Verify the recipient address carefully.</li>
          <li>If this preview changed after review, reject and re-approve.</li>
          <li>Do not share your seed phrase or private keys with anyone.</li>
        </ul>
      </div>
    </div>
  );
}

export default TransactionApprovalScreen;
