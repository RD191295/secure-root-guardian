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
  // Fully transparent trace
  const getTraceColor = () => 'stroke-transparent';

  // Start/end offset for chip edge
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;
  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  // Orthogonal L-shaped path
  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  // Midpoint for optional pulse or label
  const labelX = (startX + endX) / 2;
  const labelY = (startY + endY) / 2;

  return (
    <g className="pcb-trace">
      {/* Trace line fully transparent */}
      <path
        d={pathD}
        className={getTraceColor()}
        strokeWidth={12} // optional pipeline width
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Optional midpoint pulse (can also hide if you want full transparency) */}
      {isActive && (
        <circle
          cx={labelX}
          cy={labelY}
          r={6}
          className="fill-cyan-400 animate-pulse opacity-30"
        />
      )}
    </g>
  );
};

export default PCBTrace;
