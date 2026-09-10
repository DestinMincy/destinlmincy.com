/** Generic status badge with a hex marker. Pass a `colorMap` from status
 * string to one of the CSS tone tokens (signal, success, muted, accent, neutral).
 */
export function StatusBadge({
  status,
  label,
  tone,
}: {
  status: string;
  label: string;
  tone: "signal" | "success" | "muted" | "accent" | "neutral";
}) {
  return (
    <span className={`status-mark status-mark--${tone}`}>{label}</span>
  );
}
