import React from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number; // offset from chip center
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
     return isActive ? 'stroke-cyan-400/70' : 'stroke-cyan-400/30';
  };

  // --- Geometry math ---
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  // Offset start/end points so trace connects at chip edges
  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Smooth curve control point
  const curvature = 0.2;
  const controlX = startX + (dx / 2) - dy * curvature;
  const controlY = startY + (dy / 2) + dx * curvature;
  const pathD = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;

  // Angle for text rotation
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const rotation = angle + 180;

  // Determine glow color
  const glowColor =
    type === 'power'
      ? '#ef4444'
      : type === 'data'
      ? '#22d3ee'
      : '#4ade80';

  return (
    <g className="pcb-trace">
      {/* --- Main trace path --- */}
      <path
        id={`trace-path-${label || Math.random()}`} // give unique id
        d={pathD}
        className={`${getTraceColor()} transition-all duration-300`}
        strokeWidth={isActive ? 3 : 2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 1 : 0.3}
      />

      {/* --- Flowing signal dot --- */}
      {isActive && (
        <circle r="6" fill={glowColor} filter="url(#glow)">
          <animateMotion dur="1.5s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#trace-path-${label || Math.random()}`} />
          </animateMotion>
        </circle>
      )}

      {/* --- Endpoint circles --- */}
      {isActive && (
        <>
          <circle cx={startX} cy={startY} r="4" className="fill-cyan-400" />
          <circle cx={endX} cy={endY} r="4" className="fill-cyan-400" />
        </>
      )}

      {/* --- Label --- */}
      {label && (
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
