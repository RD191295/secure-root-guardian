import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;           // true → simulation running and trace visible
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
  dotCount?: number;
  stageComplete?: boolean;     // true → hide trace completely
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
  dotCount = 5,
  stageComplete = false,
}) => {
  const [dots, setDots] = useState<number[]>([]);
  const [dotSymbols, setDotSymbols] = useState<string[]>([]);
  const [dotSpeeds, setDotSpeeds] = useState<number[]>([]);
  const [opacity, setOpacity] = useState(1); // for fade-out

  // Initialize moving dots
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

  const ctrlX = (from.x + to.x) / 2;
  const ctrlY = from.y;

  const getDotCoord = (t: number) => {
    const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * ctrlX + t * t * to.x;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * ctrlY + t * t * to.y;
    return { x, y };
  };

  // Animate dots if active and stage not complete
  useEffect(() => {
    if (!isActive || stageComplete) return;
    const interval = setInterval(() => {
      setDots(prev => prev.map((p, i) => (p + dotSpeeds[i]) % 1));
    }, 16);
    return () => clearInterval(interval);
  }, [isActive, dotSpeeds, stageComplete]);

  // Fade-out effect when stage completes
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

  // Hide completely if fully faded
  if (!isActive && !stageComplete && opacity <= 0) return null;

  return (
    <g opacity={opacity}>
      {/* Big semi-transparent pipeline */}
      <path
        d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
        stroke={getColor()}
        strokeWidth={20}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.2}
      />

      {/* Hollow trace outline */}
      <path
        d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
        stroke={getColor()}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Moving symbols inside trace */}
      {dots.map((t, i) => {
        const { x, y } = getDotCoord(t);
        return (
          <text
            key={i}
            x={x}
            y={y + 5}
            fontSize={16}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={getColor()}
            opacity={0.6 + 0.4 * Math.sin(t * Math.PI)}
          >
            {dotSymbols[i]}
          </text>
        );
      })}

      {/* Optional label */}
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
