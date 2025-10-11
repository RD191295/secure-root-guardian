import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
  dotCount?: number;
  speed?: number;
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
  dotCount = 5,
  speed = 0.01,
}) => {
  const [dots, setDots] = useState<number[]>([]);
  const [dotSymbols, setDotSymbols] = useState<string[]>([]);

  // Initialize dot positions and symbols
  useEffect(() => {
    setDots(Array.from({ length: dotCount }, (_, i) => i / dotCount));
    const symbols = Array.from({ length: dotCount }, () =>
      type === 'power'
        ? '⚡'
        : type === 'control'
        ? '⚙️'
        : String(Math.floor(Math.random() * 10))
    );
    setDotSymbols(symbols);
  }, [dotCount, type]);

  const getColor = () => {
    switch (type) {
      case 'power': return 'red';
      case 'data': return 'cyan';
      case 'control': return 'yellow';
      default: return 'gray';
    }
  };

  // Compute L-shaped path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx*dx + dy*dy);
  const ux = dx / length;
  const uy = dy / length;

  const startX = from.x + ux*chipRadius;
  const startY = from.y + uy*chipRadius;
  const endX = to.x - ux*chipRadius;
  const endY = to.y - uy*chipRadius;

  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  const getDotCoord = (t: number) => {
    if (t < 0.5) {
      const p = t*2;
      return { x: startX + (midX - startX)*p, y: startY + (midY - startY)*p };
    } else {
      const p = (t-0.5)*2;
      return { x: midX + (endX - midX)*p, y: midY + (endY - midY)*p };
    }
  };

  // Animate dots
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setDots(prev => prev.map(p => (p + speed) % 1));
    }, 16);
    return () => clearInterval(interval);
  }, [isActive, speed]);

  const labelX = (startX + endX)/2;
  const labelY = (startY + endY)/2;

  return (
    <g className="pcb-trace">
      {/* Hollow trace */}
      <path
        d={pathD}
        stroke="#555555"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Moving symbols */}
      {isActive && dots.map((t,i) => {
        const {x, y} = getDotCoord(t);
        return (
          <text
            key={i}
            x={x}
            y={y+5}
            fontSize={14}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={getColor()}
          >
            {dotSymbols[i]}
          </text>
        );
      })}

      {/* Label */}
      {label && (
        <text
          x={labelX}
          y={labelY-15}
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
