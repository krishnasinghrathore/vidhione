import React from 'react';
import { Card } from 'primereact/card';

const mockKpis = [
  { title: 'Net Sales', value: '₹12.5L', trend: '+8%' },
  { title: 'Collections', value: '₹8.9L', trend: '+5%' },
  { title: 'Stock Value', value: '₹2.1L', trend: '-2%' },
  { title: 'Pending Invoices', value: '54', trend: '+3' },
];

const KpiCards: React.FC = () => {
  return (
    <div className="p-grid">
      {mockKpis.map((kpi, idx) => (
        <div key={idx} className="p-col-12 p-md-3">
          <Card title={kpi.title} className="text-center">
            <h2>{kpi.value}</h2>
            <p className="text-sm text-muted">Trend: {kpi.trend}</p>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
