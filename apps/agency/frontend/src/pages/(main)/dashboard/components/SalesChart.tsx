import React from 'react';
import { Chart } from 'primereact/chart';

const SalesChart: React.FC = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [10000, 15000, 18000, 20000, 25000],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: '#36A2EB',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return <Chart type="line" data={data} options={options} />;
};

export default SalesChart;
