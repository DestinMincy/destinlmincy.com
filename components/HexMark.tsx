type HexMarkProps = {
  size?: "sm" | "md" | "lg";
};

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
