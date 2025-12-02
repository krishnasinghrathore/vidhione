import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

type InvoiceRow = {
  id: string;
  docType: 'INV' | 'CRN' | 'DBN';
  invoiceNo: string;
  date: string; // dd-MMM-yy
  party: string;
  taxable: number;
  tax: number;
  total: number;
  irn?: string;
  ackNo?: string;
  status: 'Pending' | 'Generated' | 'Uploaded' | 'Cancelled' | 'Error';
  remarks?: string;
};

const inr = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GSTEInvoiceRoute() {
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const rows = useMemo<InvoiceRow[]>(
    () => [
      {
        id: crypto.randomUUID(),
        docType: 'INV',
        invoiceNo: 'S-1001',
        date: '01-Aug-25',
        party: 'ABC Traders',
        taxable: 120000,
        tax: 21600,
        total: 141600,
        irn: 'b217...f930',
        ackNo: '152300112233',
        status: 'Generated'
      },
      {
        id: crypto.randomUUID(),
        docType: 'INV',
        invoiceNo: 'S-1002',
        date: '01-Aug-25',
        party: 'Prime Stores',
        taxable: 45000,
        tax: 8100,
        total: 53100,
        status: 'Pending'
      },
      {
        id: crypto.randomUUID(),
        docType: 'CRN',
        invoiceNo: 'CR-0005',
        date: '02-Aug-25',
        party: 'ABC Traders',
        taxable: 5000,
        tax: 900,
        total: 5900,
        irn: 'a524...19c1',
        ackNo: '152300445566',
        status: 'Uploaded'
      },
      {
        id: crypto.randomUUID(),
        docType: 'INV',
        invoiceNo: 'S-1003',
        date: '02-Aug-25',
        party: 'Zed Logistics',
        taxable: 27500,
        tax: 4950,
        total: 32450,
        status: 'Error',
        remarks: 'Invalid HSN for line 2'
      }
    ],
    []
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (search) {
        const key = `${r.invoiceNo} ${r.party} ${r.irn ?? ''} ${r.ackNo ?? ''}`.toLowerCase();
        if (!key.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, statusFilter, search]);

  const totals = useMemo(
    () => ({
      taxable: filtered.reduce((a, r) => a + r.taxable, 0),
      tax: filtered.reduce((a, r) => a + r.tax, 0),
      total: filtered.reduce((a, r) => a + r.total, 0)
    }),
    [filtered]
  );

  const statusTag = (r: InvoiceRow) => {
    const map: Record<InvoiceRow['status'], { label: string; severity: any }> = {
      Pending: { label: 'Pending', severity: 'secondary' },
      Generated: { label: 'Generated', severity: 'success' },
      Uploaded: { label: 'Uploaded', severity: 'info' },
      Cancelled: { label: 'Cancelled', severity: 'warning' },
      Error: { label: 'Error', severity: 'danger' }
    };
    const s = map[r.status];
    return <Tag value={s.label} severity={s.severity} />;
  };

  const docTypeTag = (r: InvoiceRow) => {
    const map: Record<InvoiceRow['docType'], string> = { INV: 'Invoice', CRN: 'Credit Note', DBN: 'Debit Note' };
    return <Tag value={map[r.docType]} severity={r.docType === 'INV' ? 'success' : 'info'} />;
  };

  const actionsTemplate = (r: InvoiceRow) => {
    const canGenerate = r.status === 'Pending' || r.status === 'Error';
    const canUpload = r.status === 'Generated';
    const canCancel = r.status === 'Generated' || r.status === 'Uploaded';

    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-cog"
          label="Generate"
          size="small"
          outlined
          disabled={!canGenerate}
          onClick={() => console.log('[E-Invoice] Generate IRN for', r.invoiceNo)}
        />
        <Button
          icon="pi pi-upload"
          label="Upload"
          size="small"
          severity="success"
          outlined
          disabled={!canUpload}
          onClick={() => console.log('[E-Invoice] Upload Ack for', r.invoiceNo)}
        />
        <Button
          icon="pi pi-times"
          label="Cancel"
          size="small"
          severity="danger"
          text
          disabled={!canCancel}
          onClick={() => console.log('[E-Invoice] Cancel IRN for', r.invoiceNo)}
        />
      </div>
    );
  };

  const footer = (
    <div className="flex justify-content-end gap-5 font-semibold">
      <span>Taxable: {inr(totals.taxable)}</span>
      <span>Tax: {inr(totals.tax)}</span>
      <span>Total: {inr(totals.total)}</span>
    </div>
  );

  const onExport = (kind: 'excel' | 'csv' | 'pdf' | 'print') => {
    console.log('[E-Invoice] export', kind, { filters, statusFilter, search, rows: filtered.length });
    if (kind === 'print') window.print();
  };

  const branchOptions = [
    { label: 'All Branches', value: '' },
    { label: 'Head Office', value: 'HO' },
    { label: 'Branch A', value: 'BR-A' },
    { label: 'Branch B', value: 'BR-B' }
  ];

  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Generated', value: 'Generated' },
    { label: 'Uploaded', value: 'Uploaded' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Error', value: 'Error' }
  ];

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="GST • E-Invoice"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[E-Invoice] refresh', filters)}
          onExport={onExport}
          rightExtra={
            <div className="flex align-items-center gap-2">
              <Dropdown
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => setStatusFilter(e.value)}
                placeholder="Status"
                className="w-12rem"
              />
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice/party/IRN" />
              </span>
            </div>
          }
        />
      </div>

      <div className="col-12">
        <Card>
          <DataTable value={filtered} size="small" showGridlines stripedRows paginator rows={10} footer={footer}>
            <Column header="Doc" body={docTypeTag} style={{ width: 120 }} />
            <Column field="invoiceNo" header="Invoice No" sortable style={{ width: 140 }} />
            <Column field="date" header="Date" sortable style={{ width: 130 }} />
            <Column field="party" header="Party" sortable />
            <Column header="Taxable" align="right" body={(r: InvoiceRow) => <span className="w-full text-right">{inr(r.taxable)}</span>} />
            <Column header="Tax" align="right" body={(r: InvoiceRow) => <span className="w-full text-right">{inr(r.tax)}</span>} />
            <Column header="Total" align="right" body={(r: InvoiceRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
            <Column field="irn" header="IRN (masked)" />
            <Column field="ackNo" header="Ack No" style={{ width: 160 }} />
            <Column header="Status" body={statusTag} style={{ width: 130 }} />
            <Column header="Actions" body={actionsTemplate} style={{ minWidth: 360 }} />
          </DataTable>
        </Card>
      </div>

      <FilterSidebar
        visible={showFilters}
        onHide={() => setShowFilters(false)}
        value={filters}
        onChange={setFilters}
        branches={branchOptions}
        title="E-Invoice Filters"
      />
    </div>
  );
}