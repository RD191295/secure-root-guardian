import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
  speed?: number; // speed of the moving dot
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
  speed = 0.01, // fraction per frame
}) => {
  const [progress, setProgress] = useState(0);

  // Trace color based on type
  const getTraceColor = () => {
    switch (type) {
      case 'power':
        return 'red';
      case 'data':
        return 'cyan';
      case 'control':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  // L-shaped path: horizontal → vertical
  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  // Use simple linear interpolation for moving dot along L-shape
  const getDotPosition = (t: number) => {
    if (t < 0.5) {
      const p = t * 2; // first segment
      return {
        x: startX + (midX - startX) * p,
        y: startY + (midY - startY) * p,
      };
    } else {
      const p = (t - 0.5) * 2; // second segment
      return {
        x: midX + (endX - midX) * p,
        y: midY + (endY - midY) * p,
      };
    }
  };

  // Animate the moving dot
  useEffect(() => {
    if (!isActive) return;

    const id = requestAnimationFrame(function animate() {
      setProgress((prev) => (prev + speed) % 1);
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(id);
  }, [isActive, speed]);

  const dotPos = getDotPosition(progress);

  return (
    <g className="pcb-trace">
      {/* Stock outline */}
      <path
        d={pathD}
        stroke="#CCCCCC"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main hollow trace */}
      <path
        d={pathD}
        stroke={getTraceColor()}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Moving dot */}
      {isActive && (
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r={6}
          fill={getTraceColor()}
          className="animate-ping opacity-50"
        />
      )}

      {/* Optional label */}
      {label && (
        <text
          x={(startX + endX) / 2}
          y={(startY + endY) / 2 - 15}
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
