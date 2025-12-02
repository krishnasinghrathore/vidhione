import { useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { z } from 'zod';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

const UPSERT_CA = gql`
  mutation UpsertCorporateAction(
    $id: String
    $securityId: String!
    $actionDate: String!
    $actionType: String!
    $ratio: String
    $price: String
    $notes: String
  ) {
    upsertCorporateAction(
      id: $id
      securityId: $securityId
      actionDate: $actionDate
      actionType: $actionType
      ratio: $ratio
      price: $price
      notes: $notes
    ) {
      id
      securityId
      actionDate
      actionType
      ratio
      price
      notes
    }
  }
`;

const DELETE_CA = gql`
  mutation DeleteCorporateAction($id: String!) {
    deleteCorporateAction(id: $id)
  }
`;

export default function CorporateActionsAdminPage() {
  const [id, setId] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [actionType, setActionType] = useState('');
  const [ratio, setRatio] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const toastRef = useRef<Toast>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [upsertCA, { data, loading, error }] = useMutation(UPSERT_CA);
  const [deleteCA, { data: delData, loading: delLoading, error: delError }] = useMutation(DELETE_CA);

  const actionTypes = ['SPLIT', 'BONUS', 'RIGHTS', 'DIVIDEND', 'CAPITAL_REDUCTION'].map((a) => ({
    label: a,
    value: a
  }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      id: z.string().optional(),
      securityId: z.string().trim().min(1, 'Security ID is required'),
      actionDate: z.string().trim().min(1, 'Action date is required'),
      actionType: z.string().trim().min(1, 'Action type is required'),
      ratio: z.number().optional().nullable(),
      price: z.number().optional().nullable(),
      notes: z.string().trim().optional().nullable()
    });
    const parsed = schema.safeParse({
      id: id || undefined,
      securityId,
      actionDate,
      actionType,
      ratio: ratio ?? null,
      price: price ?? null,
      notes: notes || null
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0].message);
      return;
    }
    setFormError(null);
    await upsertCA({
      variables: {
        ...parsed.data,
        ratio: parsed.data.ratio != null ? String(parsed.data.ratio) : null,
        price: parsed.data.price != null ? String(parsed.data.price) : null
      }
    });
    toastRef.current?.show({ severity: 'success', summary: 'Saved', detail: 'Corporate action saved', life: 2000 });
    setId('');
    setSecurityId('');
    setActionDate('');
    setActionType('');
    setRatio('');
    setPrice('');
    setNotes('');
  };

  const onDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    await deleteCA({ variables: { id: deleteId } });
    toastRef.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Corporate action deleted', life: 2000 });
    setDeleteId('');
  };

  return (
    <div className="page-card">
      <h2>Corporate Actions</h2>
      <p className="muted">Register splits/bonus/rights/dividends/capital reductions.</p>
      <Toast ref={toastRef} position="top-right" />
      <form className="p-fluid formgrid grid" onSubmit={onSave}>
        <div className="field col-12 md:col-6">
          <label htmlFor="ca-id">Action ID (optional)</label>
          <InputText id="ca-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Leave empty to create new" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="ca-security">Security ID</label>
          <InputText id="ca-security" value={securityId} onChange={(e) => setSecurityId(e.target.value)} required />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="ca-date">Action Date (YYYY-MM-DD)</label>
          <InputText id="ca-date" value={actionDate} onChange={(e) => setActionDate(e.target.value)} required />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="ca-type">Action Type</label>
          <Dropdown id="ca-type" value={actionType} options={actionTypes} onChange={(e) => setActionType(String(e.value))} placeholder="Select type" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="ca-ratio">Ratio (optional)</label>
          <InputNumber id="ca-ratio" value={ratio} onValueChange={(e) => setRatio(e.value ?? null)} mode="decimal" maxFractionDigits={6} className="w-full" />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="ca-price">Price (optional)</label>
          <InputNumber id="ca-price" value={price} onValueChange={(e) => setPrice(e.value ?? null)} mode="decimal" maxFractionDigits={6} className="w-full" />
        </div>
        <div className="field col-12">
          <label htmlFor="ca-notes">Notes (optional)</label>
          <InputText id="ca-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="field col-12 flex gap-2">
          <Button type="submit" disabled={loading} label={loading ? 'Saving...' : 'Save Action'} />
          {formError && <div className="error">Error: {formError}</div>}
          {error && <div className="error">Error: {error.message}</div>}
          {data?.upsertCorporateAction && <div>Saved action #{data.upsertCorporateAction.id}</div>}
        </div>
      </form>

      <h3>Delete Corporate Action</h3>
      <form className="p-fluid formgrid grid" onSubmit={onDelete}>
        <div className="field col-12 md:col-6">
          <label htmlFor="ca-delete-id">Action ID</label>
          <InputText id="ca-delete-id" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required />
        </div>
        <div className="field col-12">
          <Button type="submit" disabled={delLoading} label={delLoading ? 'Deleting...' : 'Delete'} severity="danger" />
          {delError && <div className="error">Error: {delError.message}</div>}
          {delData?.deleteCorporateAction && <div>Deleted.</div>}
        </div>
      </form>
    </div>
  );
}
