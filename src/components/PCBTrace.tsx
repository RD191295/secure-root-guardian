import React, { useEffect, useRef, useState } from 'react';

interface PCBTraceProps {
  points: { x: number; y: number }[];
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
}

const PCBTrace: React.FC<PCBTraceProps> = ({ points, isActive, type, label }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [packetPosition, setPacketPosition] = useState(0);
  const [packetValue, setPacketValue] = useState<number>(Math.floor(Math.random() * 99));

  // Smooth curved path
  if (!points || points.length < 2) return null;
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
      case 'power': return '#ff4444';
      case 'data': return '#00ffff';
      case 'control': return '#ffff55';
      default: return '#888';
    }
  };

  // Animate packet (numbers move along trace)
  useEffect(() => {
    if (!isActive) {
      setPacketPosition(0);
      return;
    }
    const interval = setInterval(() => {
      setPacketPosition(p => {
        if (p >= 1) {
          setPacketValue(Math.floor(Math.random() * 99)); // new random number
          return 0;
        }
        return p + 0.01;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  // Calculate position of packet on path
  const packetPos = (() => {
    if (!pathRef.current) return { x: 0, y: 0 };
    const length = pathRef.current.getTotalLength();
    const point = pathRef.current.getPointAtLength(length * packetPosition);
    return { x: point.x, y: point.y };
  })();

  return (
    <g>
      {/* Trace background */}
      <path
        d={pathD}
        stroke="#222"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
      {/* Main trace */}
      <path
        ref={pathRef}
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 1 : 0.2}
      />

      {/* Moving packet (shows number for data, icon for others) */}
      {isActive && (
        <>
          {type === 'data' ? (
            <text
              x={packetPos.x}
              y={packetPos.y}
              fill="white"
              fontSize={12}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="monospace"
            >
              {packetValue.toString().padStart(2, '0')}
            </text>
          ) : type === 'power' ? (
            <text
              x={packetPos.x}
              y={packetPos.y}
              fill="red"
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              🔋
            </text>
          ) : (
            <text
              x={packetPos.x}
              y={packetPos.y}
              fill="yellow"
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              🔑
            </text>
          )}
        </>
      )}

      {/* Label */}
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
