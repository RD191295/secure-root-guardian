import React, { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import PCBTrace from "./PCBTrace";

const PCBSimulation: React.FC = () => {
  // Example: define 6 chips and traces that use multi-turn routing (waypoints)
  const traces = [
    {
      id: "t1",
      path: [
        { x: 120, y: 130 },
        { x:  5,  y: 230},
        { x:  5,  y: 320},
        { x: 110, y: 410},
        { x: 200, y: 130 },
        { x: 200, y: 200 },
        { x: 300, y: 200 },
      ],
      type: "power",
      label: "VCC",
      payload: "power" as const,
    },
    {
      id: "t2",
      path: [
        { x: 120, y: 380 },
        { x: 250, y: 380 },
        { x: 250, y: 250 },
        { x: 300, y: 250 },
      ],
      type: "data",
      label: "DATA-IN",
      payload: "data" as const,
    },
    {
      id: "t3",
      path: [
        { x: 680, y: 130 },
        { x: 560, y: 130 },
        { x: 560, y: 200 },
        { x: 450, y: 200 },
      ],
      type: "control",
      label: "CTRL",
      payload: "key" as const,
    },
    {
      id: "t4",
      path: [
        { x: 680, y: 380 },
        { x: 560, y: 380 },
        { x: 560, y: 250 },
        { x: 450, y: 250 },
      ],
      type: "data",
      label: "OUT",
      payload: "data" as const,
    },
    {
      id: "t5",
      path: [
        { x: 300, y: 200 },
        { x: 350, y: 160 },
        { x: 450, y: 180 },
      ],
      type: "key",
      label: "KEY",
      payload: "key" as const,
    },
    {
      id: "t6",
      path: [
        { x: 300, y: 250 },
        { x: 350, y: 300 },
        { x: 450, y: 280 },
      ],
      type: "data",
      label: "DATA-2",
      payload: "data" as const,
    },
  ];

  const [isPlaying, setIsPlaying] = useState(false);
  const [traceStages, setTraceStages] = useState<boolean[]>(
    () => Array(traces.length).fill(false)
  );

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  // simple sequential stage progression when playing
  useEffect(() => {
    if (!isPlaying) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < traces.length) {
        setTraceStages((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        i++;
      } else {
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying, traces.length]);

  return (
    <div className="flex flex-col items-center h-[700px] bg-slate-950 p-4">
      <button
        onClick={isPlaying ? pause : play}
        className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors mb-4"
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>

      <svg width="900" height="600" viewBox="0 0 900 600">
        {/* Chips (example positions) */}
        <rect x="80" y="120" width="80" height="60" rx="8" fill="#f87171" />
        <rect x="80" y="360" width="80" height="60" rx="8" fill="#34d399" />
        <rect x="640" y="120" width="80" height="60" rx="8" fill="#60a5fa" />
        <rect x="640" y="360" width="80" height="60" rx="8" fill="#facc15" />
        <rect x="340" y="140" width="80" height="60" rx="8" fill="#a78bfa" />
        <rect x="340" y="280" width="80" height="60" rx="8" fill="#f472b6" />

        {/* Traces */}
        {traces.map((t, i) => (
          <PCBTrace
            key={t.id}
            id={t.id}
            path={t.path}
            type={t.type}
            isActive={isPlaying && !traceStages[i]}
            label={t.label}
            dotCount={4}
            stageComplete={traceStages[i]}
            payload={t.payload}
          />
        ))}
      </svg>
    </div>
  );
};

export default PCBSimulation;
