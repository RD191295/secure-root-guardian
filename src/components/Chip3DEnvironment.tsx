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

  const traces = useMemo(() => {
    const getModuleCenter = (id: string) => {
      const mod = modules.find(m => m.id === id);
      if (!mod) return { x: 0, y: 0 };
      return {
        x: mod.position.x + mod.size.width/2,
        y: mod.position.y + mod.size.height/2
      };
    };

    return [
      { from: 'pmu', to: 'bootrom', active: currentStage >= 1, type: 'power' as const, label: 'Power' },
      { from: 'pmu', to: 'otp', active: currentStage >= 1, type: 'power' as const, label: 'Power' },
      { from: 'pmu', to: 'crypto', active: currentStage >= 1, type: 'power' as const, label: 'Power' },
      { from: 'pmu', to: 'flash', active: currentStage >= 1, type: 'power' as const, label: 'Power' },
      { from: 'pmu', to: 'cpu', active: currentStage >= 1, type: 'power' as const, label: 'Power' },

      { from: 'bootrom', to: 'otp', active: currentStage === 2, type: 'control' as const, label: 'Key Request' },
      { from: 'otp', to: 'crypto', active: currentStage === 4, type: 'data' as const, label: 'Public Key' },
      { from: 'flash', to: 'bootrom', active: currentStage === 3, type: 'data' as const, label: 'Bootloader' },
      { from: 'bootrom', to: 'crypto', active: currentStage === 4, type: 'data' as const, label: 'Hash+Sig' },
      { from: 'crypto', to: 'bootrom', active: currentStage === 5, type: 'control' as const, label: mode === 'tampered' ? 'FAIL' : 'PASS' },
      { from: 'bootrom', to: 'cpu', active: currentStage >= 6 && mode === 'normal', type: 'control' as const, label: 'Boot' },
    ].map(t => ({
      ...t,
      from: getModuleCenter(t.from),
      to: getModuleCenter(t.to)
    }));
  }, [modules, currentStage, mode]);

  const bootStatus = getBootStatus(flags, mode, currentStage);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* PCB Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        zIndex: Z_INDEX.BACKGROUND
      }} />

      {/* Main PCB Container */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative" style={{ width: '700px', height: '500px' }}>
          {/* SVG Layer for PCB Traces */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', zIndex: Z_INDEX.PCB_TRACES }}
            viewBox="0 0 700 500"
          >
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
              <PCBTrace
                key={idx}
                from={trace.from}
                to={trace.to}
                isActive={trace.active}
                type={trace.type}
                label={trace.label}
              />
            ))}
          </svg>

          {/* Chip Modules Layer */}
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

      {/* Module Popup */}
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

      {/* Boot Status */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2" style={{ zIndex: Z_INDEX.OVERLAYS }}>
        <div className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${bootStatus.color}`}>
          {bootStatus.text}
        </div>
      </div>
    </div>
  );
};
