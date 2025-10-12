import React, { useState, useMemo } from 'react';
import ChipModule from './ChipModule';
import ModulePopup from './ModulePopup';
import PCBTrace from './PCBTrace';
import { useSecureBootState } from '../hooks/useSecureBootState';
import { MODULES, getBootStatus, Chip3DEnvironmentProps } from './constants';
import { Z_INDEX } from './zIndex';

export const Chip3DEnvironment: React.FC<Chip3DEnvironmentProps> = ({
  mode,
  showInternals,
  animationSpeed,
  currentStage,
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { registers, memory, flags } = useSecureBootState(mode, animationSpeed);

  // Modules with active state
  const modules = useMemo(() => MODULES.map(m => {
    switch (m.id) {
      case 'pmu': return { ...m, isActive: flags.powerGood };
      case 'bootrom': return { ...m, isActive: flags.romActive };
      case 'otp': return { ...m, isActive: flags.keyLoaded };
      case 'crypto': return { ...m, isActive: currentStage >= 4 && currentStage <= 5 };
      case 'flash': return { ...m, isActive: currentStage >= 3 };
      case 'cpu': return { ...m, isActive: currentStage >= 6 };
      default: return m;
    }
  }), [flags, currentStage]);

  // Manual traces to avoid overlap
  const traces = useMemo(() => [
    { points: [{ x: 320, y: 145 }, { x: 330, y: 145 }, { x: 600, y: 145 }], type: 'power', label: 'Power', active: currentStage >= 1 },
  
  ], [currentStage, mode]);

  const bootStatus = getBootStatus(flags, mode, currentStage);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* PCB Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        zIndex: Z_INDEX.BACKGROUND
      }} />

      {/* Main PCB container */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative" style={{ width: '700px', height: '500px' }}>
          {/* PCB traces */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: Z_INDEX.PCB_TRACES }} viewBox="0 0 700 500">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {traces.map((trace, idx) => (
              <PCBTrace key={idx} points={trace.points} type={trace.type} label={trace.label} isActive={trace.active} />
            ))}
          </svg>

          {/* Chip modules */}
          <div className="absolute inset-0">
            {modules.map(module => (
              <ChipModule
                key={module.id}
                {...module}
                mode={mode}
                showInternals={showInternals}
                onClick={() => setSelectedModule(module.id)}
                currentStage={currentStage}
                registers={registers}
                memory={memory}
                flags={flags}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Module popup */}
      {selectedModule && (
        <ModulePopup
          moduleId={selectedModule}
          modules={modules}
          registers={registers}
          memory={memory}
          flags={flags}
          currentStage={currentStage}
          mode={mode}
          onClose={() => setSelectedModule(null)}
        />
      )}

      {/* Boot status overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2" style={{ zIndex: Z_INDEX.OVERLAYS }}>
        <div className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${bootStatus.color}`}>
          {bootStatus.text}
        </div>
      </div>
    </div>
  );
};
