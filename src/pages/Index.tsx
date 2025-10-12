import React, { useState } from 'react';
import { Shield, Play, Pause, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Chip3DEnvironment } from '../components/Chip3DEnvironment';
import { useSecureBootState } from '../hooks/useSecureBootState';
import { Z_INDEX } from '../components/zIndex';
import PCBTrace from '../components/PCBTrace';
import { BootTimeline } from '../components/BootTimeline';
import { BootLogsPanel } from '../components/BootLogsPanel';
import { useBootLogs } from '../hooks/useBootLogs';

const Index = () => {
  const [mode, setMode] = useState<'normal' | 'tampered'>('normal');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(true);

  const {
    currentStage,
    isPlaying,
    totalStages,
    stages,
    play,
    pause,
    nextStage,
    prevStage,
    reset,
    stageData,
    goToStage
  } = useSecureBootState(mode, animationSpeed);

  // Boot logs
  const { logs, clearLogs } = useBootLogs(currentStage, mode);

  // PCB Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [pcbTraces, setPcbTraces] = useState<
    { points: { x: number; y: number }[]; type: 'power' | 'data' | 'control'; label?: string }[]
  >([]);

  const startDrawing = () => {
    setCurrentPoints([]);
    setIsDrawing(true);
  };

  const finishDrawing = (type: 'power' | 'data' | 'control', label?: string) => {
    if (currentPoints.length < 2) return;
    setPcbTraces(prev => [...prev, { points: currentPoints, type, label }]);
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPoints(prev => [...prev, { x, y }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm" style={{ zIndex: Z_INDEX.HEADER }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              3D Secure Boot Visualization
            </h1>
            <p className="text-gray-400 text-sm">Interactive SoC-level secure boot process with PCB drawing</p>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <div style={{ zIndex: Z_INDEX.TIMELINE }}>
        <BootTimeline
          currentStage={currentStage}
          totalStages={totalStages}
          stages={stages}
          onStageClick={goToStage}
          mode={mode}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel */}
        <div className="w-96 bg-gray-900/95 backdrop-blur-sm border-r border-gray-600 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Control Panel</h2>
            {/* Mode Selection */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setMode('normal')}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                  mode === 'normal'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Secure
              </button>
              <button
                onClick={() => setMode('tampered')}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                  mode === 'tampered'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Corrupted
              </button>
            </div>
          </div>

          {/* PCB Drawing Controls */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">PCB Trace Drawing</h3>
            <div className="flex space-x-2 mb-2">
              <button onClick={startDrawing} className="px-3 py-2 bg-blue-600 rounded text-white">Start Drawing</button>
              <button onClick={() => finishDrawing('power', 'Power')} className="px-3 py-2 bg-red-600 rounded text-white">Finish Power Trace</button>
              <button onClick={() => finishDrawing('data', 'Data')} className="px-3 py-2 bg-cyan-600 rounded text-white">Finish Data Trace</button>
              <button onClick={() => finishDrawing('control', 'Control')} className="px-3 py-2 bg-green-600 rounded text-white">Finish Control Trace</button>
            </div>
            <p className="text-gray-400 text-sm">Click on the canvas to add nodes while drawing.</p>
          </div>

          {/* Playback Controls */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Playback Controls</h3>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <button
                onClick={prevStage}
                disabled={currentStage === 0}
                className="p-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              <button
                onClick={isPlaying ? pause : play}
                className="p-4 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={nextStage}
                disabled={currentStage >= totalStages}
                className="p-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>

              <button
                onClick={reset}
                className="p-3 rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Right Panel */}
        <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 pt-4">
          {/* 3D Environment */}
          <Chip3DEnvironment
            mode={mode}
            showInternals={false}
            animationSpeed={animationSpeed}
            currentStage={currentStage}
          />

          {/* Overlay SVG for PCB Drawing */}
          {isDrawing && (
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-auto"
              style={{ zIndex: Z_INDEX.OVERLAYS }}
              onClick={handleCanvasClick}
              preserveAspectRatio="none"
            >
              {/* Current Drawing */}
              {currentPoints.length > 0 && (
                <PCBTrace points={currentPoints} type="data" isActive />
              )}

              {/* Visual nodes */}
              {currentPoints.map((pt, idx) => (
                <circle 
                  key={idx} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={8} 
                  fill="#ff6b35" 
                  stroke="white" 
                  strokeWidth={3}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255, 107, 53, 0.8))' }}
                />
              ))}
            </svg>
          )}

          {/* Drawn PCB Traces - always visible */}
          {pcbTraces.length > 0 && (
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: Z_INDEX.PCB_TRACES }}
              preserveAspectRatio="none"
            >
              {pcbTraces.map((trace, i) => (
                <PCBTrace key={i} points={trace.points} type={trace.type} isActive label={trace.label} />
              ))}
            </svg>
          )}
        </div>
        </div>
      </div>

      {/* Boot Logs Panel */}
      <BootLogsPanel
        logs={logs}
        isOpen={isLogsPanelOpen}
        onToggle={() => setIsLogsPanelOpen(!isLogsPanelOpen)}
        onClearLogs={clearLogs}
      />
    </div>
  );
};

export default Index;
