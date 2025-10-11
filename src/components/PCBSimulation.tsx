import React, { useState, useEffect } from 'react';
import PCBTrace from './PCBTrace';

const PCBSimulation: React.FC = () => {
  const traces = [
    { from: { x: 120, y: 130 }, to: { x: 300, y: 250 }, type: 'power', label: 'VCC' },
    { from: { x: 120, y: 380 }, to: { x: 300, y: 250 }, type: 'data', label: 'DATA-IN' },
    { from: { x: 680, y: 130 }, to: { x: 500, y: 250 }, type: 'control', label: 'CTRL' },
    { from: { x: 680, y: 380 }, to: { x: 500, y: 250 }, type: 'data', label: 'OUT' },
  ];

  const [activeTraces, setActiveTraces] = useState<number[]>([0,1,2,3]);

  // Optional: random activation to simulate “data passing” intermittently
  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = Array.from({ length: traces.length }, (_,i) => i).filter(() => Math.random()>0.3);
      setActiveTraces(newActive.length ? newActive : [0]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center h-[600px] bg-slate-950">
      <svg width="800" height="500" viewBox="0 0 800 500">
        {/* Chips */}
        <rect x="80" y="100" width="80" height="60" rx="10" fill="#f87171" stroke="#ef4444" />
        <rect x="80" y="350" width="80" height="60" rx="10" fill="#34d399" stroke="#10b981" />
        <rect x="640" y="100" width="80" height="60" rx="10" fill="#60a5fa" stroke="#3b82f6" />
        <rect x="640" y="350" width="80" height="60" rx="10" fill="#facc15" stroke="#eab308" />

        {/* PCB traces */}
        {traces.map((trace,i)=>(
          <PCBTrace
            from={trace.from}
            to={trace.to}
            isActive={true}
            type={trace.type}
            label={trace.label}
            dotCount={3}
            progress={traceStage[i]} // 0 = ongoing, 1 = complete
          />
        ))}
      </svg>
    </div>
  );
};

export default PCBSimulation;
