type HexMarkProps = {
  size?: "sm" | "md" | "lg";
};

/**
 * Renders a decorative hexagon mark image in the specified size.
 *
 * @param size - The size variant ("sm", "md", or "lg"), defaults to "md".
 */
export function HexMark({ size = "md" }: HexMarkProps) {
  return (
    <img
      className={`hex-mark hex-mark--${size}`}
      src="/img/hex-mark.svg"
      alt=""
      aria-hidden="true"
    />
  );
}
