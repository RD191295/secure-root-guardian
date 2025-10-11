import React, { useEffect, useState } from 'react';
import PCBTrace from './PCBTrace';

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

  const traces = [
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
        {/* Glow filter for moving icons */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pipeline path for animateMotion */}
          <path id="pipeline-path" d="M100,250 L700,250" fill="none" />
        </defs>

        {/* Transparent main pipeline */}
        <rect
          x="100"
          y="230"
          width="600"
          height="40"
          rx="20"
          className="fill-cyan-600/30 stroke-cyan-500 stroke-[2]"
        />

        <text
          x="400"
          y="255"
          className="fill-cyan-300 text-sm font-mono"
          textAnchor="middle"
        >
          MAIN DATA PIPELINE
        </text>

        {/* Animated icons inside pipeline */}
        {traces.map((trace, index) => {
          if (!activeTraces.includes(index)) return null;
          return (
            <text
              key={index}
              fontSize="18"
              filter="url(#glow)"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              <animateMotion dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite">
                <mpath href="#pipeline-path" />
              </animateMotion>
              {iconMap[trace.type]}
            </text>
          );
        })}

        {/* Chips */}
        <rect x="80" y="100" width="80" height="60" rx="10" className="fill-red-900 stroke-red-500" />
        <rect x="80" y="350" width="80" height="60" rx="10" className="fill-green-900 stroke-green-500" />
        <rect x="640" y="100" width="80" height="60" rx="10" className="fill-blue-900 stroke-blue-500" />
        <rect x="640" y="350" width="80" height="60" rx="10" className="fill-yellow-900 stroke-yellow-500" />

        {/* PCB Traces (fully transparent) */}
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

export default PCBSimulation;
