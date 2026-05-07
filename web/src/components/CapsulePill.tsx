import type { SVGProps } from "react";

/** Concentric capsule pills — 3 nested rounded rects with decreasing opacity. */
export function CapsulePill({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 660 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <rect x="20"  y="40"  width="620" height="260" rx="130" stroke="currentColor" strokeOpacity="1"   strokeWidth="6" />
      <rect x="80"  y="80"  width="500" height="180" rx="90"  stroke="currentColor" strokeOpacity="0.7" strokeWidth="5" />
      <rect x="140" y="120" width="380" height="100" rx="50"  stroke="currentColor" strokeOpacity="0.4" strokeWidth="4" />
    </svg>
  );
}
