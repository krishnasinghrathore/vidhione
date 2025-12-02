import React from 'react';
import { Card } from 'primereact/card';
import KpiCards from './components/KpiCards';
import SalesChart from './components/SalesChart';
import CollectionsChart from './components/CollectionsChart';
import TopItemsTable from './components/TopItemsTable';
import PerformanceWidget from './components/PerformanceWidget';
import './dashboard.scss';

const DashboardPage: React.FC = () => {
  return (
    <div className="agency-dashboard p-grid p-dir-col p-m-3">
      <div className="p-col">
        <h2 className="text-2xl font-semibold mb-4">Agency Dashboard</h2>
      </div>

      <KpiCards />

      <div className="p-grid p-mt-3">
        <div className="p-col-12 p-md-6">
          <Card title="Monthly Sales Trend">
            <SalesChart />
          </Card>
        </div>
        <div className="p-col-12 p-md-6">
          <Card title="Collections Summary">
            <CollectionsChart />
          </Card>
        </div>
      </div>

      <div className="p-grid p-mt-3">
        <div className="p-col-12 p-md-6">
          <Card title="Top Selling Items">
            <TopItemsTable />
          </Card>
        </div>
        <div className="p-col-12 p-md-6">
          <Card title="Performance Overview">
            <PerformanceWidget />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
