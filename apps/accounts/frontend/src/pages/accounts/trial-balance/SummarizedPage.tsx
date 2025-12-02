import React, { useEffect, useMemo, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

type TrialBalanceRow = {
  ledgerGroup: string;
  ledger: string;
  openingBalance?: string | null;
  debitAmount?: string | null;
  creditAmount?: string | null;
};

type TrialBalanceResponse = {
  data?: { trialBalance: TrialBalanceRow[] };
  errors?: { message: string }[];
};

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ?? 'http://127.0.0.1:4000/graphql';

const TRIAL_BALANCE_QUERY = `query TrialBalance($limit: Int, $companyId: String, $yearId: String) {
  trialBalance(limit: $limit, companyId: $companyId, yearId: $yearId) {
    ledgerGroup
    ledger
    openingBalance
    debitAmount
    creditAmount
  }
}`;

export default function TrialBalanceSummarizedPage() {
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [yearId, setYearId] = useState('');

  const variables = useMemo(
    () => ({
      limit: 100,
      companyId: companyId || undefined,
      yearId: yearId || undefined
    }),
    [companyId, yearId]
  );

  const fetchTrialBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: TRIAL_BALANCE_QUERY, variables })
      });
      const json: TrialBalanceResponse = await res.json();
      if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join('; '));
      }
      setRows(json.data?.trialBalance ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load trial balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
  }, [variables]);

  return (
    <div className="grid">
      <div className="col-12">
        <div className="flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="m-0">Accounts • Trial Balance (Summarized)</h2>
            <p className="m-0 text-500">Pulled from /graphql trialBalance query</p>
          </div>
          <div className="flex gap-2 align-items-center">
            <InputText
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="Company Id"
            />
            <InputText
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              placeholder="Year Id"
            />
            <Button label="Reload" icon="pi pi-refresh" onClick={fetchTrialBalance} loading={loading} />
          </div>
        </div>
        {error && <div className="p-message p-message-error mb-3">{error}</div>}
        <DataTable value={rows} loading={loading} paginator rows={20}>
          <Column field="ledgerGroup" header="Ledger Group" />
          <Column field="ledger" header="Ledger" />
          <Column field="openingBalance" header="Opening" />
          <Column field="debitAmount" header="Debit" />
          <Column field="creditAmount" header="Credit" />
        </DataTable>
      </div>
    </div>
  );
}
