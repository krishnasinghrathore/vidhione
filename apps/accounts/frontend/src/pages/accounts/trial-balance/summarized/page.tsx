import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

type TBRow = {
  id: string;
  group: string;
  debit: number;
  credit: number;
};

const formatINR = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccountsTrialBalanceSummarizedRoute() {
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);

  // Mock summary data (replace with backend data)
  const rows = useMemo<TBRow[]>(
    () => [
      { id: '1', group: 'Current Assets', debit: 685000, credit: 39000 },
      { id: '2', group: 'Revenue', debit: 0, credit: 425000 },
      { id: '3', group: 'COGS', debit: 286000, credit: 0 },
      { id: '4', group: 'Expenses', debit: 54000, credit: 0 },
      { id: '5', group: 'Current Liabilities', debit: 0, credit: 192000 }
    ],
    []
  );

  const totals = useMemo(
    () => ({
      debit: rows.reduce((a, r) => a + r.debit, 0),
      credit: rows.reduce((a, r) => a + r.credit, 0)
    }),
    [rows]
  );

  const netRow = (r: TBRow) => {
    const diff = r.debit - r.credit;
    const pos = diff >= 0;
    return <Tag value={`${formatINR(Math.abs(diff))} ${pos ? 'Dr' : 'Cr'}`} severity={pos ? 'success' : 'warning'} />;
  };

  const footer = (
    <div className="flex w-full font-semibold">
      <div className="flex-1">Total</div>
      <div className="flex justify-content-end" style={{ width: 160 }}>{formatINR(totals.debit)}</div>
      <div className="flex justify-content-end" style={{ width: 160 }}>{formatINR(totals.credit)}</div>
      <div className="flex justify-content-end" style={{ width: 180 }}>
        {formatINR(Math.abs(totals.debit - totals.credit))} {totals.debit - totals.credit >= 0 ? 'Dr' : 'Cr'}
      </div>
    </div>
  );

  const onExport = (kind: 'excel' | 'csv' | 'pdf' | 'print') => {
    console.log('[Trial Balance] export', kind, { filters, totals, rows: rows.length });
    if (kind === 'print') window.print();
  };

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
          title="Accounts • Trial Balance (Summarized)"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[Trial Balance] refresh with filters', filters)}
          onExport={onExport}
        />
      </div>

      <div className="col-12">
        <Card>
          <DataTable
            value={rows}
            size="small"
            showGridlines
            stripedRows
            paginator
            rows={10}
            footer={footer}
            emptyMessage="No data"
          >
            <Column field="group" header="Group" sortable />
            <Column
              field="debit"
              header="Debit"
              align="right"
              body={(r: TBRow) => <span className="w-full text-right">{formatINR(r.debit)}</span>}
              sortable
            />
            <Column
              field="credit"
              header="Credit"
              align="right"
              body={(r: TBRow) => <span className="w-full text-right">{formatINR(r.credit)}</span>}
              sortable
            />
            <Column header="Net" body={netRow} align="right" />
          </DataTable>
        </Card>
      </div>

      <FilterSidebar
        visible={showFilters}
        onHide={() => setShowFilters(false)}
        value={filters}
        onChange={setFilters}
        branches={branchOptions}
        title="Trial Balance Filters"
      />
    </div>
  );
}