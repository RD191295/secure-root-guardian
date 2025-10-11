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
}) => {
  const [dots, setDots] = useState<number[]>([]);
  const [opacity, setOpacity] = useState(1);

  // Initialize moving arrows positions (t = 0-1)
  useEffect(() => {
    setDots(Array.from({ length: dotCount }, (_, i) => i / dotCount));
  }, [dotCount]);

  // Animate dots
  useEffect(() => {
    if (!isActive || stageComplete) return;
    const interval = setInterval(() => {
      setDots(prev => prev.map(p => (p + 0.01) % 1));
    }, 16);
    return () => clearInterval(interval);
  }, [isActive, stageComplete]);

  // Fade out after stage completes
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

  // Hide completely if not active and not fading
  if (!isActive && !stageComplete) return null;

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

  // Get coordinates along a quadratic curve
  const getCoord = (t: number) => {
    const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * ctrlX + t * t * to.x;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * ctrlY + t * t * to.y;
    return { x, y };
  };

  // Small arrow symbol
  const arrowSymbol = '▶';

  return (
    <g opacity={opacity}>
      {/* Trace path */}
      <path
        d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
        stroke={getColor()}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Flow arrows along trace */}
      {dots.map((t, i) => {
        const { x, y } = getCoord(t);
        return (
          <text
            key={i}
            x={x}
            y={y + 4} // adjust vertical alignment
            fontSize={14}
            fill={getColor()}
            textAnchor="middle"
            alignmentBaseline="middle"
            opacity={0.7}
          >
            {arrowSymbol}
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
