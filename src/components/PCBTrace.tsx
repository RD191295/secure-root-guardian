import React from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
}) => {
  // Outline color for the trace (fully transparent fill)
  const getTraceColor = () => {
    switch (type) {
      case 'power':
        return 'red';
      case 'data':
        return 'cyan';
      case 'control':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  // L-shaped path: horizontal → vertical
  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  const labelX = (startX + endX) / 2;
  const labelY = (startY + endY) / 2;

  return (
    <g className="pcb-trace">
      {/* Transparent inside, colored outline */}
      <path
        d={pathD}
        stroke={getTraceColor()} // colored outline
        strokeWidth={12} // pipeline thickness
        fill="none" // fully transparent inside
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Active faint pulse at midpoint */}
      {isActive && (
        <circle
          cx={labelX}
          cy={labelY}
          r={6}
          className="fill-cyan-400 animate-pulse opacity-30"
        />
      )}

      {/* Optional label */}
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
