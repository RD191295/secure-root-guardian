import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
  dotCount?: number;
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
  dotCount = 5,
}) => {
  const [dots, setDots] = useState<number[]>([]);
  const [dotSymbols, setDotSymbols] = useState<string[]>([]);
  const [dotSpeeds, setDotSpeeds] = useState<number[]>([]);

  useEffect(() => {
    setDots(Array.from({ length: dotCount }, (_, i) => i / dotCount));
    setDotSymbols(
      Array.from({ length: dotCount }, () =>
        type === 'power'
          ? '⚡'
          : type === 'control'
          ? '⚙️'
          : String(Math.floor(Math.random() * 10))
      )
    );
    setDotSpeeds(
      Array.from({ length: dotCount }, () =>
        type === 'power' ? 0.015 : type === 'control' ? 0.01 : 0.008
      )
    );
  }, [dotCount, type]);

  const getColor = () => {
    switch (type) {
      case 'power': return 'red';
      case 'data': return 'cyan';
      case 'control': return 'yellow';
      default: return 'gray';
    }
  };

  // Bezier curve control point for smooth curve
  const ctrlX = (from.x + to.x) / 2;
  const ctrlY = from.y;

  const getDotCoord = (t: number) => {
    const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * ctrlX + t * t * to.x;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * ctrlY + t * t * to.y;
    return { x, y };
  };

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setDots(prev => prev.map((p, i) => (p + dotSpeeds[i]) % 1));
    }, 16);
    return () => clearInterval(interval);
  }, [isActive, dotSpeeds]);

  const labelX = (from.x + to.x) / 2;
  const labelY = (from.y + to.y) / 2;

  return (
    <g>
      {/* Big semi-transparent trace “pipe” */}
      <path
        d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
        stroke={getColor()}
        strokeWidth={20}        // BIG trace width
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.2}           // semi-transparent to show the pipeline
      />

      {/* Hollow edge outline */}
      <path
        d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
        stroke={getColor()}
        strokeWidth={6}         // thin outline
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Moving data packets inside trace */}
      {isActive && dots.map((t, i) => {
        const { x, y } = getDotCoord(t);
        return (
          <text
            key={i}
            x={x}
            y={y + 5}
            fontSize={16}           // slightly bigger packet inside bigger trace
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={getColor()}
            opacity={0.6 + 0.4 * Math.sin(t * Math.PI)} // fade effect
          >
            {dotSymbols[i]}
          </text>
        );
      })}

      {/* Label */}
      {label && (
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
