import { useState, useEffect, useCallback } from 'react';

interface BootStage {
  id: number;
  name: string;
  description: string;
  instruction?: string;
  duration: number;
}

export const useSecureBootState = (mode: 'normal' | 'tampered', animationSpeed: number) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [registers, setRegisters] = useState({
    PC: 0x00000000,
    SP: 0x20008000,
    R0: 0x00000000,
    R1: 0x00000000,
    CPSR: 0x000001D3
  });
  const [memory, setMemory] = useState({
    '0x00000000': 'Boot ROM Code',
    '0x00010000': mode === 'tampered' ? 'Tampered Bootloader' : 'Valid Bootloader',
    '0x00020000': 'Signature Data',
    '0x20000000': 'SRAM'
  });
  const [flags, setFlags] = useState({
    powerGood: false,
    romActive: false,
    keyLoaded: false,
    signatureValid: false,
    bootComplete: false,
    tamperDetected: mode === 'tampered',
    safeMode: false
  });

  const stages: BootStage[] = [
    {
      id: 0,
      name: 'Power-On Reset',
      description: 'System power rails stabilize and reset is released',
      instruction: 'Power sequencing',
      duration: 2000
    },
    {
      id: 1,
      name: 'ROM Initialization',
      description: 'Boot ROM begins execution at reset vector',
      instruction: 'LDR PC, =0x00000000',
      duration: 1500
    },
    {
      id: 2,
      name: 'Key Retrieval',
      description: 'Reading public key hash from OTP/eFuses',
      instruction: 'LDR R0, [OTP_BASE]',
      duration: 2000
    },
    {
      id: 3,
      name: 'Bootloader Load',
      description: 'Loading first-stage bootloader from flash memory',
      instruction: 'BL flash_read',
      duration: 2500
    },
    {
      id: 4,
      name: 'Signature Verification',
      description: 'Cryptographic verification of bootloader signature',
      instruction: 'BL crypto_verify',
      duration: 3000
    },
    {
      id: 5,
      name: 'Verification Complete',
      description: mode === 'tampered' ? 'Signature verification failed' : 'Signature verification passed',
      instruction: mode === 'tampered' ? 'B error_handler' : 'CMP R0, #1',
      duration: 1000
    },
    {
      id: 6,
      name: mode === 'tampered' ? 'Safe Mode Entry' : 'Execution Transfer',
      description: mode === 'tampered' ? 'System enters safe mode - bootloader execution blocked' : 'Control transferred to verified bootloader',
      instruction: mode === 'tampered' ? 'B safe_mode' : 'BX R1',
      duration: 1500
    },
    {
      id: 7,
      name: mode === 'tampered' ? 'Safe Mode Active' : 'Boot Complete',
      description: mode === 'tampered' ? 'System running in safe mode with limited functionality' : 'Secure boot completed successfully - OS/Application running',
      instruction: mode === 'tampered' ? 'WFI ; halt' : 'OS_main',
      duration: 1000
    }
  ];

  const updateSystemState = useCallback((stage: number) => {
    // Update registers based on current stage
    setRegisters(prev => ({
      ...prev,
      PC: 0x00000000 + (stage * 0x100),
      R0: stage >= 2 ? 0x12345678 : 0x00000000, // Key hash
      R1: stage >= 3 ? 0x00010000 : 0x00000000, // Bootloader address
    }));

    // Update flags based on current stage
    setFlags(prev => ({
      ...prev,
      powerGood: stage >= 0,
      romActive: stage >= 1,
      keyLoaded: stage >= 2,
      signatureValid: stage >= 5 && mode === 'normal',
      bootComplete: stage >= 7 && mode === 'normal',
      tamperDetected: mode === 'tampered' && stage >= 5,
      safeMode: mode === 'tampered' && stage >= 6
    }));

    // Update memory contents based on stage
    if (stage >= 3) {
      setMemory(prev => ({
        ...prev,
        '0x20000000': mode === 'tampered' ? 'Tampered bootloader (blocked)' : 'Bootloader loaded',
        '0x30000000': stage >= 7 ? (mode === 'tampered' ? 'Safe mode handler' : 'OS/Application') : 'Not loaded'
      }));
    }
  }, [mode]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const nextStage = useCallback(() => {
    if (currentStage < stages.length - 1) {
      const newStage = currentStage + 1;
      setCurrentStage(newStage);
      updateSystemState(newStage);
    }
  }, [currentStage, stages.length, updateSystemState]);

  const previousStage = useCallback(() => {
    if (currentStage > 0) {
      const newStage = currentStage - 1;
      setCurrentStage(newStage);
      updateSystemState(newStage);
    }
  }, [currentStage, updateSystemState]);

  const reset = useCallback(() => {
    setCurrentStage(0);
    setIsPlaying(false);
    updateSystemState(0);
  }, [updateSystemState]);

  const goToStage = useCallback((stage: number) => {
    if (stage >= 0 && stage < stages.length) {
      setCurrentStage(stage);
      updateSystemState(stage);
    }
  }, [stages.length, updateSystemState]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const currentStageData = stages[currentStage];
    if (!currentStageData) {
      setIsPlaying(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        nextStage();
      } else {
        setIsPlaying(false);
      }
    }, currentStageData.duration / animationSpeed);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentStage, animationSpeed, stages, nextStage]);

  // Initialize system state
  useEffect(() => {
    updateSystemState(currentStage);
  }, [currentStage, updateSystemState, mode]);

  return {
    currentStage,
    stageData: stages[currentStage] || stages[0],
    stages, // Export full stages array
    state: flags,
    registers,
    memory,
    flags,
    totalStages: stages.length,
    isPlaying,
    play,
    pause,
    nextStage: nextStage,
    prevStage: previousStage,
    togglePlay: isPlaying ? pause : play,
    setStage: goToStage,
    reset,
    goToStage
  };
};
