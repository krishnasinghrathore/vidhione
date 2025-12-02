import { useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { z } from 'zod';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

const UPSERT_TX = gql`
  mutation UpsertTransaction(
    $id: String
    $tdate: String!
    $ttype: String!
    $qty: String!
    $price: String!
    $fees: String
    $notes: String
    $accountId: String
    $securityId: String
  ) {
    upsertTransaction(
      id: $id
      tdate: $tdate
      ttype: $ttype
      qty: $qty
      price: $price
      fees: $fees
      notes: $notes
      accountId: $accountId
      securityId: $securityId
    ) {
      id
      tdate
      ttype
      qty
      price
      fees
      accountId
      securityId
    }
  }
`;

const DELETE_TX = gql`
  mutation DeleteTransaction($id: String!) {
    deleteTransaction(id: $id)
  }
`;

export default function TransactionsAdminPage() {
  const [id, setId] = useState('');
  const [tdate, setTdate] = useState('');
  const [ttype, setTtype] = useState('BUY');
  const [qty, setQty] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [fees, setFees] = useState<number | null>(0);
  const [notes, setNotes] = useState('');
  const [accountId, setAccountId] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [upsertTx, { data, loading, error }] = useMutation(UPSERT_TX);
  const [deleteTx, { data: delData, loading: delLoading, error: delError }] = useMutation(DELETE_TX);
  const toastRef = useRef<Toast>(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      id: z.string().optional(),
      tdate: z.string().trim().min(1, 'Trade date is required'),
      ttype: z.string().trim().min(1, 'Type is required'),
      qty: z.number().positive('Qty is required'),
      price: z.number().positive('Price is required'),
      fees: z.number().optional().default(0),
      notes: z.string().trim().optional().nullable(),
      accountId: z.string().trim().optional().nullable(),
      securityId: z.string().trim().optional().nullable()
    });
    const parsed = schema.safeParse({
      id: id || undefined,
      tdate,
      ttype,
      qty: qty ?? 0,
      price: price ?? 0,
      fees: fees ?? 0,
      notes: notes || null,
      accountId: accountId || null,
      securityId: securityId || null
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0].message);
      return;
    }
    setFormError(null);
    await upsertTx({
      variables: {
        ...parsed.data,
        qty: String(parsed.data.qty),
        price: String(parsed.data.price),
        fees: String(parsed.data.fees)
      }
    });
    toastRef.current?.show({ severity: 'success', summary: 'Saved', detail: 'Transaction saved', life: 2000 });
    setId('');
    setTdate('');
    setTtype('BUY');
    setQty(null);
    setPrice(null);
    setFees(0);
    setNotes('');
    setAccountId('');
    setSecurityId('');
  };

  const onDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    await deleteTx({ variables: { id: deleteId } });
    toastRef.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Transaction deleted', life: 2000 });
    setDeleteId('');
  };

  const typeOptions = [
    'BUY',
    'SELL',
    'DIVIDEND',
    'SPLIT',
    'BONUS',
    'RIGHTS',
    'EXPENSE'
  ].map((tt) => ({ label: tt, value: tt }));

  return (
    <div className="page-card">
      <h2>Manual Transactions</h2>
      <p className="muted">Create or update single transactions (BUY/SELL/etc.).</p>
      <Toast ref={toastRef} position="top-right" />
      <form className="p-fluid formgrid grid" onSubmit={onSave}>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-id">Transaction ID (optional)</label>
          <InputText id="tx-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Leave empty to create new" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-date">Trade Date (YYYY-MM-DD)</label>
          <InputText id="tx-date" value={tdate} onChange={(e) => setTdate(e.target.value)} required />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-type">Type</label>
          <Dropdown id="tx-type" value={ttype} options={typeOptions} onChange={(e) => setTtype(String(e.value))} placeholder="Select type" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-qty">Qty</label>
          <InputNumber id="tx-qty" value={qty} onValueChange={(e) => setQty(e.value ?? null)} mode="decimal" minFractionDigits={0} maxFractionDigits={6} required className="w-full" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-price">Price</label>
          <InputNumber id="tx-price" value={price} onValueChange={(e) => setPrice(e.value ?? null)} mode="decimal" minFractionDigits={0} maxFractionDigits={6} required className="w-full" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-fees">Fees</label>
          <InputNumber id="tx-fees" value={fees} onValueChange={(e) => setFees(e.value ?? null)} mode="decimal" minFractionDigits={0} maxFractionDigits={6} className="w-full" />
        </div>
        <div className="field col-12">
          <label htmlFor="tx-notes">Notes</label>
          <InputText id="tx-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-account">Account ID</label>
          <InputText id="tx-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="tx-security">Security ID</label>
          <InputText id="tx-security" value={securityId} onChange={(e) => setSecurityId(e.target.value)} />
        </div>
        <div className="field col-12 flex gap-2">
          <Button type="submit" disabled={loading} label={loading ? 'Saving...' : 'Save Transaction'} />
          {formError && <div className="error">Error: {formError}</div>}
          {error && <div className="error">Error: {error.message}</div>}
          {data?.upsertTransaction && <div>Saved transaction #{data.upsertTransaction.id}</div>}
        </div>
      </form>

      <h3>Delete Transaction</h3>
      <form className="p-fluid formgrid grid" onSubmit={onDelete}>
        <div className="field col-12 md:col-6">
          <label htmlFor="delete-id">Transaction ID</label>
          <InputText id="delete-id" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required />
        </div>
        <div className="field col-12">
          <Button type="submit" disabled={delLoading} label={delLoading ? 'Deleting...' : 'Delete'} severity="danger" />
          {delError && <div className="error">Error: {delError.message}</div>}
          {delData?.deleteTransaction && <div>Deleted.</div>}
        </div>
      </form>
    </div>
  );
}
