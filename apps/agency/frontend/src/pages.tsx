import React, { useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import ReportToolbar from './components/report/ReportToolbar';

/**
 * Dashboard (references/Screenshosts/Agencies/Dashboard.png)
 */
export function AgencyDashboardPage() {
  const cards = [
    { title: 'Due Invoices (Month Wise)', value: '123', icon: 'pi pi-file', color: 'info' as const },
    { title: 'Due Estimate (Month Wise)', value: '5', icon: 'pi pi-calendar', color: 'warning' as const },
    { title: 'Delivery Process (Month Wise)', value: '122', icon: 'pi pi-truck', color: 'success' as const },
    { title: 'Delivery Process (Day Wise)', value: '18', icon: 'pi pi-clock', color: 'danger' as const }
  ];
  return (
    <div className="grid">
      <div className="col-12">
        <Card>
          <div className="text-2xl font-semibold mb-1">Sohan Agencies [2024-2025]</div>
          <div className="text-600">Summary snapshot based on provided reference</div>
        </Card>
      </div>
      {cards.map((c, i) => (
        <div className="col-12 md:col-6" key={i}>
          <Card className="flex align-items-center justify-content-between">
            <div>
              <div className="text-900 font-medium mb-2">{c.title}</div>
              <div className="text-3xl font-bold">{c.value}</div>
            </div>
            <Tag value={c.title.split(' ')[0]} severity={c.color} />
          </Card>
        </div>
      ))}
    </div>
  );
}

/**
 * Masters - Item Master (tabs simplified)
 * references/Screenshosts/Agencies/Masters/Item-Master-Item-Detail.png
 * references/Screenshosts/Agencies/Masters/Item-Master-Unit-And-Tax-Details.png
 */
export function MastersItemMasterPage() {
  const [form, setForm] = useState({
    code: '',
    name: '',
    brand: '',
    group: '',
    unit: 'PCS',
    hsn: '',
    taxPct: 18,
    isActive: true
  });

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Item Master" />
      </div>
      <div className="col-12 lg:col-6">
        <Card title="Item Detail">
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-4">
              <label className="font-medium">Code</label>
              <InputText value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="field col-12 md:col-8">
              <label className="font-medium">Name</label>
              <InputText value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Brand</label>
              <InputText value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Group</label>
              <InputText value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} />
            </div>
            <div className="field-checkbox col-12">
              <Checkbox
                inputId="active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: !!e.checked })}
              />
              <label htmlFor="active">Active</label>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12 lg:col-6">
        <Card title="Unit and Tax Details">
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="font-medium">Unit</label>
              <Dropdown
                value={form.unit}
                options={['PCS', 'BOX', 'KG', 'MTR']}
                onChange={(e) => setForm({ ...form, unit: e.value })}
              />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">HSN Code</label>
              <InputText value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Tax %</label>
              <InputNumber
                value={form.taxPct}
                onValueChange={(e) => setForm({ ...form, taxPct: e.value || 0 })}
                min={0}
                max={28}
                suffix="%"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <div className="flex gap-2">
          <Button label="Save" icon="pi pi-save" />
          <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
        </div>
      </div>
    </div>
  );
}

/**
 * Masters - Ledger Master (tabs simplified)
 * references/Screenshosts/Agencies/Masters/Ledger-Master-*.png
 */
export function MastersLedgerMasterPage() {
  const [ledger, setLedger] = useState({
    name: '',
    group: '',
    gstin: '',
    phone: '',
    email: '',
    address1: '',
    city: '',
    state: 'Gujarat',
    opening: 0
  });

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Ledger Master" />
      </div>
      <div className="col-12 lg:col-6">
        <Card title="Ledger Info">
          <div className="p-fluid formgrid grid">
            <div className="field col-12">
              <label className="font-medium">Name</label>
              <InputText value={ledger.name} onChange={(e) => setLedger({ ...ledger, name: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Group</label>
              <InputText value={ledger.group} onChange={(e) => setLedger({ ...ledger, group: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Opening Balance</label>
              <InputNumber
                value={ledger.opening}
                onValueChange={(e) => setLedger({ ...ledger, opening: e.value || 0 })}
                mode="currency"
                currency="INR"
                locale="en-IN"
              />
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 lg:col-6">
        <Card title="Address / Tax / Contact">
          <div className="p-fluid formgrid grid">
            <div className="field col-12">
              <label className="font-medium">Address</label>
              <InputText value={ledger.address1} onChange={(e) => setLedger({ ...ledger, address1: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">City</label>
              <InputText value={ledger.city} onChange={(e) => setLedger({ ...ledger, city: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">State</label>
              <InputText value={ledger.state} onChange={(e) => setLedger({ ...ledger, state: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">GSTIN</label>
              <InputText value={ledger.gstin} onChange={(e) => setLedger({ ...ledger, gstin: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Phone</label>
              <InputText value={ledger.phone} onChange={(e) => setLedger({ ...ledger, phone: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Email</label>
              <InputText value={ledger.email} onChange={(e) => setLedger({ ...ledger, email: e.target.value })} />
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12">
        <div className="flex gap-2">
          <Button label="Save" icon="pi pi-save" />
          <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
        </div>
      </div>
    </div>
  );
}

/**
 * Reports - Sale Book (grid)
 * references/Screenshosts/Agencies/Reports/Sale-Book.png
 */
export function ReportsSaleBookPage() {
  const [q, setQ] = useState('');
  const rows = useMemo(() => [], []);
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Sale Book" />
      </div>
      <div className="col-12">
        <Card>
          <div className="flex align-items-center gap-2 mb-3">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText placeholder="Search invoice no, party..." value={q} onChange={(e) => setQ(e.target.value)} />
            </span>
            <Calendar placeholder="From" showIcon />
            <Calendar placeholder="To" showIcon />
          </div>
          <DataTable value={rows} emptyMessage="No sale rows found." scrollable scrollHeight="400px">
            <Column field="date" header="Date" />
            <Column field="invoice" header="Invoice" />
            <Column field="party" header="Party" />
            <Column field="taxable" header="Taxable" />
            <Column field="tax" header="Tax" />
            <Column field="total" header="Total" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Purchase Book (grid)
 * references/Screenshosts/Agencies/Reports/Purchase-Book.png
 */
export function ReportsPurchaseBookPage() {
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Purchase Book" />
      </div>
      <div className="col-12">
        <Card>
          <DataTable value={rows} emptyMessage="No purchase rows found." scrollable scrollHeight="400px">
            <Column field="date" header="Date" />
            <Column field="bill" header="Bill No" />
            <Column field="supplier" header="Supplier" />
            <Column field="taxable" header="Taxable" />
            <Column field="tax" header="Tax" />
            <Column field="total" header="Total" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Stock Position (grid)
 * references/Screenshosts/Agencies/Reports/Stock-Position.png
 */
export function ReportsStockPositionPage() {
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Stock Position" />
      </div>
      <div className="col-12">
        <Card>
          <DataTable value={rows} emptyMessage="No stock rows found." scrollable scrollHeight="400px">
            <Column field="item" header="Item" />
            <Column field="uom" header="UOM" />
            <Column field="qty" header="Qty" />
            <Column field="rate" header="Rate" />
            <Column field="value" header="Value" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Sales Invoice (form + grid)
 * references/Screenshosts/Agencies/Transactions/Sales-Invoice.png
 */
export function TransactionsSalesInvoicePage() {
  const [header, setHeader] = useState({ date: new Date(), series: 'S', number: '', party: '' });
  const [rows, setRows] = useState<{ item: string; qty: number; rate: number; amount: number }[]>([]);
  const addRow = () => setRows([...rows, { item: '', qty: 0, rate: 0, amount: 0 }]);

  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Sales Invoice" />
      </div>
      <div className="col-12">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-3">
              <label className="font-medium">Date</label>
              <Calendar value={header.date} onChange={(e) => setHeader({ ...header, date: e.value as Date })} showIcon />
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-medium">Series</label>
              <InputText value={header.series} onChange={(e) => setHeader({ ...header, series: e.target.value })} />
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-medium">No.</label>
              <InputText value={header.number} onChange={(e) => setHeader({ ...header, number: e.target.value })} />
            </div>
            <div className="field col-12 md:col-5">
              <label className="font-medium">Party</label>
              <InputText value={header.party} onChange={(e) => setHeader({ ...header, party: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-content-between align-items-center mb-2">
            <div className="text-lg font-medium">Items</div>
            <Button label="Add Row" icon="pi pi-plus" size="small" onClick={addRow} />
          </div>

          <DataTable value={rows} emptyMessage="No item rows.">
            <Column
              field="item"
              header="Item"
              body={(r, opts) => (
                <InputText
                  value={r.item}
                  onChange={(e) => {
                    const v = e.target.value;
                    const copy = [...rows];
                    copy[opts.rowIndex].item = v;
                    setRows(copy);
                  }}
                />
              )}
            />
            <Column
              field="qty"
              header="Qty"
              body={(r, opts) => (
                <InputNumber
                  value={r.qty}
                  onValueChange={(e) => {
                    const val = e.value || 0;
                    const copy = [...rows];
                    copy[opts.rowIndex].qty = val;
                    copy[opts.rowIndex].amount = (copy[opts.rowIndex].rate || 0) * val;
                    setRows(copy);
                  }}
                />
              )}
            />
            <Column
              field="rate"
              header="Rate"
              body={(r, opts) => (
                <InputNumber
                  value={r.rate}
                  onValueChange={(e) => {
                    const val = e.value || 0;
                    const copy = [...rows];
                    copy[opts.rowIndex].rate = val;
                    copy[opts.rowIndex].amount = (copy[opts.rowIndex].qty || 0) * val;
                    setRows(copy);
                  }}
                  mode="currency"
                  currency="INR"
                  locale="en-IN"
                />
              )}
            />
            <Column
              field="amount"
              header="Amount"
              body={(r) => r.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            />
          </DataTable>

          <div className="flex justify-content-end mt-3 gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Purchase Invoice (form + grid)
 * references/Screenshosts/Agencies/Transactions/Purchase-Invoice.png
 */
export function TransactionsPurchaseInvoicePage() {
  const [header, setHeader] = useState({ date: new Date(), billNo: '', supplier: '' });
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Purchase Invoice" />
      </div>
      <div className="col-12">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-4">
              <label className="font-medium">Date</label>
              <Calendar value={header.date} onChange={(e) => setHeader({ ...header, date: e.value as Date })} showIcon />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">Bill No</label>
              <InputText value={header.billNo} onChange={(e) => setHeader({ ...header, billNo: e.target.value })} />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">Supplier</label>
              <InputText value={header.supplier} onChange={(e) => setHeader({ ...header, supplier: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-content-end gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Additional Features - Address Book
 * references/Screenshosts/Agencies/Additional Features/Address-Book.png
 */
export function AdditionalFeaturesAddressBookPage() {
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Address Book" />
      </div>
      <div className="col-12">
        <Card>
          <DataTable value={rows} emptyMessage="No contacts.">
            <Column field="name" header="Name" />
            <Column field="phone" header="Phone" />
            <Column field="email" header="Email" />
            <Column field="city" header="City" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Additional Features - Send Mail
 * references/Screenshosts/Agencies/Additional Features/Send-Mail.png
 */
export function AdditionalFeaturesSendMailPage() {
  const [to, setTo] = useState('');
  const [sub, setSub] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Send Mail" />
      </div>
      <div className="col-12 lg:col-8">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12">
              <label className="font-medium">To</label>
              <InputText value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="field col-12">
              <label className="font-medium">Subject</label>
              <InputText value={sub} onChange={(e) => setSub(e.target.value)} />
            </div>
            <div className="field col-12">
              <label className="font-medium">Message</label>
              <InputText value={msg} onChange={(e) => setMsg(e.target.value)} />
            </div>
          </div>
          <Button label="Send" icon="pi pi-send" />
        </Card>
      </div>
    </div>
  );
}

/**
 * Tools - Options
 * references/Screenshosts/Agencies/Tools/Options.png
 */
export function ToolsOptionsPage() {
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Options" />
      </div>
      <div className="col-12 lg:col-8">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="font-medium">Company Name</label>
              <InputText />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Financial Year</label>
              <InputText />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Default Series</label>
              <InputText />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Print Template</label>
              <InputText />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" outlined severity="secondary" />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Tools - Report Setting
 * references/Screenshosts/Agencies/Tools/Report-Setting.png
 */
export function ToolsReportSettingPage() {
  return (
    <div className="grid">
      <div className="col-12">
        <ReportToolbar title="Report Setting" />
      </div>
      <div className="col-12 lg:col-8">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="font-medium">Default Report</label>
              <InputText />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Rows Per Page</label>
              <InputNumber min={10} max={100} value={20} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Show Totals</label>
              <Dropdown options={['Yes', 'No']} value="Yes" />
            </div>
          </div>
          <Button label="Save" icon="pi pi-save" />
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - City Master
 * references/Screenshosts/Agencies/Masters/Other City Master.png
 */
export function MastersCityMasterPage() {
  const [form, setForm] = useState({ name: '', state: '', std: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="City Master" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="font-medium">City Name</label>
              <InputText value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">State</label>
              <InputText value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">STD Code</label>
              <InputText value={form.std} onChange={(e) => setForm({ ...form, std: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - State Master
 * references/Screenshosts/Agencies/Masters/Other State Master.png
 */
export function MastersStateMasterPage() {
  const [form, setForm] = useState({ name: '', code: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="State Master" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-8">
              <label className="font-medium">State Name</label>
              <InputText value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">State Code</label>
              <InputText value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - Company Details (Basic)
 * references/Screenshosts/Agencies/Masters/Company-Details-Basic-Details.png
 */
export function MastersCompanyDetailsBasicPage() {
  const [f, setF] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    finStart: new Date(),
    finEnd: new Date()
  });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Company Details - Basic" /></div>
      <div className="col-12 lg:col-8">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12">
              <label className="font-medium">Company Name</label>
              <InputText value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
            <div className="field col-12">
              <label className="font-medium">Address</label>
              <InputText value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">Phone</label>
              <InputText value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">Email</label>
              <InputText value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">GSTIN</label>
              <InputText value={f.gstin} onChange={(e) => setF({ ...f, gstin: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">FY Start</label>
              <Calendar value={f.finStart} onChange={(e) => setF({ ...f, finStart: e.value as Date })} showIcon />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">FY End</label>
              <Calendar value={f.finEnd} onChange={(e) => setF({ ...f, finEnd: e.value as Date })} showIcon />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - Company Details (Bank)
 * references/Screenshosts/Agencies/Masters/Company-Details-Bank-Details-And-More.png
 */
export function MastersCompanyDetailsBankPage() {
  const [f, setF] = useState({ bank: '', acno: '', ifsc: '', branch: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Company Details - Bank" /></div>
      <div className="col-12 lg:col-8">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="font-medium">Bank Name</label>
              <InputText value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Branch</label>
              <InputText value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Account No</label>
              <InputText value={f.acno} onChange={(e) => setF({ ...f, acno: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">IFSC</label>
              <InputText value={f.ifsc} onChange={(e) => setF({ ...f, ifsc: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - HSN Code Master
 * references/Screenshosts/Agencies/Masters/HSN-Code-Master.png
 */
export function MastersHSNCodeMasterPage() {
  const [f, setF] = useState({ hsn: '', desc: '', tax: 18, cess: 0 });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="HSN Code Master" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="font-medium">HSN Code</label>
              <InputText value={f.hsn} onChange={(e) => setF({ ...f, hsn: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Description</label>
              <InputText value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Tax %</label>
              <InputNumber value={f.tax} onValueChange={(e) => setF({ ...f, tax: e.value || 0 })} suffix="%" />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">CESS %</label>
              <InputNumber value={f.cess} onValueChange={(e) => setF({ ...f, cess: e.value || 0 })} suffix="%" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - Item Type Master
 * references/Screenshosts/Agencies/Masters/Item-Type-Master.png
 */
export function MastersItemTypeMasterPage() {
  const [f, setF] = useState({ code: '', name: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Item Type Master" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-4">
              <label className="font-medium">Code</label>
              <InputText value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
            </div>
            <div className="field col-12 md:col-8">
              <label className="font-medium">Name</label>
              <InputText value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - Transport Master
 * references/Screenshosts/Agencies/Masters/Transport-Master.png
 */
export function MastersTransportMasterPage() {
  const [f, setF] = useState({ name: '', vehicle: '', contact: '', gstin: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Transport Master" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12">
              <label className="font-medium">Transport Name</label>
              <InputText value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Vehicle No</label>
              <InputText value={f.vehicle} onChange={(e) => setF({ ...f, vehicle: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Contact</label>
              <InputText value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">GSTIN</label>
              <InputText value={f.gstin} onChange={(e) => setF({ ...f, gstin: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Masters - User Master
 * references/Screenshosts/Agencies/Masters/User-Master.png
 */
export function MastersUserMasterPage() {
  const [f, setF] = useState({ username: '', role: 'User', email: '', phone: '', active: true });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="User Master" /></div>
      <div className="col-12 lg:col-8">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-4">
              <label className="font-medium">Username</label>
              <InputText value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">Role</label>
              <Dropdown value={f.role} options={['Admin', 'Manager', 'User']} onChange={(e) => setF({ ...f, role: e.value })} />
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-medium">Active</label>
              <div><Checkbox checked={f.active} onChange={(e) => setF({ ...f, active: !!e.checked })} /></div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Email</label>
              <InputText value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium">Phone</label>
              <InputText value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Delivery Process Book
 * references/Screenshosts/Agencies/Reports/Delivery-Process-Book.png
 */
export function ReportsDeliveryProcessBookPage() {
  const [q, setQ] = useState('');
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Delivery Process Book" /></div>
      <div className="col-12">
        <Card>
          <div className="flex align-items-center gap-2 mb-3">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText placeholder="Search vehicle, party, waybill..." value={q} onChange={(e) => setQ(e.target.value)} />
            </span>
            <Calendar placeholder="From" showIcon />
            <Calendar placeholder="To" showIcon />
          </div>
          <DataTable value={rows} emptyMessage="No delivery rows found." scrollable scrollHeight="400px">
            <Column field="date" header="Date" />
            <Column field="vehicle" header="Vehicle" />
            <Column field="from" header="From" />
            <Column field="to" header="To" />
            <Column field="party" header="Party" />
            <Column field="waybill" header="Waybill" />
            <Column field="status" header="Status" />
            <Column field="qty" header="Qty" />
            <Column field="amount" header="Amount" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Party Rates Book
 * references/Screenshosts/Agencies/Reports/Party-Rates-Book.png
 */
export function ReportsPartyRatesBookPage() {
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Party Rates Book" /></div>
      <div className="col-12">
        <Card>
          <DataTable value={rows} emptyMessage="No party rates found." scrollable scrollHeight="400px">
            <Column field="party" header="Party" />
            <Column field="item" header="Item" />
            <Column field="rate" header="Rate" />
            <Column field="uom" header="UOM" />
            <Column field="from" header="Effective From" />
            <Column field="to" header="Effective To" />
            <Column field="remarks" header="Remarks" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Delivery Process
 * references/Screenshosts/Agencies/Transactions/Delivery-Process.png
 */
export function TransactionsDeliveryProcessPage() {
  const [hdr, setHdr] = useState({
    date: new Date(),
    series: 'D',
    number: '',
    party: '',
    from: '',
    to: '',
    transport: '',
    vehicle: '',
    waybill: ''
  });
  const [rows, setRows] = useState<{ item: string; qty: number; uom: string }[]>([]);
  const addRow = () => setRows([...rows, { item: '', qty: 0, uom: 'PCS' }]);

  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Delivery Process" /></div>
      <div className="col-12">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-3">
              <label className="font-medium">Date</label>
              <Calendar value={hdr.date} onChange={(e) => setHdr({ ...hdr, date: e.value as Date })} showIcon />
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-medium">Series</label>
              <InputText value={hdr.series} onChange={(e) => setHdr({ ...hdr, series: e.target.value })} />
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-medium">No.</label>
              <InputText value={hdr.number} onChange={(e) => setHdr({ ...hdr, number: e.target.value })} />
            </div>
            <div className="field col-12 md:col-5">
              <label className="font-medium">Party</label>
              <InputText value={hdr.party} onChange={(e) => setHdr({ ...hdr, party: e.target.value })} />
            </div>
            <div className="field col-12 md:col-3">
              <label className="font-medium">From</label>
              <InputText value={hdr.from} onChange={(e) => setHdr({ ...hdr, from: e.target.value })} />
            </div>
            <div className="field col-12 md:col-3">
              <label className="font-medium">To</label>
              <InputText value={hdr.to} onChange={(e) => setHdr({ ...hdr, to: e.target.value })} />
            </div>
            <div className="field col-12 md:col-3">
              <label className="font-medium">Transport</label>
              <InputText value={hdr.transport} onChange={(e) => setHdr({ ...hdr, transport: e.target.value })} />
            </div>
            <div className="field col-12 md:col-3">
              <label className="font-medium">Vehicle</label>
              <InputText value={hdr.vehicle} onChange={(e) => setHdr({ ...hdr, vehicle: e.target.value })} />
            </div>
            <div className="field col-12 md:col-3">
              <label className="font-medium">Waybill No</label>
              <InputText value={hdr.waybill} onChange={(e) => setHdr({ ...hdr, waybill: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-content-between align-items-center mb-2">
            <div className="text-lg font-medium">Items</div>
            <Button label="Add Row" icon="pi pi-plus" size="small" onClick={addRow} />
          </div>

          <DataTable value={rows} emptyMessage="No item rows.">
            <Column
              field="item"
              header="Item"
              body={(r, opts) => (
                <InputText
                  value={r.item}
                  onChange={(e) => {
                    const copy = [...rows]; copy[opts.rowIndex].item = e.target.value; setRows(copy);
                  }}
                />
              )}
            />
            <Column
              field="qty"
              header="Qty"
              body={(r, opts) => (
                <InputNumber
                  value={r.qty}
                  onValueChange={(e) => {
                    const copy = [...rows]; copy[opts.rowIndex].qty = e.value || 0; setRows(copy);
                  }}
                />
              )}
            />
            <Column
              field="uom"
              header="UOM"
              body={(r, opts) => (
                <Dropdown
                  value={r.uom}
                  options={['PCS', 'BOX', 'KG', 'MTR']}
                  onChange={(e) => {
                    const copy = [...rows]; copy[opts.rowIndex].uom = e.value; setRows(copy);
                  }}
                />
              )}
            />
          </DataTable>

          <div className="flex justify-content-end mt-3 gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Estimate
 * references/Screenshosts/Agencies/Transactions/Estimate.png
 */
export function TransactionsEstimatePage() {
  const [hdr, setHdr] = useState({ date: new Date(), series: 'E', number: '', party: '' });
  const [rows, setRows] = useState<{ item: string; qty: number; rate: number; amount: number }[]>([]);
  const addRow = () => setRows([...rows, { item: '', qty: 0, rate: 0, amount: 0 }]);

  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Estimate" /></div>
      <div className="col-12">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-3">
              <label className="font-medium">Date</label>
              <Calendar value={hdr.date} onChange={(e) => setHdr({ ...hdr, date: e.value as Date })} showIcon />
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-medium">Series</label>
              <InputText value={hdr.series} onChange={(e) => setHdr({ ...hdr, series: e.target.value })} />
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-medium">No.</label>
              <InputText value={hdr.number} onChange={(e) => setHdr({ ...hdr, number: e.target.value })} />
            </div>
            <div className="field col-12 md:col-5">
              <label className="font-medium">Party</label>
              <InputText value={hdr.party} onChange={(e) => setHdr({ ...hdr, party: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-content-between align-items-center mb-2">
            <div className="text-lg font-medium">Items</div>
            <Button label="Add Row" icon="pi pi-plus" size="small" onClick={addRow} />
          </div>

          <DataTable value={rows} emptyMessage="No item rows.">
            <Column
              field="item"
              header="Item"
              body={(r, opts) => (
                <InputText
                  value={r.item}
                  onChange={(e) => {
                    const copy = [...rows]; copy[opts.rowIndex].item = e.target.value; setRows(copy);
                  }}
                />
              )}
            />
            <Column
              field="qty"
              header="Qty"
              body={(r, opts) => (
                <InputNumber
                  value={r.qty}
                  onValueChange={(e) => {
                    const copy = [...rows]; copy[opts.rowIndex].qty = e.value || 0;
                    copy[opts.rowIndex].amount = (copy[opts.rowIndex].rate || 0) * (e.value || 0);
                    setRows(copy);
                  }}
                />
              )}
            />
            <Column
              field="rate"
              header="Rate"
              body={(r, opts) => (
                <InputNumber
                  value={r.rate}
                  onValueChange={(e) => {
                    const copy = [...rows]; copy[opts.rowIndex].rate = e.value || 0;
                    copy[opts.rowIndex].amount = (copy[opts.rowIndex].qty || 0) * (e.value || 0);
                    setRows(copy);
                  }}
                  mode="currency"
                  currency="INR"
                  locale="en-IN"
                />
              )}
            />
            <Column field="amount" header="Amount" body={(r) => r.amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
          </DataTable>

          <div className="flex justify-content-end mt-3 gap-2">
            <Button label="Save" icon="pi pi-save" />
            <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Closing Stock Book
 * references/Screenshosts/Agencies/Reports/Closing-Stock-Book.png
 */
export function ReportsClosingStockBookPage() {
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Closing Stock Book" /></div>
      <div className="col-12">
        <Card>
          <DataTable value={rows} emptyMessage="No stock data." scrollable scrollHeight="400px">
            <Column field="item" header="Item" />
            <Column field="uom" header="UOM" />
            <Column field="opening" header="Opening" />
            <Column field="inward" header="Inward" />
            <Column field="outward" header="Outward" />
            <Column field="closing" header="Closing" />
            <Column field="rate" header="Rate" />
            <Column field="value" header="Value" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Party Wise Item Sale Detail
 * references/Screenshosts/Agencies/Reports/Party-Wise-Item-Sale-Detail.png
 */
export function ReportsPartyWiseItemSaleDetailPage() {
  const rows: any[] = [];
  const [party, setParty] = useState('');
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Party Wise Item Sale Detail" /></div>
      <div className="col-12">
        <Card>
          <div className="flex align-items-center gap-2 mb-3">
            <span className="p-input-icon-left">
              <i className="pi pi-user" />
              <InputText placeholder="Party" value={party} onChange={(e) => setParty(e.target.value)} />
            </span>
            <Calendar placeholder="From" showIcon />
            <Calendar placeholder="To" showIcon />
          </div>
          <DataTable value={rows} emptyMessage="No rows." scrollable scrollHeight="400px">
            <Column field="date" header="Date" />
            <Column field="invoice" header="Invoice" />
            <Column field="item" header="Item" />
            <Column field="qty" header="Qty" />
            <Column field="rate" header="Rate" />
            <Column field="amount" header="Amount" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Sale Book With Summary
 * references/Screenshosts/Agencies/Reports/Sale-Book-With-Summary.png
 */
export function ReportsSaleBookWithSummaryPage() {
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Sale Book With Summary" /></div>
      <div className="col-12">
        <Card>
          <DataTable value={rows} emptyMessage="No sale rows." scrollable scrollHeight="400px">
            <Column field="date" header="Date" />
            <Column field="invoice" header="Invoice" />
            <Column field="party" header="Party" />
            <Column field="taxable" header="Taxable" />
            <Column field="tax" header="Tax" />
            <Column field="total" header="Total" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Reports - Purchase Return Book
 * references/Screenshosts/Agencies/Reports/Purchase-Return-Book.png
 */
export function ReportsPurchaseReturnBookPage() {
  const rows: any[] = [];
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Purchase Return Book" /></div>
      <div className="col-12">
        <Card>
          <DataTable value={rows} emptyMessage="No rows." scrollable scrollHeight="400px">
            <Column field="date" header="Date" />
            <Column field="bill" header="Debit Note" />
            <Column field="supplier" header="Supplier" />
            <Column field="taxable" header="Taxable" />
            <Column field="tax" header="Tax" />
            <Column field="total" header="Total" />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Bill Collection
 * references/Screenshosts/Agencies/Transactions/Bill-Collection.png
 */
export function TransactionsBillCollectionPage() {
  const [hdr, setHdr] = useState({ date: new Date(), series: 'BC', number: '', collector: '', party: '' });
  const [rows, setRows] = useState<{ invoice: string; amount: number; received: number }[]>([]);
  const addRow = () => setRows([...rows, { invoice: '', amount: 0, received: 0 }]);

  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Bill Collection" /></div>
      <div className="col-12">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-3"><label className="font-medium">Date</label><Calendar value={hdr.date} onChange={(e) => setHdr({ ...hdr, date: e.value as Date })} showIcon /></div>
            <div className="field col-6 md:col-2"><label className="font-medium">Series</label><InputText value={hdr.series} onChange={(e) => setHdr({ ...hdr, series: e.target.value })} /></div>
            <div className="field col-6 md:col-2"><label className="font-medium">No.</label><InputText value={hdr.number} onChange={(e) => setHdr({ ...hdr, number: e.target.value })} /></div>
            <div className="field col-12 md:col-2"><label className="font-medium">Collector</label><InputText value={hdr.collector} onChange={(e) => setHdr({ ...hdr, collector: e.target.value })} /></div>
            <div className="field col-12 md:col-3"><label className="font-medium">Party</label><InputText value={hdr.party} onChange={(e) => setHdr({ ...hdr, party: e.target.value })} /></div>
          </div>

          <div className="flex justify-content-between align-items-center mb-2">
            <div className="text-lg font-medium">Invoices</div>
            <Button label="Add Row" icon="pi pi-plus" size="small" onClick={addRow} />
          </div>

          <DataTable value={rows} emptyMessage="No invoice rows.">
            <Column field="invoice" header="Invoice" body={(r, o) => <InputText value={r.invoice} onChange={(e) => { const c=[...rows]; c[o.rowIndex].invoice=e.target.value; setRows(c); }} />} />
            <Column field="amount" header="Amount" body={(r) => r.amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
            <Column field="received" header="Received" body={(r, o) => <InputNumber value={r.received} onValueChange={(e) => { const c=[...rows]; c[o.rowIndex].received=e.value || 0; setRows(c); }} mode="currency" currency="INR" locale="en-IN" />} />
          </DataTable>

          <div className="flex justify-content-end mt-3 gap-2"><Button label="Save" icon="pi pi-save" /><Button label="Cancel" icon="pi pi-times" severity="secondary" outlined /></div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Party Loyalty Program
 * references/Screenshosts/Agencies/Transactions/Party-Loyalty-Program.png
 */
export function TransactionsPartyLoyaltyProgramPage() {
  const [f, setF] = useState({ party: '', points: 0, tier: 'Silver' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Party Loyalty Program" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12"><label className="font-medium">Party</label><InputText value={f.party} onChange={(e) => setF({ ...f, party: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Points</label><InputNumber value={f.points} onValueChange={(e) => setF({ ...f, points: e.value || 0 })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Tier</label><Dropdown value={f.tier} options={['Silver','Gold','Platinum']} onChange={(e) => setF({ ...f, tier: e.value })} /></div>
          </div>
          <div className="flex gap-2"><Button label="Save" icon="pi pi-save" /><Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined /></div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Cheque Book Issue
 * references/Screenshosts/Agencies/Transactions/Cheque-Book-Issue.png
 */
export function TransactionsChequeBookIssuePage() {
  const [f, setF] = useState({ bank: '', series: '', from: '', to: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Cheque Book Issue" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6"><label className="font-medium">Bank</label><InputText value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Series</label><InputText value={f.series} onChange={(e) => setF({ ...f, series: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">From Cheque No</label><InputText value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">To Cheque No</label><InputText value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button label="Save" icon="pi pi-save" /><Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined /></div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Cheque Inward
 * references/Screenshosts/Agencies/Transactions/Cheque-Inward.png
 */
export function TransactionsChequeInwardPage() {
  const [f, setF] = useState({ date: new Date(), party: '', bank: '', chequeNo: '', amount: 0 });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Cheque Inward" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6"><label className="font-medium">Date</label><Calendar value={f.date} onChange={(e) => setF({ ...f, date: e.value as Date })} showIcon /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Party</label><InputText value={f.party} onChange={(e) => setF({ ...f, party: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Bank</label><InputText value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Cheque No</label><InputText value={f.chequeNo} onChange={(e) => setF({ ...f, chequeNo: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Amount</label><InputNumber value={f.amount} onValueChange={(e) => setF({ ...f, amount: e.value || 0 })} mode="currency" currency="INR" locale="en-IN" /></div>
          </div>
          <div className="flex gap-2"><Button label="Save" icon="pi pi-save" /><Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined /></div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Money Receipt (Cash)
 * references/Screenshosts/Agencies/Transactions/Money-Receipt-Cash.png
 */
export function TransactionsMoneyReceiptCashPage() {
  const [f, setF] = useState({ date: new Date(), party: '', amount: 0, narration: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Money Receipt - Cash" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-4"><label className="font-medium">Date</label><Calendar value={f.date} onChange={(e) => setF({ ...f, date: e.value as Date })} showIcon /></div>
            <div className="field col-12 md:col-8"><label className="font-medium">Party</label><InputText value={f.party} onChange={(e) => setF({ ...f, party: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Amount</label><InputNumber value={f.amount} onValueChange={(e) => setF({ ...f, amount: e.value || 0 })} mode="currency" currency="INR" locale="en-IN" /></div>
            <div className="field col-12"><label className="font-medium">Narration</label><InputText value={f.narration} onChange={(e) => setF({ ...f, narration: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button label="Save" icon="pi pi-save" /><Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined /></div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Money Receipt (Bank)
 * references/Screenshosts/Agencies/Transactions/Money-Receipt-Bank.png
 */
export function TransactionsMoneyReceiptBankPage() {
  const [f, setF] = useState({ date: new Date(), party: '', bank: '', amount: 0, chequeNo: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Money Receipt - Bank" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-4"><label className="font-medium">Date</label><Calendar value={f.date} onChange={(e) => setF({ ...f, date: e.value as Date })} showIcon /></div>
            <div className="field col-12 md:col-8"><label className="font-medium">Party</label><InputText value={f.party} onChange={(e) => setF({ ...f, party: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Bank</label><InputText value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Cheque No</label><InputText value={f.chequeNo} onChange={(e) => setF({ ...f, chequeNo: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Amount</label><InputNumber value={f.amount} onValueChange={(e) => setF({ ...f, amount: e.value || 0 })} mode="currency" currency="INR" locale="en-IN" /></div>
          </div>
          <div className="flex gap-2"><Button label="Save" icon="pi pi-save" /><Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined /></div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Transactions - Retailer Foot Path
 * references/Screenshosts/Agencies/Transactions/Retailer-Foot-Path.png
 */
export function TransactionsRetailerFootPathPage() {
  const [f, setF] = useState({ name: '', area: '', contact: '', remarks: '' });
  return (
    <div className="grid">
      <div className="col-12"><ReportToolbar title="Retailer Foot Path" /></div>
      <div className="col-12 lg:col-6">
        <Card>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6"><label className="font-medium">Retailer Name</label><InputText value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Area</label><InputText value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></div>
            <div className="field col-12 md:col-6"><label className="font-medium">Contact</label><InputText value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></div>
            <div className="field col-12"><label className="font-medium">Remarks</label><InputText value={f.remarks} onChange={(e) => setF({ ...f, remarks: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button label="Save" icon="pi pi-save" /><Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined /></div>
        </Card>
      </div>
    </div>
  );
}