import React from 'react';

interface DataFlowParticleProps {
  path: string;
  duration: number;
  delay: number;
  color: string;
}

const DataFlowParticle: React.FC<DataFlowParticleProps> = ({ path, duration, delay, color }) => {
  return (
    <circle r="4" fill={color} opacity="0.8">
      <animateMotion
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        path={path}
      />
      <animate
        attributeName="opacity"
        values="0;0.8;0.8;0"
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
};

export default DataFlowParticle;
