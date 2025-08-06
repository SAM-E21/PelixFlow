import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      width="150"
      height="40"
      viewBox="0 0 150 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-white", className)}
      {...props}
    >
      <defs>
        <linearGradient id="icon-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB26B" />
          <stop offset="100%" stopColor="#FF5DA2" />
        </linearGradient>
        <linearGradient id="pelix-gradient" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#F50057" />
          <stop offset="50%" stopColor="#FF5DA2" />
          <stop offset="100%" stopColor="#A259FF" />
        </linearGradient>
        <linearGradient id="flow-gradient" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#A259FF" />
          <stop offset="100%" stopColor="#00B0FF" />
        </linearGradient>
      </defs>

      {/* Icon */}
      <rect width="36" height="36" rx="8" fill="url(#icon-gradient)" y="2" />
      <path d="M14 12 L14 28 L26 20 Z" fill="#F50057" />

      {/* Text */}
      <text
        x="45"
        y="29"
        fontFamily="Poppins, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="url(#pelix-gradient)"
      >
        Peli
        <tspan fill="url(#flow-gradient)">x</tspan>
      </text>

      <g transform="translate(0, 15)">
        <text
          x="72"
          y="29"
          fontFamily="Poppins, sans-serif"
          fontSize="24"
          fontWeight="bold"
          fill="url(#flow-gradient)"
        >
          Flow
        </text>
      </g>
    </svg>
  );
}
