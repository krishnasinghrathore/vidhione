import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

type BSRow = {
  id: string;
  name: string;
  amount: number; // positive amount value
};

const inr = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccountsBalanceSheetSummarizedRoute() {
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data — replace with backend later
  const assets = useMemo<BSRow[]>(
    () => [
      { id: 'a1', name: 'Current Assets', amount: 1_085_000 },
      { id: 'a2', name: 'Fixed Assets', amount: 2_450_000 },
      { id: 'a3', name: 'Investments', amount: 310_000 },
      { id: 'a4', name: 'Other Assets', amount: 90_000 }
    ],
    []
  );

  const liabilities = useMemo<BSRow[]>(
    () => [
      { id: 'l1', name: 'Capital & Reserves', amount: 3_000_000 },
      { id: 'l2', name: 'Current Liabilities', amount: 495_000 },
      { id: 'l3', name: 'Long-term Liabilities', amount: 410_000 }
    ],
    []
  );

  const totals = useMemo(
    () => ({
      assets: assets.reduce((a, r) => a + r.amount, 0),
      liabilities: liabilities.reduce((a, r) => a + r.amount, 0)
    }),
    [assets, liabilities]
  );

  const diff = totals.assets - totals.liabilities;
  const equityBadge = (
    <Tag
      value={`${inr(Math.abs(diff))} ${diff >= 0 ? 'Dr' : 'Cr'}`}
      severity={diff >= 0 ? 'success' : 'warning'}
    />
  );

  const branchOptions = [
    { label: 'All Branches', value: '' },
    { label: 'Head Office', value: 'HO' },
    { label: 'Branch A', value: 'BR-A' },
    { label: 'Branch B', value: 'BR-B' }
  ];

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="Accounts • Balance Sheet (Summarized)"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[Balance Sheet] refresh with filters', filters)}
          onExport={(k: 'excel' | 'csv' | 'pdf' | 'print') => console.log('[Balance Sheet] export', k)}
          rightExtra={<div className="flex align-items-center gap-2"><span>Difference</span>{equityBadge}</div>}
        />
      </div>

      {/* Two-column summary */}
      <div className="col-12 lg:col-6">
        <Card title="Assets">
          <DataTable value={assets} size="small" showGridlines stripedRows footer={
            <div className="flex justify-content-between font-semibold w-full">
              <span>Total Assets</span>
              <span>{inr(totals.assets)}</span>
            </div>
          }>
            <Column field="name" header="Group" />
            <Column
              field="amount"
              header="Amount"
              align="right"
              body={(r: BSRow) => <span className="w-full text-right">{inr(r.amount)}</span>}
            />
          </DataTable>
        </Card>
      </div>

      <div className="col-12 lg:col-6">
        <Card title="Liabilities">
          <DataTable value={liabilities} size="small" showGridlines stripedRows footer={
            <div className="flex justify-content-between font-semibold w-full">
              <span>Total Liabilities</span>
              <span>{inr(totals.liabilities)}</span>
            </div>
          }>
            <Column field="name" header="Group" />
            <Column
              field="amount"
              header="Amount"
              align="right"
              body={(r: BSRow) => <span className="w-full text-right">{inr(r.amount)}</span>}
            />
          </DataTable>
        </Card>
      </div>

      <FilterSidebar
        visible={showFilters}
        onHide={() => setShowFilters(false)}
        value={filters}
        onChange={setFilters}
        branches={branchOptions}
        title="Balance Sheet Filters"
      />
    </div>
  );
}