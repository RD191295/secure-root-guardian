import React from 'react';
import { Check, X, Circle } from 'lucide-react';

interface BootStage {
  id: number;
  name: string;
  description: string;
  instruction?: string;
  duration: number;
}

interface BootTimelineProps {
  currentStage: number;
  totalStages: number;
  stages: BootStage[];
  onStageClick: (stage: number) => void;
  mode: 'normal' | 'tampered';
}

export const BootTimeline: React.FC<BootTimelineProps> = ({
  currentStage,
  totalStages,
  stages,
  onStageClick,
  mode
}) => {
  const getStageStatus = (stageId: number) => {
    if (stageId < currentStage) return 'completed';
    if (stageId === currentStage) return 'current';
    return 'upcoming';
  };

  const getStageColor = (stageId: number, status: string) => {
    if (status === 'completed') {
      if (mode === 'tampered' && stageId >= 5) return 'bg-red-500 border-red-400';
      return 'bg-green-500 border-green-400';
    }
    if (status === 'current') {
      if (mode === 'tampered' && stageId >= 5) return 'bg-red-600 border-red-500 animate-pulse';
      return 'bg-blue-600 border-blue-500 animate-pulse';
    }
    return 'bg-gray-700 border-gray-600';
  };

  const getProgressColor = () => {
    if (mode === 'tampered' && currentStage >= 5) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Boot Sequence Timeline</h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700" />
          <div
            className={`absolute top-5 left-0 h-0.5 transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${(currentStage / (totalStages - 1)) * 100}%` }}
          />

          {/* Stage Nodes */}
          <div className="relative flex justify-between">
            {stages.map((stage) => {
              const status = getStageStatus(stage.id);
              const stageColor = getStageColor(stage.id, status);
              const isFailed = mode === 'tampered' && stage.id >= 5 && stage.id < currentStage;

              return (
                <div
                  key={stage.id}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => onStageClick(stage.id)}
                >
                  {/* Stage Node */}
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${stageColor}`}
                  >
                    {status === 'completed' ? (
                      isFailed ? (
                        <X className="w-5 h-5 text-white" />
                      ) : (
                        <Check className="w-5 h-5 text-white" />
                      )
                    ) : status === 'current' ? (
                      <Circle className="w-4 h-4 text-white fill-white" />
                    ) : (
                      <span className="text-xs text-gray-400 font-semibold">{stage.id}</span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-2 text-center max-w-[120px]">
                    <p className={`text-xs font-medium transition-colors ${
                      status === 'current' 
                        ? 'text-blue-400' 
                        : status === 'completed' 
                          ? isFailed ? 'text-red-400' : 'text-green-400'
                          : 'text-gray-500'
                    }`}>
                      {stage.name}
                    </p>
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute top-12 mt-2 hidden group-hover:block z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl max-w-[250px]">
                      <p className="text-xs text-white font-semibold mb-1">{stage.name}</p>
                      <p className="text-xs text-gray-400">{stage.description}</p>
                      {stage.instruction && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">{stage.instruction}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
