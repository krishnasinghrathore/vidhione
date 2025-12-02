import { useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { z } from 'zod';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

const UPSERT_SECURITY = gql`
  mutation UpsertSecurity($id: String, $isin: String, $symbol: String, $name: String!) {
    upsertSecurity(id: $id, isin: $isin, symbol: $symbol, name: $name) {
      id
      isin
      symbol
      name
    }
  }
`;

const DELETE_SECURITY = gql`
  mutation DeleteSecurity($id: String!) {
    deleteSecurity(id: $id)
  }
`;

export default function SecuritiesAdminPage() {
  const [id, setId] = useState('');
  const [isin, setIsin] = useState('');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [upsertSecurity, { data, loading, error }] = useMutation(UPSERT_SECURITY);
  const [deleteSecurity, { data: delData, loading: delLoading, error: delError }] = useMutation(DELETE_SECURITY);
  const toastRef = useRef<Toast>(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      id: z.string().optional(),
      isin: z.string().trim().optional().nullable(),
      symbol: z.string().trim().optional().nullable(),
      name: z.string().trim().min(1, 'Name is required')
    });
    const parsed = schema.safeParse({ id: id || undefined, isin: isin || null, symbol: symbol || null, name });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0].message);
      return;
    }
    setFormError(null);
    await upsertSecurity({ variables: parsed.data });
    toastRef.current?.show({ severity: 'success', summary: 'Saved', detail: 'Security saved', life: 2000 });
    setId('');
    setIsin('');
    setSymbol('');
    setName('');
  };

  const onDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    await deleteSecurity({ variables: { id: deleteId } });
    toastRef.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Security deleted', life: 2000 });
    setDeleteId('');
  };

  const typeOptions = ['EQUITY', 'MF', 'BOND', 'OTHER'].map((t) => ({ label: t, value: t }));

  return (
    <div className="page-card">
      <h2>Securities</h2>
      <p className="muted">Create or update securities (ISIN/Symbol optional, Name required).</p>
      <Toast ref={toastRef} position="top-right" />
      <form className="p-fluid formgrid grid" onSubmit={onSave}>
        <div className="field col-12 md:col-6">
          <label htmlFor="sec-id">Security ID (optional)</label>
          <InputText id="sec-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Leave empty to create new" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="sec-isin">ISIN</label>
          <InputText id="sec-isin" value={isin} onChange={(e) => setIsin(e.target.value)} />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="sec-symbol">Symbol</label>
          <InputText id="sec-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="sec-name">Name</label>
          <InputText id="sec-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="sec-type">Type</label>
          <Dropdown id="sec-type" value={undefined} options={typeOptions} onChange={() => {}} placeholder="Optional" />
        </div>
        <div className="field col-12 flex gap-2">
          <Button type="submit" disabled={loading} label={loading ? 'Saving...' : 'Save Security'} />
          {formError && <div className="error">Error: {formError}</div>}
          {error && <div className="error">Error: {error.message}</div>}
          {data?.upsertSecurity && <div>Saved security #{data.upsertSecurity.id}</div>}
        </div>
      </form>

      <h3>Delete Security</h3>
      <form className="p-fluid formgrid grid" onSubmit={onDelete}>
        <div className="field col-12 md:col-6">
          <label htmlFor="sec-delete-id">Security ID</label>
          <InputText id="sec-delete-id" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required />
        </div>
        <div className="field col-12">
          <Button type="submit" disabled={delLoading} label={delLoading ? 'Deleting...' : 'Delete'} severity="danger" />
          {delError && <div className="error">Error: {delError.message}</div>}
          {delData?.deleteSecurity && <div>Deleted.</div>}
        </div>
      </form>
    </div>
  );
}
