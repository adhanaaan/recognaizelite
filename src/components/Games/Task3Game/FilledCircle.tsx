interface Props extends React.SVGProps<SVGSVGElement> {
  percent: number;
}

function draw(alpha: number) {
  if (alpha === 2) return "M 0 0 v -18 A 18 18 1 1 1 -0.0001 -18 z";

  const r = alpha * Math.PI,
    x = Math.sin(r) * 18,
    y = Math.cos(r) * -18,
    mid = alpha > 1 ? 1 : 0;

  return "M 0 0 v -18 A 18 18 1 " + mid + " 1 " + x + " " + y + " z";
}

export function FilledCircle({ percent }: Props) {
  const id = "circle-gradient" + percent;
  return (
    <svg
      viewBox="0 0 36 36"
      className="size-11 tall:size-[52px]"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25))",
      }}
    >
      <path fill="#ffffff77" transform="translate(18, 18)" z={0} d="M 0 0 v -18 A 18 18 1 1 1 -0.0001 -18 z" />
      <path z={100} fill={`url(#${id})`} transform="translate(18, 18)" d={draw(percent * 2)} />
      <radialGradient
        id={id}
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="rotate(-180) scale(20.75)"
      >
        <stop stopColor="var(--gradient-start)" />
        <stop offset="1" stopColor="var(--gradient-end)" />
      </radialGradient>
    </svg>
  );
}
