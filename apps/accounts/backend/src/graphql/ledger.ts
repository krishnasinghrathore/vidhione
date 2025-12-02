// Ledger query scaffold for Encore/GraphQL. Wire this up once Drizzle schemas are defined.
import { db } from '../db/client';
import { sql } from 'drizzle-orm';

export type LedgerQueryParams = {
  ledgerId?: string;
  fromDate?: string;
  toDate?: string;
  voucherTypes?: string[];
  drCr?: 'D' | 'C';
  companyId?: string;
  yearId?: string;
  limit?: number;
  offset?: number;
};

export type LedgerRow = {
  id: string | null;
  voucherDate: string;
  voucherDateCast?: string;
  voucherNo: string;
  voucherType: string;
  ledger: string;
  narration?: string;
  drAmt?: string;
  crAmt?: string;
  balance?: string;
  companyId?: string;
};

/**
 * TODO: implement using Drizzle once ledger view/table is defined.
 * Target legacy sources: Select_Acc_Ledger, Select_Acc_LedgerCurrentBalance (see MIGRATION_PROGRESS.md).
 */
export async function fetchLedger(_params: LedgerQueryParams): Promise<LedgerRow[]> {
  const clauses = [];
  if (_params.ledgerId) clauses.push(sql`"ledgerid" = ${_params.ledgerId}`);
  if (_params.companyId) clauses.push(sql`"company_id" = ${_params.companyId}`);
  if (_params.drCr) clauses.push(sql`"drcr" = ${_params.drCr}`);
  if (_params.voucherTypes?.length) clauses.push(sql`"f_vouchertypemaster" = ANY(${_params.voucherTypes})`);
  if (_params.fromDate) clauses.push(sql`"voucherdate_cast" >= ${_params.fromDate}`);
  if (_params.toDate) clauses.push(sql`"voucherdate_cast" <= ${_params.toDate}`);

  const whereSql = clauses.length ? sql`WHERE ${sql.join(clauses, sql` AND `)}` : sql``;
  const limit = _params.limit ?? 50;
  const offset = _params.offset ?? 0;

  const result: any = await db.execute(
    sql`SELECT * FROM "accounts"."select_acc_ledger" ${whereSql} LIMIT ${limit} OFFSET ${offset}`
  );

  const rows = Array.isArray(result) ? result : result?.rows ?? [];

  return rows.map((r: any) => ({
    id: r.id !== null && r.id !== undefined ? String(r.id) : null,
    voucherDate: r.voucherdate ?? '',
    voucherDateCast: r.voucherdate_cast ?? undefined,
    voucherNo: r.voucherno ?? '',
    voucherType: r.vouchertype ?? '',
    ledger: r.ledger ?? '',
    narration: r.narration ?? undefined,
    drAmt: r.dramt !== null && r.dramt !== undefined ? String(r.dramt) : undefined,
    crAmt: r.cramt !== null && r.cramt !== undefined ? String(r.cramt) : undefined,
    balance: r.balance !== null && r.balance !== undefined ? String(r.balance) : undefined,
    drCr: r.drcr ?? undefined,
    companyId: r.company_id !== null && r.company_id !== undefined ? String(r.company_id) : undefined
  }));
}
