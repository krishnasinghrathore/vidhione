import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import SummaryTable from '../../../components/SummaryTable';
import Visualization3D from '../../../components/Visualization3D';

export default function AgencyDashboardPage() {
  // Sample data for tables
  const dueInvoicesData = [
    { month: 'January', totalInvoices: 45, netAmt: 125000 },
    { month: 'February', totalInvoices: 52, netAmt: 145000 },
    { month: 'March', totalInvoices: 38, netAmt: 98000 },
    { month: 'April', totalInvoices: 61, netAmt: 167000 },
    { month: 'May', totalInvoices: 49, netAmt: 134000 }
  ];

  const dueEstimatesData = [
    { month: 'January', totalEstimates: 23, netAmt: 89000 },
    { month: 'February', totalEstimates: 31, netAmt: 112000 },
    { month: 'March', totalEstimates: 27, netAmt: 95000 },
    { month: 'April', totalEstimates: 35, netAmt: 128000 },
    { month: 'May', totalEstimates: 29, netAmt: 105000 }
  ];

  const deliveryProcessMonthData = [
    { month: 'January', totalInProcess: 42, totalPending: 8 },
    { month: 'February', totalInProcess: 48, totalPending: 12 },
    { month: 'March', totalInProcess: 35, totalPending: 5 },
    { month: 'April', totalInProcess: 55, totalPending: 15 },
    { month: 'May', totalInProcess: 47, totalPending: 9 }
  ];

  const deliveryProcessDayData = [
    { day: 'Monday', totalInProcess: 12, totalPending: 3 },
    { day: 'Tuesday', totalInProcess: 15, totalPending: 2 },
    { day: 'Wednesday', totalInProcess: 18, totalPending: 5 },
    { day: 'Thursday', totalInProcess: 14, totalPending: 1 },
    { day: 'Friday', totalInProcess: 16, totalPending: 4 }
  ];

  const handleRefresh = () => {
    console.log('Refreshing dashboard data...');
    // Add refresh logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-blue-600 text-white px-4 py-3 shadow-1">
        <div className="flex justify-content-between align-items-center">
          <div>
            <div className="text-2xl font-bold">Sohan Agencies [2024-2025]</div>
            <div className="text-sm opacity-90">21/01/2025 admin</div>
          </div>
          <div className="flex gap-2">
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              size="small"
              outlined
              className="bg-white text-blue-600 border-white hover:bg-gray-100"
              onClick={handleRefresh}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="grid">
          {/* Left Section - 3D Visualization */}
          <div className="col-12 lg:col-8">
            <Visualization3D />
          </div>

          {/* Right Section - Summary Tables */}
          <div className="col-12 lg:col-4">
            <div className="flex flex-column gap-3">
              <SummaryTable
                title="Due Invoices (Month Wise)"
                data={dueInvoicesData}
                columns={[
                  { field: 'month', header: 'Month' },
                  { field: 'totalInvoices', header: 'Total Invoices' },
                  { field: 'netAmt', header: 'Net Amt' }
                ]}
              />

              <SummaryTable
                title="Due Estimates (Month Wise)"
                data={dueEstimatesData}
                columns={[
                  { field: 'month', header: 'Month' },
                  { field: 'totalEstimates', header: 'Total Estima...' },
                  { field: 'netAmt', header: 'Net Amt' }
                ]}
              />

              <SummaryTable
                title="Delivery Process (Month Wise)"
                data={deliveryProcessMonthData}
                columns={[
                  { field: 'month', header: 'Month' },
                  { field: 'totalInProcess', header: 'Total In Pro...' },
                  { field: 'totalPending', header: 'Total Pending' }
                ]}
              />

              <SummaryTable
                title="Delivery Process (Day Wise)"
                data={deliveryProcessDayData}
                columns={[
                  { field: 'day', header: 'Day' },
                  { field: 'totalInProcess', header: 'Total In Pro...' },
                  { field: 'totalPending', header: 'Total Pending' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}