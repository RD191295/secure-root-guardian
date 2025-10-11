import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
  dotCount?: number;
  stageComplete?: boolean;
  payload?: 'key' | 'data' | 'power'; // optional content type
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
  dotCount = 3,
  stageComplete = false,
  payload,
}) => {
  const [dots, setDots] = useState<number[]>([]);
  const [dotSymbols, setDotSymbols] = useState<string[]>([]);
  const [dotSpeeds, setDotSpeeds] = useState<number[]>([]);
  const [opacity, setOpacity] = useState(1);

  // Initialize moving packet positions and symbols
  useEffect(() => {
    setDots(Array.from({ length: dotCount }, (_, i) => i / dotCount));

    // Set symbol based on payload or type
    setDotSymbols(
      Array.from({ length: dotCount }, () => {
        if (payload === 'key') return '🔑';
        if (type === 'power') return '⚡';
        if (type === 'control') return '⚙️';
        if (type === 'data') return String(Math.floor(Math.random() * 10));
        return '?';
      })
    );

    setDotSpeeds(
      Array.from({ length: dotCount }, () =>
        type === 'power' ? 0.015 : type === 'control' ? 0.01 : 0.008
      )
    );
  }, [dotCount, type, payload]);

  // Update numbers for data packets dynamically
  useEffect(() => {
    if (!isActive || stageComplete || type !== 'data') return;
    const interval = setInterval(() => {
      setDotSymbols(prev => prev.map(s => (payload === 'key' ? '🔑' : type === 'data' ? String(Math.floor(Math.random() * 10)) : s)));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, stageComplete, type, payload]);

  const getColor = () => {
    switch (type) {
      case 'power': return 'red';
      case 'data': return 'cyan';
      case 'control': return 'yellow';
      default: return 'gray';
    }
  };

  const ctrlX = (from.x + to.x) / 2;
  const ctrlY = from.y;

  const getCoord = (t: number) => {
    const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * ctrlX + t * t * to.x;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * ctrlY + t * t * to.y;
    return { x, y };
  };

  // Animate packets
  useEffect(() => {
    if (!isActive || stageComplete) return;
    const interval = setInterval(() => {
      setDots(prev => prev.map((p, i) => (p + dotSpeeds[i]) % 1));
    }, 16);
    return () => clearInterval(interval);
  }, [isActive, dotSpeeds, stageComplete]);

  // Fade out
  useEffect(() => {
    if (!stageComplete) {
      setOpacity(1);
      return;
    }
    let animFrame: number;
    const fade = () => {
      setOpacity(prev => {
        if (prev <= 0) return 0;
        animFrame = requestAnimationFrame(fade);
        return prev - 0.02;
      });
    };
    fade();
    return () => cancelAnimationFrame(animFrame);
  }, [stageComplete]);

  if (!isActive && !stageComplete) return null;

  const getPacketSize = () => (type === 'power' || payload === 'key' ? 20 : type === 'control' ? 16 : 12);

  return (
    <g opacity={opacity}>
      {/* Trace path */}
      <path
        d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
        stroke={getColor()}
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data packets */}
      {dots.map((t, i) => {
        const { x, y } = getCoord(t);
        return (
          <text
            key={i}
            x={x}
            y={y + 4}
            fontSize={getPacketSize()}
            fill={getColor()}
            textAnchor="middle"
            alignmentBaseline="middle"
            opacity={0.8}
          >
            {dotSymbols[i]}
          </text>
        );
      })}

      {/* Label */}
      {label && (
        <text
          x={(from.x + to.x) / 2}
          y={(from.y + to.y) / 2 - 15}
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
