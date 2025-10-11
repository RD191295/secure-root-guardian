import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
  dotCount?: number; // number of moving dots
  speed?: number;    // animation speed
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
  dotCount = 5,
  speed = 0.01,
}) => {
  const [dotPositions, setDotPositions] = useState<number[]>([]);

  // Initialize dots with staggered starting positions
  useEffect(() => {
    setDotPositions(Array.from({ length: dotCount }, (_, i) => i / dotCount));
  }, [dotCount]);

  const getTraceColor = () => {
    switch (type) {
      case 'power': return 'red';
      case 'data': return 'cyan';
      case 'control': return 'yellow';
      default: return 'gray';
    }
  };

  // Compute L-shaped path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  // Function to get dot coordinates along L-shaped path
  const getDotCoord = (t: number) => {
    if (t < 0.5) {
      const p = t * 2;
      return { x: startX + (midX - startX) * p, y: startY + (midY - startY) * p };
    } else {
      const p = (t - 0.5) * 2;
      return { x: midX + (endX - midX) * p, y: midY + (endY - midY) * p };
    }
  };

  // Animate dots
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setDotPositions((prev) => prev.map((p) => (p + speed) % 1));
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [isActive, speed]);

  const labelX = (startX + endX) / 2;
  const labelY = (startY + endY) / 2;

  return (
    <g className="pcb-trace">
      {/* Stock outline */}
      <path
        d={pathD}
        stroke="#555555"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main trace */}
      <path
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Moving dots */}
      {isActive &&
        dotPositions.map((t, i) => {
          const { x, y } = getDotCoord(t);
          return <circle key={i} cx={x} cy={y} r={5} fill={getTraceColor()} className="opacity-70" />;
        })}
      {/* Label */}
      {label && isActive && (
        <text
          x={labelX}
          y={labelY - 15}
          className="fill-gray-300 text-xs font-mono"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default PCBTrace;
