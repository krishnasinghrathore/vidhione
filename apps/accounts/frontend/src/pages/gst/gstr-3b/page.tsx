import React, { useMemo, useState } from 'react';
import ReportToolbar from '../../../components/report/ReportToolbar';
import FilterSidebar, { ReportFilters } from '../../../components/report/FilterSidebar';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';

type SuppliesRow = { section: string; taxable: number; igst: number; cgst: number; sgst: number; cess: number; total: number };
type ItcRow = { head: string; igst: number; cgst: number; sgst: number; cess: number; total: number };
type NilRow = { nature: string; intrastate: number; interstate: number; total: number };
type ThreeTwoRow = { state: string; regType: 'Unregistered' | 'Composition' | 'UIN'; taxable: number; igst: number; total: number };

const inr = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GSTGstr3bRoute() {
  const [filters, setFilters] = useState<ReportFilters>({ from: null, to: null, branch: null });
  const [showFilters, setShowFilters] = useState(false);
  const [active, setActive] = useState<number>(0);

  // Mock data per section — replace with backend later

  // 3.1 Supplies liable to tax
  const supplies = useMemo<SuppliesRow[]>(
    () => [
      { section: 'Outward taxable supplies (other than zero rated, nil rated, exempted)', taxable: 185000, igst: 18600, cgst: 16650, sgst: 16650, cess: 0, total: 236900 },
      { section: 'Outward taxable supplies (zero rated)', taxable: 42000, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 42000 },
      { section: 'Other outward supplies (Nil rated, exempted)', taxable: 12500, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 12500 },
      { section: 'Inward supplies (liable to reverse charge)', taxable: 18000, igst: 3240, cgst: 0, sgst: 0, cess: 0, total: 21240 }
    ],
    []
  );

  // 4 Eligible ITC
  const itc = useMemo<ItcRow[]>(
    () => [
      { head: 'Import of goods', igst: 4200, cgst: 0, sgst: 0, cess: 0, total: 4200 },
      { head: 'Import of services', igst: 1800, cgst: 0, sgst: 0, cess: 0, total: 1800 },
      { head: 'Inward supplies (other than imports, reverse charge)', igst: 3200, cgst: 2600, sgst: 2600, cess: 0, total: 8400 },
      { head: 'Inward supplies liable to reverse charge', igst: 3240, cgst: 0, sgst: 0, cess: 0, total: 3240 }
    ],
    []
  );

  // 5 Nil rated / Non-GST inward
  const nil = useMemo<NilRow[]>(
    () => [
      { nature: 'Nil rated supplies', intrastate: 9000, interstate: 5000, total: 14000 },
      { nature: 'Exempted (Non-GST) supplies', intrastate: 3500, interstate: 1200, total: 4700 }
    ],
    []
  );

  // 3.2 Inter-State supplies to unregistered/composition/UIN holders
  const threeTwo = useMemo<ThreeTwoRow[]>(
    () => [
      { state: 'MH', regType: 'Unregistered', taxable: 28000, igst: 5040, total: 33040 },
      { state: 'GJ', regType: 'Composition', taxable: 9000, igst: 1620, total: 10620 },
      { state: 'DL', regType: 'UIN', taxable: 6500, igst: 1170, total: 7670 }
    ],
    []
  );

  const totals31 = useMemo(
    () => ({
      taxable: supplies.reduce((a, r) => a + r.taxable, 0),
      igst: supplies.reduce((a, r) => a + r.igst, 0),
      cgst: supplies.reduce((a, r) => a + r.cgst, 0),
      sgst: supplies.reduce((a, r) => a + r.sgst, 0),
      cess: supplies.reduce((a, r) => a + r.cess, 0),
      total: supplies.reduce((a, r) => a + r.total, 0)
    }),
    [supplies]
  );

  const totals4 = useMemo(
    () => ({
      igst: itc.reduce((a, r) => a + r.igst, 0),
      cgst: itc.reduce((a, r) => a + r.cgst, 0),
      sgst: itc.reduce((a, r) => a + r.sgst, 0),
      cess: itc.reduce((a, r) => a + r.cess, 0),
      total: itc.reduce((a, r) => a + r.total, 0)
    }),
    [itc]
  );

  const totals5 = useMemo(
    () => ({
      intrastate: nil.reduce((a, r) => a + r.intrastate, 0),
      interstate: nil.reduce((a, r) => a + r.interstate, 0),
      total: nil.reduce((a, r) => a + r.total, 0)
    }),
    [nil]
  );

  const totals32 = useMemo(
    () => ({
      taxable: threeTwo.reduce((a, r) => a + r.taxable, 0),
      igst: threeTwo.reduce((a, r) => a + r.igst, 0),
      total: threeTwo.reduce((a, r) => a + r.total, 0)
    }),
    [threeTwo]
  );

  const onExport = (kind: 'excel' | 'csv' | 'pdf' | 'print') => {
    console.log('[GSTR-3B] export', kind, { filters, activeTab: active });
    if (kind === 'print') window.print();
  };

  const branchOptions = [
    { label: 'All Branches', value: '' },
    { label: 'Head Office', value: 'HO' },
    { label: 'Branch A', value: 'BR-A' },
    { label: 'Branch B', value: 'BR-B' }
  ];

  const sectionBadge = <Tag value={['3.1 Supplies', '4 Eligible ITC', '5 Nil Inward', '3.2 Inter-State'][active]} severity="info" />;

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="GST • GSTR-3B"
          onToggleFilters={() => setShowFilters(true)}
          onRefresh={() => console.log('[GSTR-3B] refresh', filters)}
          onExport={onExport}
          rightExtra={<div className="flex align-items-center gap-2">{sectionBadge}</div>}
        />
      </div>

      <div className="col-12">
        <Card>
          <TabView activeIndex={active} onTabChange={(e) => setActive(e.index)}>
            <TabPanel header="3.1 Supplies liable to tax">
              <DataTable value={supplies} size="small" showGridlines stripedRows footer={
                <div className="flex justify-content-end gap-4 font-semibold">
                  <span>Taxable: {inr(totals31.taxable)}</span>
                  <span>IGST: {inr(totals31.igst)}</span>
                  <span>CGST: {inr(totals31.cgst)}</span>
                  <span>SGST: {inr(totals31.sgst)}</span>
                  <span>CESS: {inr(totals31.cess)}</span>
                  <span>Total: {inr(totals31.total)}</span>
                </div>
              }>
                <Column field="section" header="Section" />
                <Column header="Taxable" align="right" body={(r: SuppliesRow) => <span className="w-full text-right">{inr(r.taxable)}</span>} />
                <Column header="IGST" align="right" body={(r: SuppliesRow) => <span className="w-full text-right">{inr(r.igst)}</span>} />
                <Column header="CGST" align="right" body={(r: SuppliesRow) => <span className="w-full text-right">{inr(r.cgst)}</span>} />
                <Column header="SGST" align="right" body={(r: SuppliesRow) => <span className="w-full text-right">{inr(r.sgst)}</span>} />
                <Column header="CESS" align="right" body={(r: SuppliesRow) => <span className="w-full text-right">{inr(r.cess)}</span>} />
                <Column header="Total" align="right" body={(r: SuppliesRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
              </DataTable>
            </TabPanel>

            <TabPanel header="4 Eligible ITC">
              <DataTable value={itc} size="small" showGridlines stripedRows footer={
                <div className="flex justify-content-end gap-4 font-semibold">
                  <span>IGST: {inr(totals4.igst)}</span>
                  <span>CGST: {inr(totals4.cgst)}</span>
                  <span>SGST: {inr(totals4.sgst)}</span>
                  <span>CESS: {inr(totals4.cess)}</span>
                  <span>Total: {inr(totals4.total)}</span>
                </div>
              }>
                <Column field="head" header="Head" />
                <Column header="IGST" align="right" body={(r: ItcRow) => <span className="w-full text-right">{inr(r.igst)}</span>} />
                <Column header="CGST" align="right" body={(r: ItcRow) => <span className="w-full text-right">{inr(r.cgst)}</span>} />
                <Column header="SGST" align="right" body={(r: ItcRow) => <span className="w-full text-right">{inr(r.sgst)}</span>} />
                <Column header="CESS" align="right" body={(r: ItcRow) => <span className="w-full text-right">{inr(r.cess)}</span>} />
                <Column header="Total" align="right" body={(r: ItcRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
              </DataTable>
            </TabPanel>

            <TabPanel header="5 NIL rated / Non-GST inward">
              <DataTable value={nil} size="small" showGridlines stripedRows footer={
                <div className="flex justify-content-end gap-4 font-semibold">
                  <span>Intra-state: {inr(totals5.intrastate)}</span>
                  <span>Inter-state: {inr(totals5.interstate)}</span>
                  <span>Total: {inr(totals5.total)}</span>
                </div>
              }>
                <Column field="nature" header="Nature" />
                <Column header="Intra-state" align="right" body={(r: NilRow) => <span className="w-full text-right">{inr(r.intrastate)}</span>} />
                <Column header="Inter-state" align="right" body={(r: NilRow) => <span className="w-full text-right">{inr(r.interstate)}</span>} />
                <Column header="Total" align="right" body={(r: NilRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
              </DataTable>
            </TabPanel>

            <TabPanel header="3.2 Inter-State supplies">
              <DataTable value={threeTwo} size="small" showGridlines stripedRows footer={
                <div className="flex justify-content-end gap-4 font-semibold">
                  <span>Taxable: {inr(totals32.taxable)}</span>
                  <span>IGST: {inr(totals32.igst)}</span>
                  <span>Total: {inr(totals32.total)}</span>
                </div>
              }>
                <Column field="state" header="State" />
                <Column field="regType" header="Category" />
                <Column header="Taxable" align="right" body={(r: ThreeTwoRow) => <span className="w-full text-right">{inr(r.taxable)}</span>} />
                <Column header="IGST" align="right" body={(r: ThreeTwoRow) => <span className="w-full text-right">{inr(r.igst)}</span>} />
                <Column header="Total" align="right" body={(r: ThreeTwoRow) => <span className="w-full text-right">{inr(r.total)}</span>} />
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
        title="GSTR-3B Filters"
      />
    </div>
  );
}