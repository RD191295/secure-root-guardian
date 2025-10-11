import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control' | 'key';
  label?: string;
  progress?: number;
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  progress = 0,
}) => {
  const [dotPosition, setDotPosition] = useState(0);

  // Function to get trace color by type
  const getTraceColor = () => {
    switch (type) {
      case 'power':
        return '#f87171'; // red
      case 'data':
        return '#22d3ee'; // cyan
      case 'control':
        return '#a78bfa'; // violet
      case 'key':
        return '#facc15'; // yellow
      default:
        return '#9ca3af'; // gray
    }
  };

  // 🔧 Generate segmented PCB-style path
  const generatePCBPath = (
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const offset = 30; // control how “wide” the route bends
    const midX = (from.x + to.x) / 2;
    const path = `
      M${from.x},${from.y}
      L${midX - offset},${from.y}
      L${midX - offset},${to.y}
      L${to.x},${to.y}
    `;
    return path;
  };

  const pathD = generatePCBPath(from, to);

  // Animate data symbol flow
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setDotPosition((prev) => (prev + 0.02) % 1);
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  // Hide trace when not active or completed
  if (!isActive || progress === 1) return null;

  // Symbol based on type
  const symbol =
    type === 'power' ? '⚡' : type === 'data' ? '⬤' : type === 'control' ? '🔁' : '🔑';

  return (
    <>
      {/* Hollow trace (edge only) */}
      <path
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={10}
        fill="none"
        opacity={0.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated data symbol */}
      {isActive && (
        <motion.circle
          r={10}
          fill={getTraceColor()}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Moving symbol (data packet / power icon) */}
      <circle>
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          keyTimes="0;1"
          keySplines="0.42 0 0.58 1"
          calcMode="spline"
        >
          <mpath href={`#trace-${label}`} />
        </animateMotion>
      </circle>

      <text
        x={(from.x + to.x) / 2}
        y={(from.y + to.y) / 2 - 10}
        fill={getTraceColor()}
        fontSize="14"
        textAnchor="middle"
      >
        {symbol}
      </text>
    </>
  );
};

export default PCBTrace;
