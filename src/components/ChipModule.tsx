import React, { useState } from 'react';
import { Cpu, Shield, Lock, Key, HardDrive, Settings, Power } from 'lucide-react';
import { Z_INDEX } from './zIndex';

interface ChipModuleProps {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
  isActive: boolean;
  description: string;
  showInternals: boolean;
  currentStage: number;
  mode: 'normal' | 'tampered';
  onClick: () => void;
  registers: Record<string, number>;
  memory: Record<string, string>;
  flags: Record<string, boolean>;
}

const ChipModule: React.FC<ChipModuleProps> = ({
  id,
  name,
  type,
  position,
  size,
  color,
  isActive,
  showInternals,
  currentStage,
  mode,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getModuleIcon = () => {
    switch (type) {
      case 'pmu': return <Power className="w-6 h-6" />;
      case 'rom': return <Shield className="w-6 h-6" />;
      case 'otp': return <Lock className="w-6 h-6" />;
      case 'crypto': return <Key className="w-6 h-6" />;
      case 'flash': return <HardDrive className="w-6 h-6" />;
      case 'cpu': return <Cpu className="w-6 h-6" />;
      default: return <Settings className="w-6 h-6" />;
    }
  };

  const getInternalComponents = () => {
    switch (type) {
      case 'pmu':
        return [
          { name: 'Voltage Regulator', status: currentStage >= 0 ? 'active' : 'idle' },
          { name: 'Power Sequencer', status: currentStage >= 0 ? 'active' : 'idle' },
          { name: 'Reset Controller', status: currentStage >= 0 ? 'active' : 'idle' }
        ];
      case 'rom':
        return [
          { name: 'Instruction Fetch', status: currentStage >= 1 ? 'active' : 'idle' },
          { name: 'Address Decoder', status: currentStage >= 1 ? 'active' : 'idle' },
          { name: 'Boot Code', status: currentStage >= 1 ? 'active' : 'idle' },
          { name: 'Key Storage', status: currentStage >= 2 ? 'active' : 'idle' }
        ];
      case 'otp':
        return [
          { name: 'eFuse Array', status: currentStage >= 2 ? 'active' : 'idle' },
          { name: 'Key Hash', status: currentStage >= 2 ? 'active' : 'idle' },
          { name: 'Access Control', status: currentStage >= 2 ? 'active' : 'idle' }
        ];
      case 'crypto':
        return [
          { name: 'Hash Engine', status: currentStage >= 4 ? 'active' : 'idle' },
          { name: 'RSA Verifier', status: currentStage >= 4 ? 'active' : 'idle' },
          { name: 'Key Loader', status: currentStage >= 4 ? 'active' : 'idle' },
          { name: 'Result Register', status: currentStage >= 5 ? 'active' : 'idle' }
        ];
      case 'flash':
        return [
          { name: 'SPI Controller', status: currentStage >= 3 ? 'active' : 'idle' },
          { name: 'Memory Array', status: currentStage >= 3 ? 'active' : 'idle' },
          { name: 'Address Buffer', status: currentStage >= 3 ? 'active' : 'idle' },
          { name: 'Data Buffer', status: currentStage >= 3 ? 'active' : 'idle' }
        ];
      case 'cpu':
        return [
          { name: 'Instruction Cache', status: currentStage >= 6 ? 'active' : 'idle' },
          { name: 'ALU', status: currentStage >= 6 ? 'active' : 'idle' },
          { name: 'Register File', status: currentStage >= 6 ? 'active' : 'idle' },
          { name: 'MMU', status: currentStage >= 6 ? 'active' : 'idle' }
        ];
      default:
        return [];
    }
  };

  const getStatusGlow = () => {
    if (mode === 'tampered' && type === 'crypto' && currentStage >= 5) {
      return 'shadow-2xl shadow-red-500/50 border-red-500';
    }
    if (isActive) {
      return 'shadow-2xl shadow-cyan-500/50 border-cyan-400';
    }
    if (isHovered) {
      return 'shadow-xl shadow-blue-500/30 border-blue-400';
    }
    return 'shadow-lg shadow-black/50 border-gray-600';
  };

  const internalComponents = getInternalComponents();

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 ease-out ${isActive ? 'animate-pulse' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
        zIndex: isHovered ? Z_INDEX.CHIP_MODULES_HOVER : Z_INDEX.CHIP_MODULES,
        filter: isHovered ? 'brightness(1.2)' : 'brightness(1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main Module Body */}
      <div
        className={`
          relative bg-gradient-to-br ${color} rounded-xl border-2
          ${getStatusGlow()}
          backdrop-blur-sm overflow-hidden transition-all duration-300
        `}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`
        }}
      >
        {/* Module Header */}
        <div className="p-3 border-b border-white/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="text-white flex-shrink-0">
                {getModuleIcon()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-sm drop-shadow-lg leading-tight break-words">{name}</h3>
                <p className="text-gray-200 text-xs font-semibold drop-shadow-md">{type.toUpperCase()}</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`
              w-3 h-3 rounded-full
              ${mode === 'tampered' && type === 'crypto' && currentStage >= 5
                ? 'bg-red-400 animate-ping'
                : isActive
                  ? 'bg-green-400 animate-pulse'
                  : 'bg-gray-400'
              }
            `} />
          </div>
        </div>

        {/* Internal Components (if enabled) */}
        {showInternals && internalComponents.length > 0 && (
          <div className="p-2">
            <div className="grid grid-cols-2 gap-1">
              {internalComponents.map((component, index) => (
                <div
                  key={index}
                  className={`
                    p-1 rounded text-center text-xs border transition-all
                    ${component.status === 'active'
                      ? 'border-cyan-400 bg-cyan-900/30 text-cyan-200'
                      : 'border-gray-600 bg-gray-800/50 text-gray-400'
                    }
                  `}
                >
                  {component.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Indicators */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping shadow-lg"
                style={{
                  left: `${15 + (i % 4) * 25}%`,
                  top: `${25 + Math.floor(i / 4) * 20}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}

            {/* Pulsing border for active modules */}
            <div className="absolute inset-0 rounded-xl border-2 border-cyan-400 animate-pulse" />
          </div>
        )}

        {/* Error State */}
        {mode === 'tampered' && type === 'crypto' && currentStage >= 5 && (
          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center rounded-xl border-2 border-red-500 animate-pulse">
            <div className="text-red-200 text-sm font-bold animate-pulse bg-red-900/80 px-2 py-1 rounded">
              VERIFICATION FAILED
            </div>
          </div>
        )}

        {/* 3D Depth Effect */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-xl pointer-events-none"
          style={{ transform: `translateZ(-${size.depth/2}px)` }}
        />
      </div>

      {/* Module Pins/Connectors */}
      <div className="absolute -left-2 top-1/4 bottom-1/4 flex flex-col justify-between">
        {[...Array(Math.min(6, Math.floor(size.height / 15)))].map((_, i) => (
          <div key={i} className="w-4 h-2 bg-gray-400 rounded-r" />
        ))}
      </div>
      <div className="absolute -right-2 top-1/4 bottom-1/4 flex flex-col justify-between">
        {[...Array(Math.min(6, Math.floor(size.height / 15)))].map((_, i) => (
          <div key={i} className="w-4 h-2 bg-gray-400 rounded-l" />
        ))}
      </div>

      {/* Module Shadow */}
      <div
        className="absolute bg-black/30 rounded-xl blur-sm"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: `translateZ(-${size.depth}px) translateY(4px)`
        }}
      />
    </div>
  );
};

export default ChipModule;
