import React, { useState, useEffect } from 'react';
import PCBTrace from './PCBTrace';

interface Trace {
  points: { x: number; y: number }[];
  type: 'power' | 'data' | 'control';
  label?: string;
  isActive: boolean;
}

const gridSize = 20; // for snap-to-grid

const snapToGrid = (x: number, y: number) => ({
  x: Math.round(x / gridSize) * gridSize,
  y: Math.round(y / gridSize) * gridSize,
});

const PCBSimulation: React.FC = () => {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load saved traces
  useEffect(() => {
    const saved = localStorage.getItem('customPCBTraces');
    if (saved) setTraces(JSON.parse(saved));
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPoints((prev) => [...prev, snapToGrid(x, y)]);
    setIsDrawing(true);
  };

  const finishTrace = (type: 'power' | 'data' | 'control', label?: string) => {
    if (currentPoints.length < 2) return;
    const newTrace: Trace = { points: currentPoints, type, label, isActive: true };
    const updatedTraces = [...traces, newTrace];
    setTraces(updatedTraces);
    localStorage.setItem('customPCBTraces', JSON.stringify(updatedTraces));
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  const clearAll = () => {
    setTraces([]);
    setCurrentPoints([]);
    localStorage.removeItem('customPCBTraces');
  };

  return (
    <div className="flex flex-col items-center h-[600px] bg-slate-950 p-4">
      <div className="mb-4 space-x-2">
        <button
          onClick={() => finishTrace('power', 'Power')}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Finish Power Trace
        </button>
        <button
          onClick={() => finishTrace('data', 'Data')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Finish Data Trace
        </button>
        <button
          onClick={() => finishTrace('control', 'Control')}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Finish Control Trace
        </button>
        <button onClick={clearAll} className="px-4 py-2 bg-gray-600 text-white rounded">
          Clear All
        </button>
      </div>

      <svg
        width="800"
        height="500"
        viewBox="0 0 800 500"
        className="border border-gray-700"
        onClick={handleCanvasClick}
      >
        {/* Optional grid */}
        {Array.from({ length: 41 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * gridSize}
            y1={0}
            x2={i * gridSize}
            y2={500}
            stroke="#333"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: 26 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * gridSize}
            x2={800}
            y2={i * gridSize}
            stroke="#333"
            strokeWidth={0.5}
          />
        ))}

        {/* Existing traces */}
        {traces.map((trace, idx) => (
          <PCBTrace
            key={idx}
            points={trace.points}      // Use points array
            isActive={trace.isActive}
            type={trace.type}
            label={trace.label}
          />
        ))}

        {/* Currently drawing trace */}
        {isDrawing && currentPoints.length > 1 && (
          <PCBTrace points={currentPoints} isActive type="data" />
        )}

        {/* Node indicators */}
        {currentPoints.map((pt, idx) => (
          <circle key={idx} cx={pt.x} cy={pt.y} r={4} fill="orange" />
        ))}
      </svg>
    </div>
  );
};

export default PCBSimulation;
