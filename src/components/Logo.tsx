import Link from "next/link";

interface LogoProps {
  color?: string;
  href?: string;
}

export default function Logo({ color = "white", href = "/" }: LogoProps) {
  return (
    <Link href={href} aria-label="tiki" className="shrink-0">
      <svg
        viewBox="0 0 168 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto"
      >
        <rect x="12" y="10" width="44" height="12" rx="6" fill={color} />
        <rect x="28" y="22" width="12" height="48" rx="6" fill={color} />
        <circle cx="76" cy="16" r="6" fill="#FF9BC2" />
        <rect x="70" y="28" width="12" height="42" rx="6" fill={color} />
        <rect x="94" y="10" width="12" height="60" rx="6" fill={color} />
        <path
          d="M100 40L128 10C131 7 136 7 139 10C142 13 142 18 139 21L118 40L139 59C142 62 142 67 139 70C136 73 131 73 128 70L100 40Z"
          fill={color}
        />
        <circle cx="154" cy="16" r="6" fill="#8ED8FF" />
        <rect x="148" y="28" width="12" height="42" rx="6" fill={color} />
      </svg>
    </Link>
  );
}