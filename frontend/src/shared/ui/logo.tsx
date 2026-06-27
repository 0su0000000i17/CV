export function Logo() {
  return (
    <svg
      width="86"
      height="28"
      viewBox="0 0 86 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CVPro"
      role="img"
      className="h-7 w-auto"
    >
      <text
        x="0"
        y="21"
        className="fill-foreground"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: "24px",
          fontWeight: 500,
          letterSpacing: "-0.8px",
        }}
      >
        CV
      </text>

      <text
        x="31"
        y="21"
        className="fill-emerald-500"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: "24px",
          fontWeight: 500,
          letterSpacing: "-0.8px",
        }}
      >
        Pro
      </text>
    </svg>
  );
}
