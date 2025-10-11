import React, { useEffect, useState } from "react";

interface PCBTraceProps {
  id: string; // unique id for animation reference
  path: string; // full SVG path string (custom shape)
  type: "power" | "data" | "control" | "key";
  isActive: boolean;
  label?: string;
  progress?: number; // 0 = running, 1 = done
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  id,
  path,
  type,
  isActive,
  label,
  progress = 0,
}) => {
  const [symbolOffset, setSymbolOffset] = useState(0);

  // Get color by type
  const getTraceColor = () => {
    switch (type) {
      case "power":
        return "#f87171"; // red
      case "data":
        return "#22d3ee"; // cyan
      case "control":
        return "#a78bfa"; // purple
      case "key":
        return "#facc15"; // yellow
      default:
        return "#9ca3af"; // gray
    }
  };

  // Symbol for type
  const getSymbol = () => {
    switch (type) {
      case "power":
        return "⚡";
      case "data":
        return "⬤";
      case "control":
        return "🔁";
      case "key":
        return "🔑";
      default:
        return "⬤";
    }
  };

  // Animate symbol movement
  useEffect(() => {
    if (!isActive || progress === 1) return;
    const interval = setInterval(() => {
      setSymbolOffset((prev) => (prev + 0.02) % 1);
    }, 100);
    return () => clearInterval(interval);
  }, [isActive, progress]);

  // Hide when not active or stage completed
  if (!isActive || progress === 1) return null;

  return (
    <g className="pcb-trace">
      {/* Main outline (thicker background) */}
      <path
        id={id}
        d={path}
        stroke="#1e293b"
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Colored main trace */}
      <path
        d={path}
        stroke={getTraceColor()}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated symbol (data packet / power symbol) */}
      <text fontSize="16" fill={getTraceColor()}>
        <textPath
          href={`#${id}`}
          startOffset={`${symbolOffset * 100}%`}
          textAnchor="middle"
        >
          {getSymbol()}
        </textPath>
      </text>

      {/* Optional label */}
      {label && (
        <text
          x="50%"
          dy="-10"
          textAnchor="middle"
          fill={getTraceColor()}
          fontSize="12"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default PCBTrace;
