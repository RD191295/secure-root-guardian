import React, { useEffect, useRef, useState } from 'react';

interface PCBTraceProps {
  points: { x: number; y: number }[];
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
}

const PCBTrace: React.FC<PCBTraceProps> = ({ points, isActive, type, label }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [packetValue, setPacketValue] = useState(Math.floor(Math.random() * 99));
  const [trail, setTrail] = useState<{ x: number; y: number; opacity: number }[]>([]);
  const packetProgress = useRef(0);

  if (!points || points.length < 2) return null;

  // Smooth quadratic path
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

  useEffect(() => {
    if (!isActive) {
      packetProgress.current = 0;
      setTrail([]);
      return;
    }

    let animationFrame: number;

    const animate = () => {
      const pathEl = pathRef.current;
      if (!pathEl) return;

      const pathLength = pathEl.getTotalLength();
      const point = pathEl.getPointAtLength(packetProgress.current * pathLength);

      // Add to trail
      setTrail(trail => {
        const newTrail = [{ x: point.x, y: point.y, opacity: 1 }, ...trail];
        return newTrail.slice(0, 25); // limit trail length
      });

      // Move packet forward
      packetProgress.current += 0.002; // controls speed
      if (packetProgress.current >= 1) {
        packetProgress.current = 0;
        setPacketValue(Math.floor(Math.random() * 99));
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [isActive]);

  // Fade trail
  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setTrail(trail => trail.map(t => ({ ...t, opacity: t.opacity * 0.85 })).filter(t => t.opacity > 0.05));
    }, 50);
    return () => clearInterval(fadeInterval);
  }, []);

  return (
    <g>
      <path
        d={pathD}
        stroke="#222"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
      <path
        ref={pathRef}
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 1 : 0.2}
      />

      {/* Glow trail */}
      {trail.map((t, idx) => (
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
              x={trail[0]?.x || 0}
              y={trail[0]?.y || 0}
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
              x={trail[0]?.x || 0}
              y={trail[0]?.y || 0}
              fill="red"
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              🔋
            </text>
          ) : (
            <text
              x={trail[0]?.x || 0}
              y={trail[0]?.y || 0}
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
