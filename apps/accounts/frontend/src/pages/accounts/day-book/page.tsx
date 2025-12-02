import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

type DayBookRow = {
  id: string;
  date: string; // dd-MMM-yy
  voucherNo: string;
  voucherType: 'Payment' | 'Receipt' | 'Contra' | 'Journal' | 'Sales' | 'Purchase';
  particulars: string;
  debit: number;
  credit: number;
  branch?: string;
};

const format = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccountsDayBookPage() {
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);

  // Mock rows; will be swapped with real data source
  const rows = useMemo<DayBookRow[]>(
    () => [
      {
        id: '1',
        date: '01-Aug-25',
        voucherNo: 'PAY/0001',
        voucherType: 'Payment',
        particulars: 'Paid to Transporter',
        debit: 25000,
        credit: 0,
        branch: 'HO'
      },
      {
        id: '2',
        date: '01-Aug-25',
        voucherNo: 'REC/0005',
        voucherType: 'Receipt',
        particulars: 'Received from Customer ABC',
        debit: 0,
        credit: 78000,
        branch: 'BR-A'
      },
      {
        id: '3',
        date: '02-Aug-25',
        voucherNo: 'CON/0002',
        voucherType: 'Contra',
        particulars: 'Cash Deposit to Bank',
        debit: 0,
        credit: 15000,
        branch: 'HO'
      },
      {
        id: '4',
        date: '02-Aug-25',
        voucherNo: 'JRN/0003',
        voucherType: 'Journal',
        particulars: 'Yearly Provision',
        debit: 12000,
        credit: 0,
        branch: 'BR-B'
      }
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

  const branchOptions = [
    { label: 'All Branches', value: '' },
    { label: 'Head Office', value: 'HO' },
    { label: 'Branch A', value: 'BR-A' },
    { label: 'Branch B', value: 'BR-B' }
  ];

  const typeTag = (r: DayBookRow) => {
    const severity =
      r.voucherType === 'Payment' ? 'danger' :
      r.voucherType === 'Receipt' ? 'success' :
      r.voucherType === 'Contra' ? 'info' :
      r.voucherType === 'Journal' ? 'warning' :
      'secondary';
    return <Tag value={r.voucherType} severity={severity as any} />;
  };

  const footer = (
    <div className="flex w-full font-semibold">
      <div className="flex-1">Total</div>
      <div className="flex justify-content-end" style={{ width: 140 }}>{format(totals.debit)}</div>
      <div className="flex justify-content-end" style={{ width: 140 }}>{format(totals.credit)}</div>
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="Accounts • Day Book"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[Day Book] refresh with filters', filters)}
          onExport={(kind) => console.log('[Day Book] export', kind)}
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
            emptyMessage="No entries"
          >
            <Column field="date" header="Date" sortable style={{ width: 140 }} />
            <Column field="voucherNo" header="Voucher No" sortable style={{ width: 140 }} />
            <Column header="Type" body={typeTag} style={{ width: 140 }} />
            <Column field="particulars" header="Particulars" sortable />
            <Column
              field="debit"
              header="Debit"
              align="right"
              body={(r: DayBookRow) => <span className="w-full text-right">{format(r.debit)}</span>}
            />
            <Column
              field="credit"
              header="Credit"
              align="right"
              body={(r: DayBookRow) => <span className="w-full text-right">{format(r.credit)}</span>}
            />
            <Column field="branch" header="Branch" style={{ width: 120 }} />
          </DataTable>
        </Card>
      </div>

      <FilterSidebar
        visible={showFilters}
        onHide={() => setShowFilters(false)}
        value={filters}
        onChange={setFilters}
        branches={branchOptions}
        title="Day Book Filters"
      />
    </div>
  );
}