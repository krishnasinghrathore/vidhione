import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

type LedgerRow = {
  id: string;
  account: string;
  group: string;
  opening: number;
  debit: number;
  credit: number;
  closing: number;
};

const format = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccountsLedgerPage() {
  // Right-side filter panel state
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);

  // Mock rows (replace with GraphQL/REST later)
  const rows = useMemo<LedgerRow[]>(
    () => [
      { id: '1', account: 'Cash', group: 'Current Assets', opening: 150000, debit: 25000, credit: 12000, closing: 163000 },
      { id: '2', account: 'Bank', group: 'Current Assets', opening: 320000, debit: 51000, credit: 76000, closing: 295000 },
      { id: '3', account: 'Sales A/c', group: 'Revenue', opening: 0, debit: 0, credit: 425000, closing: -425000 },
      { id: '4', account: 'Purchase A/c', group: 'COGS', opening: 0, debit: 286000, credit: 0, closing: 286000 },
      { id: '5', account: 'Sundry Debtors', group: 'Current Assets', opening: 210000, debit: 95000, credit: 78000, closing: 227000 }
    ],
    []
  );

  const totals = useMemo(
    () => ({
      opening: rows.reduce((a, r) => a + r.opening, 0),
      debit: rows.reduce((a, r) => a + r.debit, 0),
      credit: rows.reduce((a, r) => a + r.credit, 0),
      closing: rows.reduce((a, r) => a + r.closing, 0)
    }),
    [rows]
  );

  const onExport = (kind: 'excel' | 'csv' | 'pdf' | 'print') => {
    // Wire to real exporter later
    console.log('[Ledger] export', kind, { filters, totals, rowsCount: rows.length });
    if (kind === 'print') window.print();
  };

  const branchOptions = [
    { label: 'All Branches', value: '' },
    { label: 'Head Office', value: 'HO' },
    { label: 'Branch A', value: 'BR-A' },
    { label: 'Branch B', value: 'BR-B' }
  ];

  const closingTemplate = (r: LedgerRow) => {
    const pos = r.closing >= 0;
    return (
      <Tag value={format(Math.abs(r.closing)) + (pos ? ' Dr' : ' Cr')} severity={pos ? 'success' : 'warning'} />
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center w-full">
      <span>Ledger</span>
      <div className="flex gap-2">
        <Button label="Dr/Cr Net" size="small" text />
        <Button label="Group View" size="small" text />
      </div>
    </div>
  );

  const footer = (
    <div className="flex w-full font-semibold">
      <div className="flex-1">Total</div>
      <div className="flex justify-content-end" style={{ width: 140 }}>{format(totals.opening)}</div>
      <div className="flex justify-content-end" style={{ width: 140 }}>{format(totals.debit)}</div>
      <div className="flex justify-content-end" style={{ width: 140 }}>{format(totals.credit)}</div>
      <div className="flex justify-content-end" style={{ width: 160 }}>
        {format(Math.abs(totals.closing))} {totals.closing >= 0 ? 'Dr' : 'Cr'}
      </div>
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="Accounts • Ledger"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[Ledger] refresh with filters', filters)}
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
            header={header}
            footer={footer}
            emptyMessage="No ledger rows"
          >
            <Column field="account" header="Account" sortable />
            <Column field="group" header="Group" sortable />
            <Column
              field="opening"
              header="Opening"
              align="right"
              body={(r: LedgerRow) => <span className="w-full text-right">{format(r.opening)}</span>}
            />
            <Column
              field="debit"
              header="Debit"
              align="right"
              body={(r: LedgerRow) => <span className="w-full text-right">{format(r.debit)}</span>}
            />
            <Column
              field="credit"
              header="Credit"
              align="right"
              body={(r: LedgerRow) => <span className="w-full text-right">{format(r.credit)}</span>}
            />
            <Column header="Closing" align="right" body={closingTemplate} />
          </DataTable>
        </Card>
      </div>

      <FilterSidebar
        visible={showFilters}
        onHide={() => setShowFilters(false)}
        value={filters}
        onChange={setFilters}
        branches={branchOptions}
        title="Ledger Filters"
      />
    </div>
  );
}