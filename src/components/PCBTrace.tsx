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
  const [trailPositions, setTrailPositions] = useState<{ x: number; y: number; opacity: number }[]>([]);

  if (!points || points.length < 2) return null;

  // Smooth curved path
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

  // Animate packet along the trace
  useEffect(() => {
    if (!isActive) {
      setPacketPosition(0);
      setTrailPositions([]);
      return;
    }

    const interval = setInterval(() => {
      setPacketPosition(p => {
        let next = p + 0.01;
        if (next >= 1) {
          next = 0;
          setPacketValue(Math.floor(Math.random() * 99));
        }
        return next;
      });

      // Add packet to trail
      setTrailPositions(trail => {
        const length = pathRef.current?.getTotalLength() || 1;
        const point = pathRef.current?.getPointAtLength((length) * packetPosition) || { x: 0, y: 0 };
        const newTrail = [{ x: point.x, y: point.y, opacity: 1 }, ...trail];
        return newTrail.slice(0, 20); // keep trail length
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, packetPosition]);

  // Fade trail
  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setTrailPositions(trail =>
        trail.map(t => ({ ...t, opacity: t.opacity * 0.85 })).filter(t => t.opacity > 0.05)
      );
    }, 50);
    return () => clearInterval(fadeInterval);
  }, []);

  return (
    <g>
      {/* Trace background */}
      <path
        d={pathD}
        stroke="#222"
        strokeWidth={12}
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

      {/* Glow trail */}
      {trailPositions.map((t, idx) => (
        <circle
          key={idx}
          cx={t.x}
          cy={t.y}
          r={6}
          fill={getTraceColor()}
          opacity={t.opacity}
          filter="url(#glow)"
        />
      ))}

      {/* Moving packet */}
      {isActive && (
        <>
          {type === 'data' ? (
            <text
              x={trailPositions[0]?.x || 0}
              y={trailPositions[0]?.y || 0}
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
              x={trailPositions[0]?.x || 0}
              y={trailPositions[0]?.y || 0}
              fill="red"
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              🔋
            </text>
          ) : (
            <text
              x={trailPositions[0]?.x || 0}
              y={trailPositions[0]?.y || 0}
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
