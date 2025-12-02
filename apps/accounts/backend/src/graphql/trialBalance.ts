// Trial Balance query scaffold for Encore/GraphQL.
import { db } from '../db/client';
import { selectAccTrialBalance, selectAccLedgerCurrentBalance } from '../db/schemas';

export type TrialBalanceParams = {
  toDate?: string;
  companyId?: string;
  yearId?: string;
  includeOpening?: boolean;
  limit?: number;
  offset?: number;
};

export type TrialBalanceRow = {
  ledgerGroup: string;
  ledger: string;
  openingBalance?: string;
  debitAmount?: string;
  creditAmount?: string;
  toDate?: string;
  companyId?: string;
  companyFiscalYearId?: string;
};

// TODO: extend with opening balances/current balances as needed.
export async function fetchTrialBalance(_params: TrialBalanceParams): Promise<TrialBalanceRow[]> {
  const rows = await db
    .select()
    .from(selectAccTrialBalance)
    .where((fields) => {
      let cond = undefined as any;
      if (_params.companyId) {
        cond = cond ? cond.and(fields.companyId.eq(_params.companyId)) : fields.companyId.eq(_params.companyId);
      }
      if (_params.yearId) {
        cond = cond
          ? cond.and(fields.companyFiscalYearId.eq(_params.yearId))
          : fields.companyFiscalYearId.eq(_params.yearId);
      }
      return cond ?? undefined;
    })
    .limit(_params.limit ?? 100)
    .offset(_params.offset ?? 0);

  return rows.map((r) => ({
    ledgerGroup: r.ledgerGroup ?? '',
    ledger: r.ledger ?? '',
    openingBalance: r.openingBalance !== null && r.openingBalance !== undefined ? String(r.openingBalance) : undefined,
    debitAmount: r.debitAmount !== null && r.debitAmount !== undefined ? String(r.debitAmount) : undefined,
    creditAmount: r.creditAmount !== null && r.creditAmount !== undefined ? String(r.creditAmount) : undefined,
    toDate: r.toDate ?? undefined,
    companyId: r.companyId !== null && r.companyId !== undefined ? String(r.companyId) : undefined,
    companyFiscalYearId: r.companyFiscalYearId !== null && r.companyFiscalYearId !== undefined ? String(r.companyFiscalYearId) : undefined
  }));
}
