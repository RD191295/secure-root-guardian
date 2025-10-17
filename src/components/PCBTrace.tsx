import React, { useState } from 'react';

interface PCBTraceProps {
  points: { x: number; y: number }[];
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  offset?: number;
}

const PCBTrace: React.FC<PCBTraceProps> = ({ points, isActive, type, label, offset = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!points || points.length < 2) return null;

  // Smooth quadratic path with offset
  let pathD = `M ${points[0].x},${points[0].y + offset}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2 + offset;
    pathD += ` Q ${midX},${midY} ${curr.x},${curr.y + offset}`;
  }

  const getTraceColor = () => {
    if (!isActive) return '#555';
    switch (type) {
      case 'power': return '#ef4444'; // red
      case 'data': return '#06b6d4'; // cyan
      case 'control': return '#eab308'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  const getTraceWidth = () => {
    return isHovered ? 6 : 4;
  };

  return (
    <g>
      {/* Invisible wider path for easier hover detection */}
      <path
        d={pathD}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Base trace (darker background) */}
      <path
        d={pathD}
        stroke="#333"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Active trace with glow */}
      <path
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={getTraceWidth()}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ 
          filter: isActive ? 'url(#glow)' : 'none',
          transition: 'all 0.3s ease-out'
        }}
      />
      
      {/* Label */}
      {label && isActive && (
        <g>
          {/* Label background for better readability */}
          <rect
            x={(points[0].x + points[points.length - 1].x) / 2 - 30}
            y={(points[0].y + points[points.length - 1].y) / 2 - 18 + offset}
            width={60}
            height={16}
            fill="rgba(0, 0, 0, 0.8)"
            rx={4}
            opacity={isHovered ? 1 : 0.7}
          />
          <text
            x={(points[0].x + points[points.length - 1].x) / 2}
            y={(points[0].y + points[points.length - 1].y) / 2 - 8 + offset}
            fill={getTraceColor()}
            fontSize={10}
            fontWeight="bold"
            textAnchor="middle"
            style={{ transition: 'all 0.3s ease-out' }}
          >
            {label}
          </text>
        </g>
      )}
      
      {/* Tooltip on hover */}
      {isHovered && isActive && (
        <g>
          <rect
            x={(points[0].x + points[points.length - 1].x) / 2 - 50}
            y={(points[0].y + points[points.length - 1].y) / 2 + 10 + offset}
            width={100}
            height={30}
            fill="rgba(0, 0, 0, 0.95)"
            rx={6}
            stroke={getTraceColor()}
            strokeWidth={2}
          />
          <text
            x={(points[0].x + points[points.length - 1].x) / 2}
            y={(points[0].y + points[points.length - 1].y) / 2 + 24 + offset}
            fill="white"
            fontSize={9}
            fontWeight="bold"
            textAnchor="middle"
          >
            {type.toUpperCase()} BUS
          </text>
          <text
            x={(points[0].x + points[points.length - 1].x) / 2}
            y={(points[0].y + points[points.length - 1].y) / 2 + 34 + offset}
            fill={getTraceColor()}
            fontSize={8}
            textAnchor="middle"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

export default PCBTrace;
