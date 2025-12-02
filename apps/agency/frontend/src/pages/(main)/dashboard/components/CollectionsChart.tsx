import React from 'react';
import { Chart } from 'primereact/chart';

const CollectionsChart: React.FC = () => {
  const data = {
    labels: ['Cash', 'Bank'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ['#42A5F5', '#66BB6A'],
        hoverBackgroundColor: ['#64B5F6', '#81C784'],
      },
    ],
  };

  const options = {
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return <Chart type="doughnut" data={data} options={options} />;
};

export default CollectionsChart;
