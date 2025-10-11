import React, { useEffect, useState } from "react";

interface PCBTraceProps {
  path: { x: number; y: number }[]; // Multiple points, not just from/to
  type: "power" | "data" | "control";
  isActive: boolean;
  label?: string;
  dotCount?: number;
  stageComplete?: boolean;
  payload?: "key" | "data" | "power";
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  path,
  type,
  isActive,
  label,
  dotCount = 4,
  stageComplete,
  payload,
}) => {
  const [dots, setDots] = useState<number[]>([]);

  // Path string from multiple segments
  const pathD = path
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(" ");

  // Trace color
  const getTraceColor = () => {
    switch (type) {
      case "power":
        return "#f87171";
      case "data":
        return "#60a5fa";
      case "control":
        return "#facc15";
      default:
        return "#a3a3a3";
    }
  };

  // Choose symbol based on payload
  const getSymbol = () => {
    switch (payload) {
      case "key":
        return "🔑";
      case "power":
        return "⚡";
      default:
        return "●";
    }
  };

  // Animate packets only if active
  useEffect(() => {
    if (!isActive || stageComplete) return;
    const interval = setInterval(() => {
      setDots((prev) =>
        prev.map((d) => (d + 1) % 100)
      );
    }, 100);
    return () => clearInterval(interval);
  }, [isActive, stageComplete]);

  useEffect(() => {
    setDots(Array.from({ length: dotCount }, (_, i) => (i * 100) / dotCount));
  }, [dotCount]);

  if (!isActive && !stageComplete) return null;

  return (
    <g>
      {/* Hollow PCB trace outline */}
      <path
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={stageComplete ? 0.3 : 1}
      />

      {/* Moving data packets */}
      {isActive &&
        dots.map((d, i) => (
          <circle key={i}>
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              keyPoints={`${d / 100};${(d + 10) / 100}`}
              keyTimes="0;1"
            >
              <mpath href={`#trace-${label}-${i}`} />
            </animateMotion>
          </circle>
        ))}

      {/* Symbol moving along trace */}
      {isActive &&
        dots.map((offset, i) => (
          <text key={i}>
            <textPath href={`#${label}-trace`} startOffset={`${offset}%`}>
              {getSymbol()}
            </textPath>
          </text>
        ))}
    </g>
  );
};

export default PCBTrace;
