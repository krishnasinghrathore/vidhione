import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { z } from 'zod';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';

const IMPORT_TX = gql`
  mutation ImportTransactions($csv: String!, $dryRun: Boolean, $preview: Boolean) {
    importTransactions(csv: $csv, dryRun: $dryRun, preview: $preview) {
      inserted
      parsed
      skipped
      errors {
        row
        message
      }
      preview {
        rowNumber
        valid
        error
        tdate
        ttype
        qty
        price
        fees
        isin
        symbol
        name
        notes
        accountName
      }
      batchId
    }
  }
`;

const importFormSchema = z.object({
  csv: z.string().min(1, 'CSV content is required')
});

export function ImportPanel() {
  const [csv, setCsv] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [preview, setPreview] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [runImport, { data, loading, error }] = useMutation(IMPORT_TX);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = importFormSchema.safeParse({ csv });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setFormError(null);
    runImport({ variables: { csv: parsed.data.csv, dryRun, preview } });
  };

  return (
    <div className="import-panel">
      <header className="panel-header">
        <h2>Import Transactions (CSV)</h2>
      </header>
      <form className="import-form" onSubmit={onSubmit}>
        <label>
          CSV Text
          <InputTextarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="Paste CSV content here" rows={8} className="w-full" />
        </label>
        <div className="form-row">
          <div className="flex align-items-center gap-2">
            <Checkbox inputId="dryRun" checked={dryRun} onChange={(e) => setDryRun(!!e.checked)} />
            <label htmlFor="dryRun">Dry Run (no writes)</label>
          </div>
          <div className="flex align-items-center gap-2">
            <Checkbox inputId="preview" checked={preview} onChange={(e) => setPreview(!!e.checked)} />
            <label htmlFor="preview">Return Preview</label>
          </div>
        </div>
        <Button type="submit" disabled={loading || !csv.trim()} label={loading ? 'Running…' : 'Run Import'} />
      </form>
      {formError && <div className="error">{formError}</div>}
      {error && <div className="error">Error: {error.message}</div>}
      {data?.importTransactions && <ImportResult result={data.importTransactions} />}
    </div>
  );
}

function ImportResult({ result }: { result: any }) {
  return (
    <div className="import-result">
      <div className="import-summary">
        <span>Parsed: {result.parsed}</span>
        <span>Inserted: {result.inserted}</span>
        <span>Skipped: {result.skipped}</span>
        {result.batchId ? <span>Batch ID: {result.batchId}</span> : null}
      </div>
      {result.errors?.length ? (
        <div className="error-list">
          <h4>Errors</h4>
          <ul>
            {result.errors.map((err: any, idx: number) => (
              <li key={idx}>
                Row {err.row}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {result.preview?.length ? (
        <div className="preview-table">
          <h4>Preview (first {result.preview.length} rows)</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Fees</th>
                <th>Valid</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {result.preview.map((r: any, idx: number) => (
                <tr key={idx}>
                  <td>{r.rowNumber}</td>
                  <td>{r.tdate}</td>
                  <td>{r.ttype}</td>
                  <td>{r.symbol}</td>
                  <td>{r.qty}</td>
                  <td>{r.price}</td>
                  <td>{r.fees}</td>
                  <td>{r.valid ? 'Yes' : 'No'}</td>
                  <td>{r.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
