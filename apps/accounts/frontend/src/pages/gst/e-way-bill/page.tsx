import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

type EwbRow = {
  id: string;
  ewbNo?: string;
  date: string; // dd-MMM-yy
  docType: 'INV' | 'CHL' | 'OTH';
  docNo: string;
  from: string;
  to: string;
  vehicle?: string;
  distanceKm: number;
  validity: string; // e.g. 01-Aug-25 23:59
  status: 'Pending' | 'Generated' | 'Expired' | 'Cancelled' | 'Error';
  remarks?: string;
};

const inr = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GSTEWayBillRoute() {
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const rows = useMemo<EwbRow[]>(
    () => [
      {
        id: crypto.randomUUID(),
        ewbNo: '141000123456',
        date: '01-Aug-25',
        docType: 'INV',
        docNo: 'S-1001',
        from: 'Pune, MH',
        to: 'Ahmedabad, GJ',
        vehicle: 'MH12AB1234',
        distanceKm: 650,
        validity: '03-Aug-25 23:59',
        status: 'Generated'
      },
      {
        id: crypto.randomUUID(),
        date: '01-Aug-25',
        docType: 'INV',
        docNo: 'S-1002',
        from: 'Pune, MH',
        to: 'Mumbai, MH',
        vehicle: 'MH12XY9876',
        distanceKm: 160,
        validity: '02-Aug-25 23:59',
        status: 'Expired'
      },
      {
        id: crypto.randomUUID(),
        ewbNo: '141000778899',
        date: '02-Aug-25',
        docType: 'CHL',
        docNo: 'CH-001',
        from: 'Surat, GJ',
        to: 'Navi Mumbai, MH',
        vehicle: 'GJ05AA5555',
        distanceKm: 280,
        validity: '04-Aug-25 23:59',
        status: 'Cancelled'
      },
      {
        id: crypto.randomUUID(),
        date: '02-Aug-25',
        docType: 'INV',
        docNo: 'S-1003',
        from: 'Pune, MH',
        to: 'Delhi, DL',
        distanceKm: 1420,
        validity: '05-Aug-25 23:59',
        status: 'Pending',
        remarks: 'Vehicle not assigned'
      },
      {
        id: crypto.randomUUID(),
        date: '02-Aug-25',
        docType: 'INV',
        docNo: 'S-1004',
        from: 'Mumbai, MH',
        to: 'Hyd, TS',
        vehicle: 'MH14CD4321',
        distanceKm: 710,
        validity: '04-Aug-25 23:59',
        status: 'Error',
        remarks: 'Invalid PIN code'
      }
    ],
    []
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (search) {
        const hay = `${r.ewbNo ?? ''} ${r.docNo} ${r.from} ${r.to} ${r.vehicle ?? ''}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, statusFilter, search]);

  const totals = useMemo(
    () => ({
      count: filtered.length,
      distanceKm: filtered.reduce((a, r) => a + r.distanceKm, 0)
    }),
    [filtered]
  );

  const statusTag = (r: EwbRow) => {
    const map: Record<EwbRow['status'], { label: string; severity: 'success' | 'warning' | 'info' | 'danger' | null }> = {
      Pending: { label: 'Pending', severity: 'warning' },
      Generated: { label: 'Generated', severity: 'success' },
      Expired: { label: 'Expired', severity: 'warning' },
      Cancelled: { label: 'Cancelled', severity: 'info' },
      Error: { label: 'Error', severity: 'danger' }
    };
    const s = map[r.status];
    return <Tag value={s.label} severity={s.severity} />;
  };

  const docTypeTag = (r: EwbRow) => {
    const map: Record<EwbRow['docType'], string> = { INV: 'Invoice', CHL: 'Challan', OTH: 'Other' };
    const severity: 'success' | 'warning' | 'info' | 'danger' | null =
      r.docType === 'INV' ? 'success' : r.docType === 'CHL' ? 'info' : 'warning';
    return <Tag value={map[r.docType]} severity={severity} />;
  };

  const actionsTemplate = (r: EwbRow) => {
    const canGenerate = r.status === 'Pending' || r.status === 'Error';
    const canExtend = r.status === 'Generated';
    const canCancel = r.status === 'Generated';

    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-cog"
          label="Generate"
          size="small"
          outlined
          disabled={!canGenerate}
          onClick={() => console.log('[E-Way] Generate for', r.docNo)}
        />
        <Button
          icon="pi pi-clock"
          label="Extend"
          size="small"
          outlined
          disabled={!canExtend}
          onClick={() => console.log('[E-Way] Extend validity for', r.ewbNo ?? r.docNo)}
        />
        <Button
          icon="pi pi-times"
          label="Cancel"
          size="small"
          severity="danger"
          text
          disabled={!canCancel}
          onClick={() => console.log('[E-Way] Cancel for', r.ewbNo ?? r.docNo)}
        />
      </div>
    );
  };

  const footer = (
    <div className="flex justify-content-between font-semibold">
      <span>Total Records: {totals.count}</span>
      <span>Total Distance: {totals.distanceKm} km</span>
    </div>
  );

  const onExport = (kind: 'excel' | 'csv' | 'pdf' | 'print') => {
    console.log('[E-Way Bill] export', kind, { filters, statusFilter, search, rows: filtered.length });
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
    { label: 'Expired', value: 'Expired' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Error', value: 'Error' }
  ];

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="GST • E-Way Bill"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[E-Way Bill] refresh', filters)}
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
                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search EWB/Doc/Vehicle/City" />
              </span>
            </div>
          }
        />
      </div>

      <div className="col-12">
        <Card>
          <DataTable value={filtered} size="small" showGridlines stripedRows paginator rows={10} footer={footer}>
            <Column field="ewbNo" header="EWB No" style={{ width: 160 }} />
            <Column header="Doc" body={docTypeTag} style={{ width: 120 }} />
            <Column field="docNo" header="Doc No" sortable style={{ width: 140 }} />
            <Column field="date" header="Date" sortable style={{ width: 130 }} />
            <Column field="from" header="From" sortable />
            <Column field="to" header="To" sortable />
            <Column field="vehicle" header="Vehicle" style={{ width: 140 }} />
            <Column field="distanceKm" header="Distance (km)" align="right" style={{ width: 140 }} />
            <Column field="validity" header="Valid Till" style={{ width: 160 }} />
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
        title="E-Way Bill Filters"
      />
    </div>
  );
}