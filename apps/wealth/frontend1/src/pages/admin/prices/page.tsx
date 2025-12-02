import { useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { z } from 'zod';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';

const UPSERT_PRICE = gql`
  mutation UpsertPrice($securityId: String!, $pdate: String!, $closePrice: String!) {
    upsertPrice(securityId: $securityId, pdate: $pdate, closePrice: $closePrice) {
      securityId
      pdate
      closePrice
    }
  }
`;

const DELETE_PRICE = gql`
  mutation DeletePrice($securityId: String!, $pdate: String!) {
    deletePrice(securityId: $securityId, pdate: $pdate)
  }
`;

export default function PricesAdminPage() {
  const [securityId, setSecurityId] = useState('');
  const [pdate, setPdate] = useState('');
  const [closePrice, setClosePrice] = useState<number | null>(null);
  const [deleteSecurityId, setDeleteSecurityId] = useState('');
  const [deletePdate, setDeletePdate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [upsertPrice, { data, loading, error }] = useMutation(UPSERT_PRICE);
  const [deletePrice, { data: delData, loading: delLoading, error: delError }] = useMutation(DELETE_PRICE);
  const toastRef = useRef<Toast>(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      securityId: z.string().trim().min(1, 'Security ID is required'),
      pdate: z.string().trim().min(1, 'Date is required'),
      closePrice: z.number().positive('Close price must be > 0')
    });
    const parsed = schema.safeParse({ securityId, pdate, closePrice: closePrice ?? 0 });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0].message);
      return;
    }
    setFormError(null);
    await upsertPrice({ variables: { ...parsed.data, closePrice: String(parsed.data.closePrice) } });
    toastRef.current?.show({ severity: 'success', summary: 'Saved', detail: 'Price saved', life: 2000 });
    setSecurityId('');
    setPdate('');
    setClosePrice(null);
  };

  const onDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteSecurityId || !deletePdate) return;
    await deletePrice({ variables: { securityId: deleteSecurityId, pdate: deletePdate } });
    toastRef.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Price deleted', life: 2000 });
    setDeleteSecurityId('');
    setDeletePdate('');
  };

  return (
    <div className="page-card">
      <h2>Prices</h2>
      <p className="muted">Upsert daily close prices by (securityId, date).</p>
      <Toast ref={toastRef} position="top-right" />
      <form className="p-fluid formgrid grid" onSubmit={onSave}>
        <div className="field col-12 md:col-6">
          <label htmlFor="price-security">Security ID</label>
          <InputText id="price-security" value={securityId} onChange={(e) => setSecurityId(e.target.value)} required />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="price-date">Price Date (YYYY-MM-DD)</label>
          <InputText id="price-date" value={pdate} onChange={(e) => setPdate(e.target.value)} required />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="price-close">Close Price</label>
          <InputNumber id="price-close" value={closePrice} onValueChange={(e) => setClosePrice(e.value ?? null)} mode="decimal" minFractionDigits={0} maxFractionDigits={6} required className="w-full" />
        </div>
        <div className="field col-12 flex gap-2">
          <Button type="submit" disabled={loading} label={loading ? 'Saving...' : 'Save Price'} />
          {formError && <div className="error">Error: {formError}</div>}
          {error && <div className="error">Error: {error.message}</div>}
          {data?.upsertPrice && <div>Saved price for security #{data.upsertPrice.securityId}</div>}
        </div>
      </form>

      <h3>Delete Price</h3>
      <form className="p-fluid formgrid grid" onSubmit={onDelete}>
        <div className="field col-12 md:col-6">
          <label htmlFor="delete-price-security">Security ID</label>
          <InputText id="delete-price-security" value={deleteSecurityId} onChange={(e) => setDeleteSecurityId(e.target.value)} required />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="delete-price-date">Price Date (YYYY-MM-DD)</label>
          <InputText id="delete-price-date" value={deletePdate} onChange={(e) => setDeletePdate(e.target.value)} required />
        </div>
        <div className="field col-12">
          <Button type="submit" disabled={delLoading} label={delLoading ? 'Deleting...' : 'Delete'} severity="danger" />
          {delError && <div className="error">Error: {delError.message}</div>}
          {delData?.deletePrice && <div>Deleted.</div>}
        </div>
      </form>
    </div>
  );
}
