import React, { useState, useMemo } from 'react';
import ChipModule from './ChipModule';
import ModulePopup from './ModulePopup';
import PCBTrace from './PCBTrace';
import DataFlowParticle from './DataFlowParticle';
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

  // Comprehensive traces showing module interactions
  const traces = useMemo(() => [
    // Power traces (Stage 0-1: Power distribution)
    { points: [{ x: 110, y: 140 }, { x: 320, y: 140 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    { points: [{ x: 320, y: 130 }, { x: 480, y: 130 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    { points: [{ x: 480, y: 130 }, { x: 600, y: 130 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    { points: [{ x: 320, y: 150 }, { x: 340, y: 150 }, { x: 340, y: 400 }, { x: 400, y: 400 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    { points: [{ x: 110, y: 500 }, { x: 110, y: 400 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    { points: [{ x: 670, y: 490 }, { x: 670, y: 400 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },

    // Stage 1-2: ROM to OTP communication (key retrieval)
    { points: [{ x: 670, y: 150 }, { x: 670, y: 280 }, { x: 670, y: 400 }], type: 'control' as const, label: 'KEY_REQ', active: currentStage >= 2 && currentStage <= 3 },
    
    // Stage 2-3: OTP responds with key data
    { points: [{ x: 650, y: 150 }, { x: 650, y: 280 }, { x: 650, y: 400 }], type: 'data' as const, label: 'KEY_DATA', active: currentStage >= 2 && currentStage <= 3 },

    // Stage 3: Flash to CPU (bootloader load)
    { points: [{ x: 145, y: 490 }, { x: 280, y: 490 }, { x: 280, y: 430 }, { x: 320, y: 430 }], type: 'data' as const, label: 'BOOT_DATA', active: currentStage >= 3 && currentStage <= 4 },
    { points: [{ x: 400, y: 430 }, { x: 280, y: 430 }, { x: 280, y: 510 }, { x: 145, y: 510 }], type: 'control' as const, label: 'FLASH_RD', active: currentStage >= 3 && currentStage <= 4 },

    // Stage 4: Crypto verification
    // ROM to Crypto: send public key
    { points: [{ x: 600, y: 450 }, { x: 540, y: 450 }, { x: 540, y: 280 }, { x: 480, y: 280 }, { x: 480, y: 150 }], type: 'data' as const, label: 'PUB_KEY', active: currentStage >= 4 && currentStage <= 5 },
    // Flash to Crypto: send signature
    { points: [{ x: 145, y: 450 }, { x: 200, y: 450 }, { x: 200, y: 280 }, { x: 320, y: 280 }, { x: 320, y: 230 }], type: 'data' as const, label: 'SIGNATURE', active: currentStage >= 4 && currentStage <= 5 },
    // Crypto to ROM: verification result
    { points: [{ x: 400, y: 180 }, { x: 520, y: 180 }, { x: 520, y: 400 }], type: 'control' as const, label: mode === 'tampered' ? 'VERIFY_FAIL' : 'VERIFY_OK', active: currentStage === 5 },

    // Stage 6-7: CPU active, running code
    { points: [{ x: 400, y: 400 }, { x: 450, y: 400 }, { x: 450, y: 320 }], type: 'control' as const, label: 'EXEC', active: currentStage >= 6 },
    { points: [{ x: 320, y: 320 }, { x: 280, y: 320 }, { x: 280, y: 560 }, { x: 110, y: 560 }], type: 'data' as const, label: mode === 'tampered' ? 'SAFE_MODE' : 'OS_DATA', active: currentStage >= 6 },
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
            
            {/* Draw all traces */}
            {traces.map((trace, idx) => {
              // Generate path string for data flow particles
              const points = trace.points;
              let pathD = `M ${points[0].x},${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const midX = (prev.x + curr.x) / 2;
                const midY = (prev.y + curr.y) / 2;
                pathD += ` Q ${midX},${midY} ${curr.x},${curr.y}`;
              }
              
              return (
                <g key={idx}>
                  <PCBTrace points={trace.points} type={trace.type} label={trace.label} isActive={trace.active} />
                  
                  {/* Animated data flow particles for active data/control traces */}
                  {trace.active && trace.type !== 'power' && (
                    <>
                      <DataFlowParticle 
                        path={pathD} 
                        duration={2} 
                        delay={0} 
                        color={trace.type === 'data' ? '#00ffff' : '#ffff00'} 
                      />
                      <DataFlowParticle 
                        path={pathD} 
                        duration={2} 
                        delay={0.5} 
                        color={trace.type === 'data' ? '#00ffff' : '#ffff00'} 
                      />
                      <DataFlowParticle 
                        path={pathD} 
                        duration={2} 
                        delay={1} 
                        color={trace.type === 'data' ? '#00ffff' : '#ffff00'} 
                      />
                    </>
                  )}
                </g>
              );
            })}
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
