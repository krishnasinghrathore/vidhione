import { useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { z } from 'zod';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const UPSERT_ACCOUNT = gql`
  mutation UpsertAccount($id: String, $name: String!) {
    upsertAccount(id: $id, name: $name) {
      id
      name
    }
  }
`;

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($id: String!) {
    deleteAccount(id: $id)
  }
`;

export default function AccountsAdminPage() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [upsertAccount, { data, loading, error }] = useMutation(UPSERT_ACCOUNT);
  const [deleteAccount, { loading: delLoading, error: delError, data: delData }] = useMutation(DELETE_ACCOUNT);
  const toastRef = useRef<Toast>(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      id: z.string().optional(),
      name: z.string().trim().min(1, 'Name is required')
    });
    const parsed = schema.safeParse({ id: id || undefined, name });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0].message);
      return;
    }
    setFormError(null);
    await upsertAccount({ variables: parsed.data });
    toastRef.current?.show({ severity: 'success', summary: 'Saved', detail: 'Account saved', life: 2000 });
    setId('');
    setName('');
  };

  const onDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    await deleteAccount({ variables: { id: deleteId } });
    toastRef.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Account deleted', life: 2000 });
    setDeleteId('');
  };

  return (
    <div className="page-card">
      <h2>Accounts</h2>
      <p className="muted">Create or update accounts by id (optional) and name.</p>
      <Toast ref={toastRef} position="top-right" />
      <form className="p-fluid formgrid grid" onSubmit={onSave}>
        <div className="field col-12 md:col-6">
          <label htmlFor="account-id">Account ID (optional)</label>
          <InputText id="account-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Leave empty to create new" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="account-name">Name</label>
          <InputText id="account-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field col-12 flex gap-2">
          <Button type="submit" disabled={loading} label={loading ? 'Saving...' : 'Save Account'} />
          {formError && <div className="error">Error: {formError}</div>}
          {error && <div className="error">Error: {error.message}</div>}
          {data?.upsertAccount && <div>Saved account #{data.upsertAccount.id}</div>}
        </div>
      </form>

      <h3>Delete Account</h3>
      <form className="p-fluid formgrid grid" onSubmit={onDelete}>
        <div className="field col-12 md:col-6">
          <label htmlFor="delete-account-id">Account ID</label>
          <InputText id="delete-account-id" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required />
        </div>
        <div className="field col-12">
          <Button type="submit" disabled={delLoading} label={delLoading ? 'Deleting...' : 'Delete'} severity="danger" />
          {delError && <div className="error">Error: {delError.message}</div>}
          {delData?.deleteAccount && <div>Deleted.</div>}
        </div>
      </form>
    </div>
  );
}
