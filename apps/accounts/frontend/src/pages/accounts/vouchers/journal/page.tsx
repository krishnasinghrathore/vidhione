import React, { useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import ReportToolbar from '../../../../components/report/ReportToolbar';

type AllocationRow = {
  id: string;
  ledger: string;
  debit: number;
  credit: number;
  narration?: string;
};

type JournalVoucher = {
  date: Date | null;
  series: string;
  voucherNo: string;
  branch: string | null;
  narration?: string;
  allocations: AllocationRow[];
};

const inr = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const branches = [
  { label: 'Head Office', value: 'HO' },
  { label: 'Branch A', value: 'BR-A' },
  { label: 'Branch B', value: 'BR-B' }
];

export default function AccountsVoucherJournalRoute() {
  const [voucher, setVoucher] = useState<JournalVoucher>({
    date: new Date(),
    series: 'JRN',
    voucherNo: '0001',
    branch: 'HO',
    narration: '',
    allocations: [
      { id: crypto.randomUUID(), ledger: 'Adjustment A/c', debit: 0, credit: 0 },
      { id: crypto.randomUUID(), ledger: 'Provision A/c', debit: 0, credit: 0 }
    ]
  });

  const totals = useMemo(
    () => ({
      debit: voucher.allocations.reduce((a, r) => a + (Number(r.debit) || 0), 0),
      credit: voucher.allocations.reduce((a, r) => a + (Number(r.credit) || 0), 0)
    }),
    [voucher.allocations]
  );

  const balanced = Math.abs(totals.debit - totals.credit) < 0.005;

  const updateHeader = <K extends keyof JournalVoucher>(key: K, value: JournalVoucher[K]) =>
    setVoucher((v) => ({ ...v, [key]: value }));

  const updateRow = (id: string, patch: Partial<AllocationRow>) =>
    setVoucher((v) => ({
      ...v,
      allocations: v.allocations.map((r) => (r.id === id ? { ...r, ...patch } : r))
    }));

  const addRow = () =>
    setVoucher((v) => ({
      ...v,
      allocations: [...v.allocations, { id: crypto.randomUUID(), ledger: '', debit: 0, credit: 0 }]
    }));

  const removeRow = (id: string) =>
    setVoucher((v) => ({ ...v, allocations: v.allocations.filter((r) => r.id !== id) }));

  const clearAll = () =>
    setVoucher({
      date: new Date(),
      series: 'JRN',
      voucherNo: '',
      branch: null,
      narration: '',
      allocations: [{ id: crypto.randomUUID(), ledger: '', debit: 0, credit: 0 }]
    });

  const onSave = () => {
    const payload = { ...voucher, totals, balanced };
    console.log('[Journal Voucher] save', payload);
    alert(`Saved Journal Voucher (mock)\nTotal Dr: ${inr(totals.debit)}  Total Cr: ${inr(totals.credit)}\nBalanced: ${balanced ? 'Yes' : 'No'}`);
  };

  const right = (
    <div className="flex align-items-center gap-2">
      <Tag value={balanced ? 'Balanced' : 'Unbalanced'} severity={balanced ? 'success' : 'danger'} />
      <Button label="Add Row" icon="pi pi-plus" onClick={addRow} />
      <Button label="Reset" icon="pi pi-refresh" severity="secondary" onClick={clearAll} />
      <Button label="Save" icon="pi pi-save" severity="success" onClick={onSave} />
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar
          title="Accounts • Voucher Entry — Journal"
          rightExtra={right}
          onExport={(k) => console.log('[Journal Voucher] export', k)}
        />
      </div>

      {/* Header */}
      <div className="col-12">
        <Card>
          <div className="grid formgrid p-fluid">
            <div className="col-12 md:col-2">
              <label className="block mb-2">Date</label>
              <Calendar value={voucher.date} onChange={(e) => updateHeader('date', e.value as Date)} showIcon dateFormat="dd-M-yy" />
            </div>
            <div className="col-6 md:col-2">
              <label className="block mb-2">Series</label>
              <InputText value={voucher.series} onChange={(e) => updateHeader('series', e.target.value)} />
            </div>
            <div className="col-6 md:col-2">
              <label className="block mb-2">Voucher No</label>
              <InputText value={voucher.voucherNo} onChange={(e) => updateHeader('voucherNo', e.target.value)} />
            </div>
            <div className="col-12 md:col-3">
              <label className="block mb-2">Branch</label>
              <Dropdown value={voucher.branch} options={branches} onChange={(e) => updateHeader('branch', e.value)} placeholder="Select Branch" />
            </div>
            <div className="col-12">
              <label className="block mb-2">Narration</label>
              <InputText value={voucher.narration} onChange={(e) => updateHeader('narration', e.target.value)} placeholder="Narration" />
            </div>
          </div>
        </Card>
      </div>

      {/* Allocations */}
      <div className="col-12">
        <Card title="Allocations">
          <DataTable value={voucher.allocations} size="small" showGridlines stripedRows>
            <Column header="#" body={(_, o) => <span>{(o.rowIndex ?? 0) + 1}</span>} style={{ width: 60, textAlign: 'center' }} />
            <Column
              header="Ledger"
              body={(row: AllocationRow) => (
                <InputText value={row.ledger} onChange={(e) => updateRow(row.id, { ledger: e.target.value })} placeholder="Ledger Name" />
              )}
            />
            <Column
              header="Debit"
              body={(row: AllocationRow) => (
                <InputNumber
                  value={row.debit}
                  onValueChange={(e) => updateRow(row.id, { debit: e.value ?? 0 })}
                  mode="decimal"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  className="w-full"
                />
              )}
              style={{ width: 180 }}
            />
            <Column
              header="Credit"
              body={(row: AllocationRow) => (
                <InputNumber
                  value={row.credit}
                  onValueChange={(e) => updateRow(row.id, { credit: e.value ?? 0 })}
                  mode="decimal"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  className="w-full"
                />
              )}
              style={{ width: 180 }}
            />
            <Column
              header="Narration"
              body={(row: AllocationRow) => (
                <InputText
                  value={row.narration ?? ''}
                  onChange={(e) => updateRow(row.id, { narration: e.target.value })}
                  placeholder="Row Narration (optional)"
                />
              )}
            />
            <Column
              header=""
              body={(row: AllocationRow) => <Button icon="pi pi-trash" severity="danger" text rounded onClick={() => removeRow(row.id)} />}
              style={{ width: 80, textAlign: 'center' }}
            />
          </DataTable>

          <div className="mt-3 flex justify-content-end gap-3 font-semibold">
            <div>Total Debit: {inr(totals.debit)}</div>
            <div>Total Credit: {inr(totals.credit)}</div>
            <div>
              Diff: <Tag value={inr(Math.abs(totals.debit - totals.credit))} severity={balanced ? 'success' : 'danger'} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}