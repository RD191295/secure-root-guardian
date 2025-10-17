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

  // Precise traces connecting chip edges
  // Actual module positions: PMU(5,50,210x180), Crypto(320,50,160x180), OTP(600,50,140x180)
  // Flash(5,400,140x190), CPU(320,320,160x180), ROM(600,400,140x180)
  const traces = useMemo(() => [
    // ===== POWER DISTRIBUTION (Stage 1+) =====
    // PMU right edge (215,140) → Crypto left edge (320,140)
    { points: [{ x: 215, y: 140 }, { x: 320, y: 140 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    
    // PMU bottom (110,230) → Flash top (75,400)
    { points: [{ x: 110, y: 230 }, { x: 110, y: 350 }, { x: 75, y: 350 }, { x: 75, y: 400 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    
    // Crypto right edge (480,140) → OTP left edge (600,140)
    { points: [{ x: 480, y: 140 }, { x: 600, y: 140 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    
    // Crypto bottom (400,230) → CPU top (400,320)
    { points: [{ x: 400, y: 230 }, { x: 400, y: 320 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },
    
    // OTP bottom (670,230) → ROM top (670,400)
    { points: [{ x: 670, y: 230 }, { x: 670, y: 400 }], type: 'power' as const, label: 'VCC', active: currentStage >= 1 },

    // ===== STAGE 2: ROM → OTP (Key Request) =====
    // ROM top (655,400) → OTP bottom (655,230)
    { points: [{ x: 655, y: 400 }, { x: 655, y: 230 }], type: 'control' as const, label: 'KEY_REQ', active: currentStage === 2 },
    
    // ===== STAGE 2-3: OTP → ROM (Key Data Response) =====
    // OTP bottom (685,230) → ROM top (685,400)
    { points: [{ x: 685, y: 230 }, { x: 685, y: 400 }], type: 'data' as const, label: 'KEY_HASH', active: currentStage >= 2 && currentStage <= 3 },

    // ===== STAGE 3: ROM → Flash (Bootloader Read Request) =====
    // ROM left edge (600,450) → Flash right edge (145,450)
    { points: [{ x: 600, y: 450 }, { x: 400, y: 450 }, { x: 400, y: 540 }, { x: 145, y: 540 }], type: 'control' as const, label: 'READ_BL', active: currentStage === 3 },
    
    // ===== STAGE 3-4: Flash → ROM (Bootloader Data) =====
    // Flash right edge (145,470) → ROM left edge (600,470)
    { points: [{ x: 145, y: 470 }, { x: 380, y: 470 }, { x: 380, y: 560 }, { x: 600, y: 560 }, { x: 600, y: 470 }], type: 'data' as const, label: 'BL_DATA', active: currentStage >= 3 && currentStage <= 4 },

    // ===== STAGE 4-5: ROM → Crypto (Public Key) =====
    // ROM left (600,430) → Crypto bottom-right (470,230)
    { points: [{ x: 600, y: 430 }, { x: 550, y: 430 }, { x: 550, y: 290 }, { x: 470, y: 290 }, { x: 470, y: 230 }], type: 'data' as const, label: 'PUB_KEY', active: currentStage >= 4 && currentStage <= 5 },
    
    // ===== STAGE 4-5: Flash → Crypto (Signature) =====
    // Flash right-top (145,420) → Crypto left-bottom (320,200)
    { points: [{ x: 145, y: 420 }, { x: 240, y: 420 }, { x: 240, y: 200 }, { x: 320, y: 200 }], type: 'data' as const, label: 'SIG', active: currentStage >= 4 && currentStage <= 5 },
    
    // ===== STAGE 5: Crypto → ROM (Verification Result) =====
    // Crypto right (480,160) → ROM left-top (600,420)
    { points: [{ x: 480, y: 160 }, { x: 560, y: 160 }, { x: 560, y: 420 }, { x: 600, y: 420 }], type: 'control' as const, label: mode === 'tampered' ? 'FAIL' : 'PASS', active: currentStage === 5 },

    // ===== STAGE 6: ROM → CPU (Control Transfer) =====
    // ROM left-bottom (600,480) → CPU right (480,410)
    { points: [{ x: 600, y: 480 }, { x: 540, y: 480 }, { x: 540, y: 410 }, { x: 480, y: 410 }], type: 'control' as const, label: mode === 'tampered' ? 'HALT' : 'BOOT', active: currentStage === 6 },

    // ===== STAGE 7: CPU ↔ Flash (OS/Application Access) =====
    // CPU left (320,430) → Flash right (145,480)
    { points: [{ x: 320, y: 430 }, { x: 240, y: 430 }, { x: 240, y: 480 }, { x: 145, y: 480 }], type: 'control' as const, label: 'READ', active: currentStage >= 7 },
    
    // Flash right (145,500) → CPU left (320,450)
    { points: [{ x: 145, y: 500 }, { x: 220, y: 500 }, { x: 220, y: 450 }, { x: 320, y: 450 }], type: 'data' as const, label: mode === 'tampered' ? 'SAFE' : 'OS', active: currentStage >= 7 },
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
