import React, { useEffect, useMemo, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

type LedgerRow = {
  voucherNo: string;
  voucherDate: string;
  ledger: string;
  drAmt?: string | null;
  crAmt?: string | null;
};

type LedgerResponse = {
  data?: { ledger: LedgerRow[] };
  errors?: { message: string }[];
};

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ?? 'http://127.0.0.1:4000/graphql';

const LEDGER_QUERY = `query Ledger($limit: Int, $ledgerId: String, $companyId: String) {
  ledger(limit: $limit, ledgerId: $ledgerId, companyId: $companyId) {
    voucherNo
    voucherDate
    ledger
    drAmt
    crAmt
  }
}`;

export default function LedgerPage() {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerIdFilter, setLedgerIdFilter] = useState('');

  const variables = useMemo(
    () => ({
      limit: 50,
      ledgerId: ledgerIdFilter ? ledgerIdFilter : undefined
    }),
    [ledgerIdFilter]
  );

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: LEDGER_QUERY, variables })
      });
      const json: LedgerResponse = await res.json();
      if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join('; '));
      }
      setRows(json.data?.ledger ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [variables]);

  return (
    <div className="grid">
      <div className="col-12">
        <div className="flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="m-0">Accounts • Ledger</h2>
            <p className="m-0 text-500">Live data from /graphql ledger query</p>
          </div>
          <div className="flex gap-2 align-items-center">
            <span className="p-input-icon-left">
              <i className="pi pi-filter" />
              <InputText
                value={ledgerIdFilter}
                onChange={(e) => setLedgerIdFilter(e.target.value)}
                placeholder="Ledger Id filter"
              />
            </span>
            <Button
              label="Reload"
              icon="pi pi-refresh"
              onClick={fetchLedger}
              loading={loading}
            />
          </div>
        </div>
        {error && <div className="p-message p-message-error mb-3">{error}</div>}
        <DataTable value={rows} loading={loading} paginator rows={15}>
          <Column field="voucherNo" header="Voucher No" />
          <Column field="voucherDate" header="Date" />
          <Column field="ledger" header="Ledger" />
          <Column field="drAmt" header="Dr" />
          <Column field="crAmt" header="Cr" />
        </DataTable>
      </div>
    </div>
  );
}
