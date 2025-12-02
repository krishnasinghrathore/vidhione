-- PostgreSQL view definitions to mirror legacy stored procedure outputs for Accounts reports.
-- Built from agency_db schemas (accounts.*, reporting.*) using the column layouts dumped in vidhione/accounts_schema_dump.txt.
-- Adjust the SELECT logic as needed to improve accuracy once business rules are confirmed.

-- Ledger (Select_Acc_Ledger)
-- Note: balance currently surfaces the line amount; running balance can be added later with window functions.
DROP VIEW IF EXISTS accounts.select_acc_ledger CASCADE;
CREATE OR REPLACE VIEW accounts.select_acc_ledger AS
SELECT
  vp.voucher_posting_id        AS id,
  vp.voucher_date_text         AS voucherdate,
  to_date(vp.voucher_date_text, 'YYYYMMDD') AS voucherdate_cast,
  vp.voucher_number            AS voucherno,
  vt.voucher_type_name         AS vouchertype,
  l.name                       AS ledger,
  vp.voucher_date_text         AS voucherdate1,
  l.ledger_id                  AS ledgerid,
  lg.name                      AS ledgergroup,
  lg.ledger_group_id           AS ledgergroupid,
  NULL::text                   AS agledger,
  vp.narration_text            AS narration,
  CASE WHEN vp.dr_cr_flag = 1 THEN vp.line_amount END AS dramt,
  CASE WHEN vp.dr_cr_flag = 2 THEN vp.line_amount END AS cramt,
  vp.line_amount               AS balance,
  CASE WHEN vp.dr_cr_flag = 1 THEN 'D' WHEN vp.dr_cr_flag = 2 THEN 'C' END AS drcr,
  vt.voucher_type_id           AS f_vouchertypemaster,
  COALESCE(vp.is_cancelled_flag, 0)::smallint AS isopening,
  NULL::text                   AS agledgerdetail,
  vp.company_id                AS company_id
FROM accounts.voucher_postings vp
LEFT JOIN accounts.ledgers l ON vp.ledger_id = l.ledger_id
LEFT JOIN accounts.ledger_groups lg ON l.ledger_group_id = lg.ledger_group_id
LEFT JOIN accounts.voucher_types vt ON vp.voucher_type_id = vt.voucher_type_id;

-- Trial Balance (Select_Acc_TrialBalance)
-- Uses ledger_balances; adapt to include period transactions as needed.
DROP VIEW IF EXISTS accounts.select_acc_trialbalance CASCADE;
CREATE OR REPLACE VIEW accounts.select_acc_trialbalance AS
SELECT
  lg.name                       AS ledgergroup,
  l.name                        AS ledger,
  lb.opening_balance_amount     AS openingbalance,
  NULL::numeric                 AS debitamount,
  NULL::numeric                 AS creditamount,
  NULL::text                    AS todate,
  l.company_id                  AS company_id,
  lb.company_fiscal_year_id     AS company_fiscal_year_id
FROM accounts.ledger_balances lb
LEFT JOIN accounts.ledgers l ON lb.ledger_id = l.ledger_id
LEFT JOIN accounts.ledger_groups lg ON l.ledger_group_id = lg.ledger_group_id;

-- Ledger Current Balance (Select_Acc_LedgerCurrentBalance)
DROP VIEW IF EXISTS accounts.select_acc_ledgcurrentbal CASCADE;
CREATE OR REPLACE VIEW accounts.select_acc_ledgcurrentbal AS
SELECT
  lg.name                    AS ledgergroup,
  l.name                     AS ledger,
  lb.last_opening_balance_amount AS amount,
  lb.last_balance_type       AS drcr
FROM accounts.ledger_balances lb
LEFT JOIN accounts.ledgers l ON lb.ledger_id = l.ledger_id
LEFT JOIN accounts.ledger_groups lg ON l.ledger_group_id = lg.ledger_group_id;

-- Profit & Loss (Select_Acc_ProfitLoss_Cr / Dr)
-- Stubbed using net_profit_lines; type_code can be used to split sides as business rules clarify.
DROP VIEW IF EXISTS accounts.select_acc_profitloss_cr CASCADE;
CREATE OR REPLACE VIEW accounts.select_acc_profitloss_cr AS
SELECT
  lg.name           AS ledgergroup,
  l.name            AS ledger,
  npl.amount        AS debitamount,
  NULL::text        AS todate,
  l.company_id      AS company_id,
  npl.company_fiscal_year_id AS company_fiscal_year_id
FROM reporting.net_profit_lines npl
LEFT JOIN accounts.ledgers l ON npl.ledger_id = l.ledger_id
LEFT JOIN accounts.ledger_groups lg ON l.ledger_group_id = lg.ledger_group_id
WHERE COALESCE(npl.type_code, 0) = 1; -- adjust split logic as needed

DROP VIEW IF EXISTS accounts.select_acc_profitloss_dr CASCADE;
CREATE OR REPLACE VIEW accounts.select_acc_profitloss_dr AS
SELECT
  lg.name           AS ledgergroup,
  l.name            AS ledger,
  npl.amount        AS debitamount,
  NULL::text        AS todate,
  l.company_id      AS company_id,
  npl.company_fiscal_year_id AS company_fiscal_year_id
FROM reporting.net_profit_lines npl
LEFT JOIN accounts.ledgers l ON npl.ledger_id = l.ledger_id
LEFT JOIN accounts.ledger_groups lg ON l.ledger_group_id = lg.ledger_group_id
WHERE COALESCE(npl.type_code, 0) <> 1; -- adjust split logic as needed

-- Balance Sheet (Select_Acc_BalanceSheet_Cr / Dr)
-- Uses ledger_balances; refine debit/credit assignment per business rules.
DROP VIEW IF EXISTS accounts.select_acc_balancesheet_cr CASCADE;
CREATE OR REPLACE VIEW accounts.select_acc_balancesheet_cr AS
SELECT
  lg.name                   AS ledgergroup,
  l.name                    AS ledger,
  lb.last_opening_balance_amount AS creditamount,
  NULL::text                AS todate,
  l.company_id              AS company_id,
  lb.company_fiscal_year_id AS company_fiscal_year_id
FROM accounts.ledger_balances lb
LEFT JOIN accounts.ledgers l ON lb.ledger_id = l.ledger_id
LEFT JOIN accounts.ledger_groups lg ON l.ledger_group_id = lg.ledger_group_id
WHERE COALESCE(lb.last_balance_type, 0) = 2; -- assume 2 = credit

DROP VIEW IF EXISTS accounts.select_acc_balancesheet_dr CASCADE;
CREATE OR REPLACE VIEW accounts.select_acc_balancesheet_dr AS
SELECT
  lg.name                   AS ledgergroup,
  l.name                    AS ledger,
  lb.last_opening_balance_amount AS debitamount,
  NULL::text                AS todate,
  l.company_id              AS company_id,
  lb.company_fiscal_year_id AS company_fiscal_year_id
FROM accounts.ledger_balances lb
LEFT JOIN accounts.ledgers l ON lb.ledger_id = l.ledger_id
LEFT JOIN accounts.ledger_groups lg ON l.ledger_group_id = lg.ledger_group_id
WHERE COALESCE(lb.last_balance_type, 0) = 1; -- assume 1 = debit

-- NOTE: The above views are starter mappings. Refine filters/aggregations (date range, company/year, running balances)
-- as soon as functional requirements are confirmed.
