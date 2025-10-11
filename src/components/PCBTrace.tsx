import React, { useEffect, useState } from 'react';

interface PCBTraceProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
  label?: string;
  chipRadius?: number;
  speed?: number; // speed of moving dot
}

const PCBTrace: React.FC<PCBTraceProps> = ({
  from,
  to,
  isActive,
  type,
  label,
  chipRadius = 20,
  speed = 0.002, // fraction per frame
}) => {
  const [progress, setProgress] = useState(0);

  // Trace color
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

  // Compute L-shaped path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  const startX = from.x + ux * chipRadius;
  const startY = from.y + uy * chipRadius;
  const endX = to.x - ux * chipRadius;
  const endY = to.y - uy * chipRadius;

  const midX = startX;
  const midY = endY;
  const pathD = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

  // Dot position along L-shaped path
  const getDotPosition = (t: number) => {
    if (t < 0.5) {
      const p = t * 2;
      return { x: startX + (midX - startX) * p, y: startY + (midY - startY) * p };
    } else {
      const p = (t - 0.5) * 2;
      return { x: midX + (endX - midX) * p, y: midY + (endY - midY) * p };
    }
  };

  // Animate dot
  useEffect(() => {
    if (!isActive) return;
    let id: number;
    const animate = () => {
      setProgress((prev) => (prev + speed) % 1);
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [isActive, speed]);

  const dotPos = getDotPosition(progress);

  return (
    <g className="pcb-trace">
      {/* Stock outline */}
      <path
        d={pathD}
        stroke="#555555"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main trace */}
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

// ================= PCB Simulation =================
const PCBSimulation: React.FC = () => {
  const [activeTraces, setActiveTraces] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTraces = Array.from({ length: 4 }, (_, i) => i).filter(
        () => Math.random() > 0.4
      );
      setActiveTraces(randomTraces);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const traces: Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    type: 'power' | 'data' | 'control';
    label: string;
  }> = [
    { from: { x: 120, y: 130 }, to: { x: 300, y: 250 }, type: 'power', label: 'VCC' },
    { from: { x: 120, y: 380 }, to: { x: 300, y: 250 }, type: 'data', label: 'DATA-IN' },
    { from: { x: 680, y: 130 }, to: { x: 500, y: 250 }, type: 'control', label: 'CTRL' },
    { from: { x: 680, y: 380 }, to: { x: 500, y: 250 }, type: 'data', label: 'OUT' },
  ];

  const iconMap: Record<string, string> = {
    power: '⚡',
    data: '💾',
    control: '⚙️',
  };

  return (
    <div className="flex justify-center items-center h-[600px] bg-slate-950">
      <svg width="800" height="500" viewBox="0 0 800 500">
        {/* Pipeline rectangle */}
        <rect
          x="100"
          y="230"
          width="600"
          height="40"
          rx="20"
          fill="cyan"
          fillOpacity={0.2}
          stroke="cyan"
          strokeWidth={2}
        />
        <text
          x="400"
          y="255"
          className="fill-cyan-300 text-sm font-mono"
          textAnchor="middle"
        >
          MAIN DATA PIPELINE
        </text>

        {/* Pipeline moving icons */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path id="pipeline-path" d="M100,250 L700,250" fill="none" />
        </defs>

        {traces.map((trace, index) => {
          if (!activeTraces.includes(index)) return null;
          return (
            <text
              key={index}
              fontSize="20"
              filter="url(#glow)"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              <animateMotion dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite">
                <mpath xlinkHref="#pipeline-path" />
              </animateMotion>
              {iconMap[trace.type]}
            </text>
          );
        })}

        {/* Chips */}
        <rect x="80" y="100" width="80" height="60" rx="10" fill="#f87171" stroke="#ef4444" />
        <rect x="80" y="350" width="80" height="60" rx="10" fill="#34d399" stroke="#10b981" />
        <rect x="640" y="100" width="80" height="60" rx="10" fill="#60a5fa" stroke="#3b82f6" />
        <rect x="640" y="350" width="80" height="60" rx="10" fill="#facc15" stroke="#eab308" />

        {/* PCB Traces */}
        {traces.map((trace, index) => (
          <PCBTrace
            key={index}
            from={trace.from}
            to={trace.to}
            isActive={activeTraces.includes(index)}
            type={trace.type}
            label={trace.label}
            chipRadius={25}
          />
        ))}
      </svg>
    </div>
  );
};

export default PCBTRACE;
