import React from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
}

const PCBTrace: React.FC<PCBTraceProps> = ({ from, to, isActive, type, label }) => {
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

  // --- Midpoint and curvature for curved path ---
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // 🟢 Smooth Bezier curve instead of L-shape
  const curvature = (to.y - from.y) * 0.3;
  const pathD = `M ${from.x} ${from.y} Q ${midX} ${midY - curvature}, ${to.x} ${to.y}`;

  // 🔄 Compute rotation angle of the trace for text alignment
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  return (
    <g className="pcb-trace">
      {/* --- Main trace line --- */}
      <path
        d={pathD}
        className={`${getTraceColor()} transition-all duration-300`}
        strokeWidth={isActive ? 4 : 2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 1 : 0.3}
      />

      {/* --- Animated trace points --- */}
      {isActive && (
        <>
          <circle cx={from.x} cy={from.y} r="6" className="fill-cyan-400 animate-pulse" />
          <circle cx={to.x} cy={to.y} r="6" className="fill-cyan-400" />

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

      {/* --- Label aligned on trace and rotated 180° --- */}
      {label && isActive && (
        <text
          x={midX}
          y={midY}
          className="fill-gray-300 text-xs font-mono select-none"
          textAnchor="middle"
          alignmentBaseline="middle"
          transform={`rotate(${angle + 180}, ${midX}, ${midY})`}
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default PCBTrace;
