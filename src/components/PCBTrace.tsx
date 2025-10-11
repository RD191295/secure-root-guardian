import React, { useEffect, useState } from "react";

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: "power" | "data" | "control";
  label?: string;
  dotCount?: number;
  stageComplete?: boolean;
  payload?: "key" | "power" | "data";
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  dotCount = 3,
  stageComplete = false,
  payload = "data",
}) => {
  const [offsets, setOffsets] = useState<number[]>(() =>
    Array.from({ length: dotCount }, (_, i) => i * 0.3)
  );

  // Color per trace type
  const getTraceColor = () => {
    switch (type) {
      case "power":
        return "#ef4444";
      case "data":
        return "#22d3ee";
      case "control":
        return "#facc15";
      default:
        return "#9ca3af";
    }
  };

  // Symbol per payload type
  const getSymbol = () => {
    switch (payload) {
      case "key":
        return "🔑";
      case "power":
        return "⚡";
      case "data":
      default:
        return "⬤";
    }
  };

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  // Path endpoints (offset from chip centers)
  const startX = from.x + ux * 25;
  const startY = from.y + uy * 25;
  const endX = to.x - ux * 25;
  const endY = to.y - uy * 25;

  // Example of custom “angled” trace path (L shape)
  const midX = startX + (endX - startX) / 2;
  const pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

  // Animate packet movement
  useEffect(() => {
    if (!isActive || stageComplete) return;
    const interval = setInterval(() => {
      setOffsets((prev) => prev.map((o) => (o + 0.05) % 1));
    }, 100);
    return () => clearInterval(interval);
  }, [isActive, stageComplete]);

  // Hide when inactive or completed
  if (!isActive || stageComplete) return null;

  return (
    <g className="pcb-trace">
      {/* Outline layer */}
      <path
        d={pathD}
        stroke="#1e293b"
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Colored trace */}
      <path
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Moving symbols (data packets) */}
      {offsets.map((offset, i) => {
        const t = offset;
        const x =
          startX +
          (endX - startX) * t +
          (Math.abs(midX - startX) > 10 ? Math.sin(t * Math.PI) * 5 : 0);
        const y = startY + (endY - startY) * t;

        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize="14"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={getTraceColor()}
          >
            {getSymbol()}
          </text>
        );
      })}

      {/* Label above center */}
      {label && (
        <text
          x={(startX + endX) / 2}
          y={(startY + endY) / 2 - 20}
          fill={getTraceColor()}
          textAnchor="middle"
          fontSize="12"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default PCBTrace;
