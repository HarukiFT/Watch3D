import type { CSSProperties } from "react";
import logoSvg from "../assets/logo.svg?raw";

interface LogoProps {
  width?: number;
  height?: number;
  style?: CSSProperties;
  className?: string;
}

export function Logo({ style, className }: LogoProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        lineHeight: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: logoSvg }}
    />
  );
}
