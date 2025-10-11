import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import PCBTrace from "./PCBTrace";

const PCBSimulation: React.FC = () => {
  const traces = [
    {
      path: [
        { x: 120, y: 130 },
        { x: 200, y: 130 },
        { x: 200, y: 250 },
        { x: 300, y: 250 },
      ],
      type: "power",
      label: "VCC",
      payload: "power",
    },
    {
      path: [
        { x: 120, y: 380 },
        { x: 250, y: 380 },
        { x: 250, y: 250 },
        { x: 300, y: 250 },
      ],
      type: "data",
      label: "DATA-IN",
      payload: "data",
    },
    {
      path: [
        { x: 680, y: 130 },
        { x: 500, y: 130 },
        { x: 500, y: 250 },
      ],
      type: "control",
      label: "CTRL",
      payload: "key",
    },
  ];

  const [isPlaying, setIsPlaying] = useState(false);
  const [traceStages, setTraceStages] = useState([false, false, false]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  useEffect(() => {
    if (!isPlaying) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < traces.length) {
        setTraceStages((prev) => {
          const newStages = [...prev];
          newStages[i] = true;
          return newStages;
        });
        i++;
      } else clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center h-[600px] bg-slate-950 p-4">
      <button
        onClick={isPlaying ? pause : play}
        className="p-4 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors mb-4"
      >
        {isPlaying ? <Pause /> : <Play />}
      </button>

      <svg width="800" height="500" viewBox="0 0 800 500">
        {/* Example chips */}
        <rect x="80" y="100" width="80" height="60" rx="10" fill="#f87171" />
        <rect x="80" y="350" width="80" height="60" rx="10" fill="#34d399" />
        <rect x="640" y="100" width="80" height="60" rx="10" fill="#60a5fa" />

        {traces.map((trace, i) => (
          <PCBTrace
            key={i}
            path={trace.path}
            type={trace.type}
            label={trace.label}
            isActive={isPlaying && !traceStages[i]}
            stageComplete={traceStages[i]}
            payload={trace.payload}
          />
        ))}
      </svg>
    </div>
  );
};

export default PCBSimulation;
