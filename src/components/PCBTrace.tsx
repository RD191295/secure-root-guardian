import React from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number; // 🆕 optional — half chip width or pad offset
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20, // default offset if not provided
}) => {
  const getTraceColor = () => {
    switch (type) {
      case 'power':
        return isActive ? 'stroke-red-500' : 'stroke-red-900';
      case 'data':
        return isActive ? 'stroke-cyan-400' : 'stroke-cyan-900';
      case 'control':
        return isActive ? 'stroke-green-400' : 'stroke-green-900';
      default:
        return 'stroke-gray-500';
    }
  };

  // --- Compute direction vector ---
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // --- Unit vector (normalized direction) ---
  const ux = dx / length;
  const uy = dy / length;

  // 🟢 Offset start and end points outward by chipRadius
  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  // --- Midpoint for animation & label ---
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // --- Smooth Bezier curve ---
  const curvature = 0.2;
  const controlX = startX + (dx / 2) - dy * curvature;
  const controlY = startY + (dy / 2) + dx * curvature;
  const pathD = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;

  // --- Rotation for label ---
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const rotation = angle + 180;

  return (
    <g className="pcb-trace">
      {/* Trace line */}
      <path
        d={pathD}
        className={`${getTraceColor()} transition-all duration-300`}
        strokeWidth={isActive ? 4 : 2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 1 : 0.3}
      />

      {/* Active connection highlights */}
      {isActive && (
        <>
          <circle cx={startX} cy={startY} r="4" className="fill-cyan-400 animate-pulse" />
          <circle cx={endX} cy={endY} r="4" className="fill-cyan-400" />

          {/* Mid pulse */}
          <circle
            cx={midX}
            cy={midY}
            r="4"
            className={`${
              type === 'data'
                ? 'fill-cyan-400'
                : type === 'power'
                ? 'fill-red-500'
                : 'fill-green-400'
            } animate-pulse`}
          >
            <animate attributeName="r" from="4" to="8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Rotated label */}
      {label && isActive && (
        <text
          x={midX}
          y={midY}
          className="fill-gray-300 text-xs font-mono select-none"
          textAnchor="middle"
          alignmentBaseline="middle"
          transform={`rotate(${rotation}, ${midX}, ${midY})`}
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default PCBTrace;
