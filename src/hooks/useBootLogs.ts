import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  stage: number;
  message: string;
}

export const useBootLogs = (currentStage: number, mode: 'normal' | 'tampered') => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const generateLogsForStage = (stage: number, mode: 'normal' | 'tampered'): LogEntry[] => {
    const timestamp = format(new Date(), 'HH:mm:ss.SSS');
    const baseId = `${Date.now()}-${stage}`;

    const logTemplates: Record<number, LogEntry[]> = {
      0: [
        {
          id: `${baseId}-0`,
          timestamp,
          level: 'info',
          stage,
          message: '⚡ Power-On Reset initiated'
        },
        {
          id: `${baseId}-1`,
          timestamp,
          level: 'success',
          stage,
          message: '✓ VCC: 3.3V stable, VDDIO: 1.8V stable'
        },
        {
          id: `${baseId}-2`,
          timestamp,
          level: 'info',
          stage,
          message: 'Reset signal released, system clock: 24MHz'
        }
      ],
      1: [
        {
          id: `${baseId}-0`,
          timestamp,
          level: 'info',
          stage,
          message: '🔧 ROM execution started at 0x00000000'
        },
        {
          id: `${baseId}-1`,
          timestamp,
          level: 'info',
          stage,
          message: 'Fetching boot vector from ROM'
        },
        {
          id: `${baseId}-2`,
          timestamp,
          level: 'success',
          stage,
          message: '✓ Boot ROM initialized successfully'
        }
      ],
      2: [
        {
          id: `${baseId}-0`,
          timestamp,
          level: 'info',
          stage,
          message: '🔑 Reading OTP fuses for key material'
        },
        {
          id: `${baseId}-1`,
          timestamp,
          level: 'info',
          stage,
          message: 'Key hash retrieved: 0x12345678ABCDEF90'
        },
        {
          id: `${baseId}-2`,
          timestamp,
          level: 'success',
          stage,
          message: '✓ Public key hash loaded from eFuses'
        }
      ],
      3: [
        {
          id: `${baseId}-0`,
          timestamp,
          level: 'info',
          stage,
          message: '📥 Loading bootloader from flash at 0x00010000'
        },
        {
          id: `${baseId}-1`,
          timestamp,
          level: 'info',
          stage,
          message: 'Bootloader size: 64KB, Reading flash sectors...'
        },
        {
          id: `${baseId}-2`,
          timestamp,
          level: mode === 'tampered' ? 'warning' : 'success',
          stage,
          message: mode === 'tampered' 
            ? '⚠ Bootloader loaded (integrity unknown)' 
            : '✓ Bootloader loaded into SRAM'
        }
      ],
      4: [
        {
          id: `${baseId}-0`,
          timestamp,
          level: 'info',
          stage,
          message: '🔐 Starting signature verification (RSA-2048)'
        },
        {
          id: `${baseId}-1`,
          timestamp,
          level: 'info',
          stage,
          message: 'Computing SHA-256 hash of bootloader image...'
        },
        {
          id: `${baseId}-2`,
          timestamp,
          level: 'info',
          stage,
          message: mode === 'tampered'
            ? 'Hash: 0xDEADBEEF... (verifying against signature)'
            : 'Hash: 0x12345678... (verifying against signature)'
        }
      ],
      5: mode === 'tampered' 
        ? [
            {
              id: `${baseId}-0`,
              timestamp,
              level: 'error',
              stage,
              message: '❌ SIGNATURE VERIFICATION FAILED!'
            },
            {
              id: `${baseId}-1`,
              timestamp,
              level: 'error',
              stage,
              message: 'Hash mismatch detected - bootloader may be tampered'
            },
            {
              id: `${baseId}-2`,
              timestamp,
              level: 'error',
              stage,
              message: 'Expected: 0x12345678... Got: 0xDEADBEEF...'
            }
          ]
        : [
            {
              id: `${baseId}-0`,
              timestamp,
              level: 'success',
              stage,
              message: '✓ SIGNATURE VERIFICATION PASSED'
            },
            {
              id: `${baseId}-1`,
              timestamp,
              level: 'success',
              stage,
              message: 'Bootloader integrity confirmed'
            },
            {
              id: `${baseId}-2`,
              timestamp,
              level: 'info',
              stage,
              message: 'Preparing to transfer execution...'
            }
          ],
      6: mode === 'tampered'
        ? [
            {
              id: `${baseId}-0`,
              timestamp,
              level: 'warning',
              stage,
              message: '🚨 Entering SAFE MODE'
            },
            {
              id: `${baseId}-1`,
              timestamp,
              level: 'warning',
              stage,
              message: 'Bootloader execution BLOCKED'
            },
            {
              id: `${baseId}-2`,
              timestamp,
              level: 'info',
              stage,
              message: 'System halted in secure state'
            }
          ]
        : [
            {
              id: `${baseId}-0`,
              timestamp,
              level: 'success',
              stage,
              message: '🚀 Transferring control to bootloader'
            },
            {
              id: `${baseId}-1`,
              timestamp,
              level: 'info',
              stage,
              message: 'Jumping to address: 0x00010000'
            },
            {
              id: `${baseId}-2`,
              timestamp,
              level: 'success',
              stage,
              message: '✓ Bootloader executing successfully'
            }
          ],
      7: mode === 'tampered'
        ? [
            {
              id: `${baseId}-0`,
              timestamp,
              level: 'warning',
              stage,
              message: '⚠ System running in SAFE MODE'
            },
            {
              id: `${baseId}-1`,
              timestamp,
              level: 'warning',
              stage,
              message: 'Limited functionality - firmware update required'
            },
            {
              id: `${baseId}-2`,
              timestamp,
              level: 'info',
              stage,
              message: 'Waiting for recovery action...'
            }
          ]
        : [
            {
              id: `${baseId}-0`,
              timestamp,
              level: 'success',
              stage,
              message: '✓ BOOT COMPLETE - System Ready'
            },
            {
              id: `${baseId}-1`,
              timestamp,
              level: 'success',
              stage,
              message: 'OS/Application now running'
            },
            {
              id: `${baseId}-2`,
              timestamp,
              level: 'info',
              stage,
              message: 'Secure boot chain verified and trusted'
            }
          ]
    };

    return logTemplates[stage] || [];
  };

  useEffect(() => {
    // Generate logs for the current stage
    const newLogs = generateLogsForStage(currentStage, mode);
    setLogs(prev => [...prev, ...newLogs]);
  }, [currentStage, mode]);

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    logs,
    clearLogs
  };
};
