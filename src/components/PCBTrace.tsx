// src/components/PCBTrace.tsx
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
    switch (type) {
      case 'power':
        return '#ef4444'; // Red
      case 'data':
        return '#3b82f6'; // Blue
      case 'control':
        return '#facc15'; // Yellow
      default:
        return '#6b7280'; // Gray
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

  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  const labelX = (startX + endX) / 2;
  const labelY = (startY + endY) / 2;

  return (
    <g className="pcb-trace">
      {/* Stock outline */}
      <path
        d={pathD}
        stroke="#d1d5db" // Light gray
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
