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
  // Trace outline color
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
      {/* Hollow trace (only edge) */}
      {/* Stock outline (behind) */}
        <path
          d={pathD}
          stroke="#CCCCCC"     // outline color
          strokeWidth={8}      // slightly thicker
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Main hollow trace */}
        <path
          d={pathD}
          stroke={getTraceColor()} // main trace color
          strokeWidth={4}           // slightly thinner
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      {/* Optional active moving dot inside the trace */}
      {isActive && (
        <circle
          cx={labelX}
          cy={labelY}
          r={6}
          fill={getTraceColor()}
          className="animate-ping opacity-50"
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
