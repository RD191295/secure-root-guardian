import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import PCBTrace from "./PCBTrace";

const PCBSimulation: React.FC = () => {
  const traces = [
    {
      from: { x: 120, y: 130 },
      to: { x: 300, y: 250 },
      type: "power",
      label: "VCC",
      payload: "power",
    },
    {
      from: { x: 120, y: 380 },
      to: { x: 300, y: 250 },
      type: "data",
      label: "DATA-IN",
      payload: "data",
    },
    {
      from: { x: 680, y: 130 },
      to: { x: 500, y: 250 },
      type: "control",
      label: "CTRL",
      payload: "key",
    },
    {
      from: { x: 680, y: 380 },
      to: { x: 500, y: 250 },
      type: "data",
      label: "OUT",
      payload: "data",
    },
  ];

  const [isPlaying, setIsPlaying] = useState(false);
  const [traceStages, setTraceStages] = useState([false, false, false, false]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  // Sequential stage control
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
      } else {
        clearInterval(interval);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center h-[600px] bg-slate-950 p-4">
      <button
        onClick={isPlaying ? pause : play}
        className="p-4 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors mb-4"
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>

      <svg width="800" height="500" viewBox="0 0 800 500">
        {/* Chips */}
        <rect x="80" y="100" width="80" height="60" rx="10" fill="#f87171" />
        <rect x="80" y="350" width="80" height="60" rx="10" fill="#34d399" />
        <rect x="640" y="100" width="80" height="60" rx="10" fill="#60a5fa" />
        <rect x="640" y="350" width="80" height="60" rx="10" fill="#facc15" />

        {/* Traces */}
        {traces.map((trace, i) => (
          <PCBTrace
            key={i}
            from={trace.from}
            to={trace.to}
            isActive={isPlaying && !traceStages[i]}
            stageComplete={traceStages[i]}
            type={trace.type}
            label={trace.label}
            payload={trace.payload as any}
          />
        ))}
      </svg>
    </div>
  );
};

export default PCBSimulation;
