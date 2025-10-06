import type { CSSProperties } from "react";
import arrowsSvg from "../assets/arrows.svg?raw";

interface ArrowProps {
  width?: number;
  height?: number;
  style?: CSSProperties;
  className?: string;
}

export function Arrow({ style, className }: ArrowProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        lineHeight: 0,
        color: "#FFFFFF",
        opacity: 0.5,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: arrowsSvg }}
    />
  );
}
