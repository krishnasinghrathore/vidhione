import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';

type B2BRow = { gstin: string; invoiceNo: string; date: string; taxable: number; tax: number; total: number };
type B2CSRow = { place: string; rate: number; taxable: number; tax: number; total: number };
type HSNRow = { hsn: string; description: string; uqc: string; qty: number; taxable: number; tax: number; total: number };

const inr = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GSTGstr1Route() {
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);
  const [active, setActive] = useState<number>(0);

  // Mock datasets (replace with backend feeds)
  const b2b = useMemo<B2BRow[]>(
    () => [
      { gstin: '27ABCDE1234F1Z5', invoiceNo: 'S-1001', date: '01-Aug-25', taxable: 120000, tax: 21600, total: 141600 },
      { gstin: '24PQRSX9876L1Z2', invoiceNo: 'S-1002', date: '02-Aug-25', taxable: 45000, tax: 8100, total: 53100 }
    ],
    []
  );
  const b2cs = useMemo<B2CSRow[]>(
    () => [
      { place: 'MH', rate: 18, taxable: 21000, tax: 3780, total: 24780 },
      { place: 'GJ', rate: 12, taxable: 18000, tax: 2160, total: 20160 }
    ],
    []
  );
  const hsn = useMemo<HSNRow[]>(
    () => [
      { hsn: '8409', description: 'Parts suitable for engines', uqc: 'NOS', qty: 42, taxable: 82000, tax: 14760, total: 96760 },
      { hsn: '8483', description: 'Transmission shafts & cranks', uqc: 'NOS', qty: 16, taxable: 56000, tax: 10080, total: 66080 }
    ],
    []
  );

  const b2bTotals = useMemo(
    () => ({
      taxable: b2b.reduce((a, r) => a + r.taxable, 0),
      tax: b2b.reduce((a, r) => a + r.tax, 0),
      total: b2b.reduce((a, r) => a + r.total, 0)
    }),
    [b2b]
  );
  const b2csTotals = useMemo(
    () => ({
      taxable: b2cs.reduce((a, r) => a + r.taxable, 0),
      tax: b2cs.reduce((a, r) => a + r.tax, 0),
      total: b2cs.reduce((a, r) => a + r.total, 0)
    }),
    [b2cs]
  );
  const hsnTotals = useMemo(
    () => ({
      qty: hsn.reduce((a, r) => a + r.qty, 0),
      taxable: hsn.reduce((a, r) => a + r.taxable, 0),
      tax: hsn.reduce((a, r) => a + r.tax, 0),
      total: hsn.reduce((a, r) => a + r.total, 0)
    }),
    [hsn]
  );

  const onExport = (kind: 'excel' | 'csv' | 'pdf' | 'print') => {
    console.log('[GSTR-1] export', kind, { filters, activeTab: active });
    if (kind === 'print') window.print();
  };

  const branchOptions = [
    { label: 'All Branches', value: '' },
    { label: 'Head Office', value: 'HO' },
    { label: 'Branch A', value: 'BR-A' },
    { label: 'Branch B', value: 'BR-B' }
  ];

  const sectionBadge = <Tag value={['B2B', 'B2CS', 'HSN'][active]} severity="info" />;

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="GST • GSTR-1"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[GSTR-1] refresh', filters)}
          onExport={onExport}
          rightExtra={<div className="flex align-items-center gap-2">{sectionBadge}</div>}
        />
      </div>

      <div className="col-12">
        <Card>
          <TabView activeIndex={active} onTabChange={(e) => setActive(e.index)}>
            <TabPanel header="B2B">
              <DataTable value={b2b} size="small" showGridlines stripedRows footer={
                <div className="flex justify-content-end gap-5 font-semibold">
                  <span>Taxable: {inr(b2bTotals.taxable)}</span>
                  <span>Tax: {inr(b2bTotals.tax)}</span>
                  <span>Total: {inr(b2bTotals.total)}</span>
                </div>
              }>
                <Column field="gstin" header="GSTIN" />
                <Column field="invoiceNo" header="Invoice No" />
                <Column field="date" header="Date" />
                <Column header="Taxable" align="right" body={(r: B2BRow) => <span className="w-full text-right">{inr(r.taxable)}</span>} />
                <Column header="Tax" align="right" body={(r: B2BRow) => <span className="w-full text-right">{inr(r.tax)}</span>} />
                <Column header="Total" align="right" body={(r: B2BRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
              </DataTable>
            </TabPanel>

            <TabPanel header="B2CS">
              <DataTable value={b2cs} size="small" showGridlines stripedRows footer={
                <div className="flex justify-content-end gap-5 font-semibold">
                  <span>Taxable: {inr(b2csTotals.taxable)}</span>
                  <span>Tax: {inr(b2csTotals.tax)}</span>
                  <span>Total: {inr(b2csTotals.total)}</span>
                </div>
              }>
                <Column field="place" header="State" />
                <Column field="rate" header="Rate %" align="right" />
                <Column header="Taxable" align="right" body={(r: B2CSRow) => <span className="w-full text-right">{inr(r.taxable)}</span>} />
                <Column header="Tax" align="right" body={(r: B2CSRow) => <span className="w-full text-right">{inr(r.tax)}</span>} />
                <Column header="Total" align="right" body={(r: B2CSRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
              </DataTable>
            </TabPanel>

            <TabPanel header="HSN Summary">
              <DataTable value={hsn} size="small" showGridlines stripedRows footer={
                <div className="flex justify-content-end gap-5 font-semibold">
                  <span>Qty: {hsnTotals.qty}</span>
                  <span>Taxable: {inr(hsnTotals.taxable)}</span>
                  <span>Tax: {inr(hsnTotals.tax)}</span>
                  <span>Total: {inr(hsnTotals.total)}</span>
                </div>
              }>
                <Column field="hsn" header="HSN" />
                <Column field="description" header="Description" />
                <Column field="uqc" header="UQC" />
                <Column field="qty" header="Qty" align="right" />
                <Column header="Taxable" align="right" body={(r: HSNRow) => <span className="w-full text-right">{inr(r.taxable)}</span>} />
                <Column header="Tax" align="right" body={(r: HSNRow) => <span className="w-full text-right">{inr(r.tax)}</span>} />
                <Column header="Total" align="right" body={(r: HSNRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
              </DataTable>
            </TabPanel>
          </TabView>
        </Card>
      </div>

      <FilterSidebar
        visible={showFilters}
        onHide={() => setShowFilters(false)}
        value={filters}
        onChange={setFilters}
        branches={branchOptions}
        title="GSTR-1 Filters"
      />
    </div>
  );
}