import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

interface Performer {
  name: string;
  percentage: number;
}

const performers: Performer[] = [
  { name: 'Manager A', percentage: 88 },
  { name: 'Manager B', percentage: 76 },
  { name: 'Manager C', percentage: 64 },
  { name: 'Manager D', percentage: 92 },
];

const PerformanceWidget: React.FC = () => {
  return (
    <div className="performance-widget p-fluid">
      {performers.map((perf, index) => (
        <div key={index} className="p-mb-3">
          <div className="p-d-flex p-jc-between p-mb-1">
            <span>{perf.name}</span>
            <span>{perf.percentage}%</span>
          </div>
          <ProgressBar value={perf.percentage} showValue={false}></ProgressBar>
        </div>
      ))}
    </div>
  );
};

export default PerformanceWidget;
