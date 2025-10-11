import React from 'react';
import { X, Cpu, Shield, Lock, Key, HardDrive, Settings, Power, AlertTriangle, CheckCircle } from 'lucide-react';
import { Z_INDEX } from './zIndex';
import { Module } from './constants';

interface ModulePopupProps {
  moduleId: string | null;
  modules: Module[];
  registers: Record<string, number>;
  memory: Record<string, string>;
  flags: Record<string, boolean>;
  currentStage: number;
  mode: 'normal' | 'tampered';
  onClose: () => void;
}

const ModulePopup: React.FC<ModulePopupProps> = ({
  moduleId,
  modules,
  registers,
  flags,
  currentStage,
  mode,
  onClose
}) => {
  if (!moduleId) return null;

  const module = modules.find(m => m.id === moduleId);
  if (!module) return null;

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'pmu': return <Power className="w-8 h-8 text-red-400" />;
      case 'rom': return <Shield className="w-8 h-8 text-blue-400" />;
      case 'otp': return <Lock className="w-8 h-8 text-yellow-400" />;
      case 'crypto': return <Key className="w-8 h-8 text-purple-400" />;
      case 'flash': return <HardDrive className="w-8 h-8 text-green-400" />;
      case 'cpu': return <Cpu className="w-8 h-8 text-cyan-400" />;
      default: return <Settings className="w-8 h-8 text-gray-400" />;
    }
  };

  const getModuleDetails = () => {
    switch (module.type) {
      case 'pmu':
        return {
          fullName: 'Power Management Unit',
          purpose: 'Manages system power delivery and sequencing',
          currentState: currentStage >= 0 ? 'Power rails active' : 'Powered down',
          internalState: {
            'VDD_CORE': currentStage >= 0 ? '1.2V' : '0V',
            'VDD_IO': currentStage >= 0 ? '3.3V' : '0V',
            'VDD_FLASH': currentStage >= 0 ? '1.8V' : '0V',
            'Power Good': currentStage >= 0 ? 'TRUE' : 'FALSE'
          },
          technicalSpecs: [
            'Input: 5V DC',
            'Outputs: 1.2V, 1.8V, 3.3V',
            'Max Current: 2A per rail',
            'Efficiency: >90%'
          ]
        };
      case 'rom':
        return {
          fullName: 'Boot ROM (Read-Only Memory)',
          purpose: 'Contains immutable boot code and initial verification logic',
          currentState: currentStage >= 1 ? 'Executing boot code' : 'Idle',
          internalState: {
            'PC': registers.PC ? `0x${registers.PC.toString(16).toUpperCase()}` : '0x00000000',
            'Boot Stage': currentStage >= 1 ? 'Active' : 'Idle',
            'Key Hash': currentStage >= 2 ? 'Loaded' : 'Not loaded',
            'Verification': currentStage >= 5 ? (mode === 'tampered' ? 'FAILED' : 'PASSED') : 'Pending'
          },
          technicalSpecs: [
            'Size: 32KB',
            'Technology: Mask ROM',
            'Access Time: 10ns',
            'Endurance: Infinite reads'
          ]
        };
      case 'otp':
        return {
          fullName: 'One-Time Programmable Memory / eFuses',
          purpose: 'Stores cryptographic keys and configuration data',
          currentState: currentStage >= 2 ? 'Key data accessed' : 'Idle',
          internalState: {
            'Public Key Hash': currentStage >= 2 ? 'Available' : 'Locked',
            'Device ID': 'Programmed',
            'Security Config': 'Enabled',
            'Tamper Detect': flags.tamperDetected ? 'TRIGGERED' : 'Normal'
          },
          technicalSpecs: [
            'Capacity: 2KB',
            'Technology: eFuse',
            'Programming: One-time only',
            'Retention: 20+ years'
          ]
        };
      case 'crypto':
        return {
          fullName: 'Cryptographic Engine',
          purpose: 'Hardware-accelerated cryptographic operations',
          currentState: currentStage >= 4 ? 'Verifying signature' : 'Idle',
          internalState: {
            'Hash Engine': currentStage >= 4 ? 'Computing SHA-256' : 'Idle',
            'RSA Verifier': currentStage >= 4 ? 'Active' : 'Idle',
            'Result': currentStage >= 5 ? (mode === 'tampered' ? 'INVALID' : 'VALID') : 'Pending',
            'Key Loaded': currentStage >= 4 ? 'Yes' : 'No'
          },
          technicalSpecs: [
            'Algorithms: RSA-2048, SHA-256',
            'Performance: 1000 ops/sec',
            'Key Storage: Secure registers',
            'Side-channel: Protected'
          ]
        };
      case 'flash':
        return {
          fullName: 'Flash Memory',
          purpose: 'Non-volatile storage for bootloader and data',
          currentState: currentStage >= 3 ? 'Reading bootloader' : 'Idle',
          internalState: {
            'Interface': currentStage >= 3 ? 'SPI Active' : 'Idle',
            'Address': currentStage >= 3 ? '0x00010000' : '0x00000000',
            'Data Buffer': currentStage >= 3 ? 'Loaded' : 'Empty',
            'Signature': currentStage >= 4 ? 'Extracted' : 'Not read'
          },
          technicalSpecs: [
            'Capacity: 16MB',
            'Technology: NOR Flash',
            'Interface: Quad SPI',
            'Speed: 133MHz'
          ]
        };
      case 'cpu':
        return {
          fullName: 'Central Processing Unit',
          purpose: 'Main processor executing verified code',
          currentState: currentStage >= 6 ? 'Executing OS' : 'Waiting',
          internalState: {
            'Instruction Cache': currentStage >= 6 ? 'Active' : 'Idle',
            'Pipeline': currentStage >= 6 ? 'Running' : 'Stalled',
            'MMU': currentStage >= 6 ? 'Enabled' : 'Disabled',
            'Security Mode': currentStage >= 6 ? 'Secure' : 'Boot'
          },
          technicalSpecs: [
            'Architecture: ARM Cortex-A53',
            'Frequency: 1.5GHz',
            'Cache: 32KB L1, 1MB L2',
            'Features: TrustZone, NEON'
          ]
        };
      default:
        return {
          fullName: module.name,
          purpose: module.description,
          currentState: module.isActive ? 'Active' : 'Idle',
          internalState: {},
          technicalSpecs: []
        };
    }
  };

  const details = getModuleDetails();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: Z_INDEX.POPUPS }} onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-600 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {getModuleIcon(module.type)}
            <div>
              <h2 className="text-xl font-bold text-white">{details.fullName}</h2>
              <p className="text-sm text-gray-400">{module.type.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Purpose */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Purpose</h3>
            <p className="text-gray-300 leading-relaxed">{details.purpose}</p>
          </div>

          {/* Current State */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Current State</h3>
            <div className={`
              p-4 rounded-lg border
              ${module.isActive
                ? 'bg-green-900/20 border-green-500 text-green-200'
                : 'bg-gray-800/50 border-gray-600 text-gray-300'
              }
            `}>
              <div className="flex items-center space-x-2">
                {module.isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                )}
                <span className="font-semibold">{details.currentState}</span>
              </div>
            </div>
          </div>

          {/* Internal State */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Internal State</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(details.internalState).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">{key}</div>
                  <div className={`
                    font-mono text-sm font-semibold
                    ${value === 'FAILED' || value === 'INVALID' || value === 'TRIGGERED'
                      ? 'text-red-400'
                      : value === 'PASSED' || value === 'VALID' || value === 'Active' || value === 'TRUE'
                        ? 'text-green-400'
                        : 'text-cyan-400'
                    }
                  `}>
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {details.technicalSpecs.map((spec, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                  <span className="text-gray-300 text-sm font-mono">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error State */}
          {mode === 'tampered' && module.type === 'crypto' && currentStage >= 5 && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-200 font-semibold">Verification Failure</span>
              </div>
              <p className="text-red-300 text-sm">
                The cryptographic engine has detected a signature mismatch. The bootloader image
                appears to have been tampered with and cannot be trusted. Boot process halted.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModulePopup;
