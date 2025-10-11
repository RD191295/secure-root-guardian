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
  const getTraceColor = () => {
    // subtle light-blue to integrate with pipeline
    return isActive ? 'stroke-cyan-400' : 'stroke-cyan-300/30';
  };

  // Compute start/end points offset by chip radius
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;
  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  // Orthogonal path (L-shaped: horizontal → vertical)
  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  // Midpoint for label
  const labelX = (startX + endX) / 2;
  const labelY = (startY + endY) / 2;

  return (
    <g className="pcb-trace">
      {/* PCB trace line */}
      <path
        d={pathD}
        className={`${getTraceColor()} transition-all duration-300`}
        strokeWidth={isActive ? 3 : 2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 1 : 0.4}
      />

      {/* Active pulse at mid */}
      {isActive && (
        <circle
          cx={labelX}
          cy={labelY}
          r="4"
          className="fill-cyan-400 animate-pulse"
        />
      )}

      {/* Optional label */}
      {label && isActive && (
        <text
          x={labelX}
          y={labelY - 10}
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
