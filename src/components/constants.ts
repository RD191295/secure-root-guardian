export interface Module {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
  isActive: boolean;
  description: string;
}

export interface Chip3DEnvironmentProps {
  mode: 'normal' | 'tampered';
  showInternals: boolean;
  animationSpeed: number;
  currentStage: number;
}

export const MODULES: Module[] = [
  {
    id: 'pmu',
    name: 'Power Management Unit',
    type: 'pmu',
    position: { x: 50, y: 50, z: 0 },
    size: { width: 210, height: 180, depth: 20 },
    color: 'from-red-800 to-red-600',
    isActive: false,
    description: 'Power Management Unit'
  },
  {
    id: 'bootrom',
    name: 'Boot ROM',
    type: 'rom',
    position: { x: 320, y: 50, z: 0 },
    size: { width: 140, height: 180, depth: 20 },
    color: 'from-blue-800 to-blue-600',
    isActive: false,
    description: 'Boot ROM with secure code'
  },
  {
    id: 'otp',
    name: 'OTP/eFuse',
    type: 'otp',
    position: { x: 520, y: 50, z: 0 },
    size: { width: 140, height: 100, depth: 20 },
    color: 'from-orange-800 to-orange-600',
    isActive: false,
    description: 'One-Time Programmable Memory'
  },
  {
    id: 'crypto',
    name: 'Crypto Engine',
    type: 'crypto',
    position: { x: 250, y: 250, z: 0 },
    size: { width: 160, height: 180, depth: 20 },
    color: 'from-emerald-800 to-emerald-600',
    isActive: false,
    description: 'Cryptographic accelerator'
  },
  {
    id: 'flash',
    name: 'Flash Memory',
    type: 'flash',
    position: { x: 50, y: 250, z: 0 },
    size: { width: 140, height: 190, depth: 20 },
    color: 'from-teal-800 to-teal-600',
    isActive: false,
    description: 'External Flash storage'
  },
  {
    id: 'cpu',
    name: 'CPU Core',
    type: 'cpu',
    position: { x: 450, y: 250, z: 0 },
    size: { width: 160, height: 180, depth: 20 },
    color: 'from-blue-800 to-blue-600',
    isActive: false,
    description: 'Main processor'
  }
];

export const getModuleById = (id: string, modules: Module[]): Module | undefined => {
  return modules.find(m => m.id === id);
};

export const getBootStatus = (
  flags: Record<string, boolean>,
  mode: 'normal' | 'tampered',
  currentStage: number
) => {
  if (mode === 'tampered' && currentStage >= 5) {
    return {
      text: 'BOOT FAILED - TAMPERING DETECTED',
      color: 'bg-red-600'
    };
  }

  if (currentStage === 0) {
    return {
      text: 'System Powered Down',
      color: 'bg-gray-600'
    };
  }

  if (currentStage === 7 && mode === 'normal') {
    return {
      text: 'BOOT COMPLETE - SECURE',
      color: 'bg-green-600'
    };
  }

  return {
    text: `Boot Stage ${currentStage} - In Progress`,
    color: 'bg-blue-600'
  };
};
