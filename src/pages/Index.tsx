import React, { useState } from 'react';
import { Shield, Play, Pause, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Chip3DEnvironment } from '../components/Chip3DEnvironment';
import { useSecureBootState } from '../hooks/useSecureBootState';
import { Z_INDEX } from '../components/zIndex';

const Index = () => {
  const [mode, setMode] = useState<'normal' | 'tampered'>('normal');
  const [showInternals, setShowInternals] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const {
    currentStage,
    isPlaying,
    totalStages,
    play,
    pause,
    nextStage,
    prevStage,
    reset,
    stageData
  } = useSecureBootState(mode, animationSpeed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm" style={{ zIndex: Z_INDEX.HEADER }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                3D Secure Boot Visualization
              </h1>
              <p className="text-gray-400 text-sm">Interactive SoC-level secure boot process with realistic chip environment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Left Panel - Controls and Information */}
      <div className="w-96 bg-gray-900/95 backdrop-blur-sm border-r border-gray-600 pt-24 overflow-y-auto">
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

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Boot Progress</h3>
            {/* Stage Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <span>Current Stage</span>
                <span>{currentStage} / {totalStages}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((currentStage / totalStages) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Current Stage</h3>
            {/* Current Stage Info */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-white font-semibold text-base mb-2">
                {stageData.name}
              </div>
              <div className="text-gray-400 text-sm leading-relaxed">
                {stageData.description}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Playback Controls</h3>
            {/* Controls */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <button
                onClick={prevStage}
                disabled={currentStage === 0}
                className="p-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>

              <button
                onClick={reset}
                className="p-3 rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Animation Speed</h3>
            {/* Speed Control */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 min-w-[50px]">Speed:</span>
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="flex-1 h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-400 min-w-[40px]">{animationSpeed}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - 3D Visualization */}
      <div className="flex-1 pt-24 relative min-h-screen">
        <div className="absolute inset-0 pt-4">
          <Chip3DEnvironment
            mode={mode}
            showInternals={showInternals}
            animationSpeed={animationSpeed}
            currentStage={currentStage}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
