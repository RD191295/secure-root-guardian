import React, { useEffect, useState } from 'react';
import PCBTrace from './PCBTrace';

const PCBSimulation: React.FC = () => {
  const [activeTraces, setActiveTraces] = useState<number[]>([]);

  // Simulate random data activation every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTraces = Array.from({ length: 3 }, (_, i) => i).filter(() =>
        Math.random() > 0.4
      );
      setActiveTraces(randomTraces);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center h-[600px] bg-slate-950">
      <svg width="800" height="500" viewBox="0 0 800 500">
        {/* === Main Data Bus (pipeline) === */}
        <rect
          x="100"
          y="230"
          width="600"
          height="40"
          rx="20"
          className="fill-slate-800 stroke-cyan-600 stroke-[2]"
        />
        <text
          x="400"
          y="255"
          className="fill-cyan-300 text-sm font-mono"
          textAnchor="middle"
        >
          MAIN DATA PIPELINE
        </text>

        {/* Animated pulse traveling along pipeline */}
        <circle r="8" fill="#22d3ee">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M100,250 L700,250"
          />
        </circle>

        {/* === Example chips === */}
        {/* Left chips sending data to pipeline */}
        <rect x="80" y="100" width="80" height="60" rx="10" className="fill-red-900 stroke-red-500" />
        <rect x="80" y="350" width="80" height="60" rx="10" className="fill-green-900 stroke-green-500" />

        {/* Right chips receiving data */}
        <rect x="640" y="100" width="80" height="60" rx="10" className="fill-blue-900 stroke-blue-500" />
        <rect x="640" y="350" width="80" height="60" rx="10" className="fill-yellow-900 stroke-yellow-500" />

        {/* === PCB traces connecting to pipeline === */}
        <PCBTrace
          from={{ x: 120, y: 130 }}
          to={{ x: 300, y: 250 }}
          isActive={activeTraces.includes(0)}
          type="power"
          label="VCC"
          chipRadius={25}
        />

        <PCBTrace
          from={{ x: 120, y: 380 }}
          to={{ x: 300, y: 250 }}
          isActive={activeTraces.includes(1)}
          type="data"
          label="DATA-IN"
          chipRadius={25}
        />

        <PCBTrace
          from={{ x: 680, y: 130 }}
          to={{ x: 500, y: 250 }}
          isActive={activeTraces.includes(2)}
          type="control"
          label="CTRL"
          chipRadius={25}
        />

        <PCBTrace
          from={{ x: 680, y: 380 }}
          to={{ x: 500, y: 250 }}
          isActive={activeTraces.includes(3)}
          type="data"
          label="OUT"
          chipRadius={25}
        />
      </svg>
    </div>
  );
};

export default PCBSimulation;
