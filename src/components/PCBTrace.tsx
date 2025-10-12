import React, { useEffect, useRef } from 'react';

interface PCBTraceProps {
  points: { x: number; y: number }[];
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
}

const PCBTrace: React.FC<PCBTraceProps> = ({ points, isActive, type, label }) => {
  if (!points || points.length < 2) return null;

  const packetRef = useRef<SVGCircleElement | null>(null);

  // Generate smooth path
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
      case 'power': return '#ff4040';
      case 'data': return '#00ffff';
      case 'control': return '#ffd700';
      default: return '#888';
    }
  };

  // Animate the "data packet" along the path
  useEffect(() => {
    if (!isActive || !packetRef.current) return;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    const length = path.getTotalLength();
    let start = 0;

    const move = () => {
      if (packetRef.current) {
        const point = path.getPointAtLength(start);
        packetRef.current.setAttribute('cx', point.x.toString());
        packetRef.current.setAttribute('cy', point.y.toString());
        start = (start + 3) % length; // speed
      }
      requestAnimationFrame(move);
    };

    move();
  }, [isActive, pathD]);

  return (
    <g opacity={isActive ? 1 : 0.15}>
      <path
        d={pathD}
        stroke="#333"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={isActive ? "6 6" : "0"}
        style={{
          animation: isActive ? 'dash 1.2s linear infinite' : 'none'
        }}
      />
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

      {/* Animated data packet */}
      {isActive && (
        <circle
          ref={packetRef}
          r={6}
          fill={getTraceColor()}
          stroke="white"
          strokeWidth={1.5}
        />
      )}
    </g>
  );
};

export default PCBTrace;
