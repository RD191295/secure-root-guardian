import React from 'react';

interface PCBTraceProps {
  points: { x: number; y: number }[];
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
}

const PCBTrace: React.FC<PCBTraceProps> = ({ points, isActive, type, label }) => {
  if (!points || points.length < 2) return null;

  // Generate smooth path (quadratic curves)
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    pathD += ` Q ${midX},${midY} ${curr.x},${curr.y}`;
  }

  const getTraceColor = () => {
    switch (type) {
      case 'power': return 'red';
      case 'data': return 'cyan';
      case 'control': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <g>
      {/* Path outline */}
      <path
        d={pathD}
        stroke="#555"
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
      {label && (
        <text
          x={(points[0].x + points[points.length - 1].x) / 2}
          y={(points[0].y + points[points.length - 1].y) / 2 - 10}
          fill="white"
          fontSize={12}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default PCBTrace;
