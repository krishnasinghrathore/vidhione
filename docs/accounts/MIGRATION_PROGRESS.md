# Migration Progress Log

This document records every discovery and decision while porting the legacy **Agency Manager** desktop suite into the new Encore + GraphQL + Drizzle stack under `vidhione/`. Update it whenever a task starts or completes so we can resume even if conversation history is lost.

---

## Current Context

- **Target stack:** Encore TS backends, React + Vite frontends, PostgreSQL, Drizzle ORM, GraphQL (confirmed in `vidhione/` workspace).
- **Legacy sources:** WinForms solutions under `legacy-projects/Agency_Manager/Agency_Manager` and shared DLLs under `legacy-projects/General/General_Desktop` plus `General_Classes`.
- **Primary goal:** Rebuild all accounting + agency forms (display first, then masters, reports, transactions) against PostgreSQL `agency_db`, keeping shared accounts features centralized for multi-client SaaS.

---

## Completed 2024-05-?? (Current Session)

### 1. Inventory of Legacy Agency Forms
Extracted from `legacy-projects/Agency_Manager/Agency_Manager/frmMDI.cs`. Each item represents a WinForms screen accessible from the MDI shell.

| Form | Handlers + references |
| --- | --- |
| `frmASAreaWiseSummary` | `areaWiseSummaryToolStripMenuItem_Click` (`frmMDI.cs:L717`) |
| `frmASBillCollection` | `billCollectionBookToolStripMenuItem_Click` (`L1568`) |
| `frmASCashReceiptBook` | `cashReceiptBookToolStripMenuItem_Click` (`L1405`) |
| `frmASClosingStock` | `stockInToolStripMenuItem1_Click` (`L673`) |
| `frmASDeliveryProcess` | `deliveryProcessBookToolStripMenuItem_Click` (`L543`) |
| `frmASEInvoice` | `eInvoiceToolStripMenuItem_Click` (`L1928`) |
| `frmASEInvoiceAknowledgement` | `eInvoiceAknowledgementToolStripMenuItem_Click` (`L1937`) |
| `frmASEWayBill` | `eWayBillToolStripMenuItem_Click` (`L1819`) |
| `frmASG1BillDetails` | `g1BillDetailsToolStripMenuItem_Click` (`L1352`) |
| `frmASInvoice` | `saleBookToolStripMenuItem_Click` (`L447`) plus dashboard double-clicks (`L785`, `L807`, `L840`, `L1948`) and estimate menu items (`L1152–L1215`) |
| `frmASInvoiceRollover` | `invoiceRolloverToolStripMenuItem_Click` (`L1362`) |
| `frmASInvoiceSheetImport` | `importG1InvoicesToolStripMenuItem_Click` (`L1919`) |
| `frmASMReceiptCashManualBook` | `moneyReceiptManualBookIssueDetailToolStripMenuItem_Click` (`L741`) |
| `frmASMoneyReceiptBankBook` | `moneyReceiptBankBookToolStripMenuItem_Click` (`L639`) |
| `frmASMoneyReceiptCashBook` | `moneyReceiptCashToolStripMenuItem_Click` (`L651`) |
| `frmASPartyLoyaltyProgram` | `partyLoyaltyProgramToolStripMenuItem1_Click` (`L1750`) |
| `frmASPartyRates` | `partyRateBooksToolStripMenuItem_Click` (`L705`) |
| `frmASPartyWiseItemSaleDetail` | `partyWiseItemSaleDetailToolStripMenuItem_Click` (`L729`) |
| `frmASPurchase` | `purchaseBookToolStripMenuItem_Click` (`L610`) & `toolStripMenuItem20–22_Click` (`L1110`, `L1124`, `L1138`) |
| `frmASScheme` | `schemeBookToolStripMenuItem_Click` (`L564`) |
| `frmASStockLedger` | `stockLedgerToolStripMenuItem_Click` (`L598`) |
| `frmASStockPosition` | `stockPositionToolStripMenuItem_Click` (`L586`) |
| `frmASTransportSheetImport` | `importTransportSheetToolStripMenuItem_Click` (`L1889`) |
| `frmASTransportStockAnalysis` | `transportStockAnalysisToolStripMenuItem_Click` (`L1900`) |
| `frmASTransportStockIn` | `transportStockInToolStripMenuItem1_Click` (`L1879`) |
| `frmAllMaster` | Multiple menus: `itemBrand`, `itemType`, `manager`, `otherLedgers`, `deliveryStatus`, `billCollectionStatus` (`L299–L508`, `L1557`) |
| `frmAssignTaxation` | `fastItemEditToolStripMenuItem_Click` (`L1665`) |
| `frmBillCollection` | `billCollectionToolStripMenuItem_Click` (`L1541`) |
| `frmClosingStock` | `stockInToolStripMenuItem_Click` (`L661`) |
| `frmDeliveryProcess` | `deliveryProcessToolStripMenuItem_Click` (`L531`) |
| `frmEApp_Sync` | `syncToolStripMenuItem_Click` (`L1979`) |
| `frmInvoice` | Sales menus: invoice/new, return, vouchers (`L920–L1021`) |
| `frmInvoice_GST` | GST sales/estimate menus (`L1192`, `L1578`, `L1598`) |
| `frmItemMaster` | `itemToolStripMenuItem_Click` (`L416`) |
| `frmItemMaster_GST` | `itemGSTToolStripMenuItem_Click` (`L1656`) |
| `frmMoneyReceiptBank` | Bank receipt + cheque inward (`L627`, `L1799`) |
| `frmMoneyReceiptCash` | `moneyReceiptToolStripMenuItem_Click` (`L574`) |
| `frmMoneyReceiptManualBookIssue` | `moneyReceiptManualBookIssueToolStripMenuItem_Click` (`L751`) |
| `frmOptions` | `backupToolStripMenuItem_Click` (`L89`), `optionsToolStripMenuItem_Click` (`L198`) |
| `frmPartyLoyaltyProgram` | `partyLoyaltyProgramToolStripMenuItem_Click` (`L1738`) |
| `frmPartyRates` | `partyRatesToolStripMenuItem_Click` (`L683`) |
| `frmPurchase` | Invoice + voucher menus (`L962–L1089`) |
| `frmPurchase_GST` | GST purchase menus (`L1618`, `L1637`) |
| `frmRetailerFootPath` | `retailorFootPathToolStripMenuItem_Click` (`L693`) |
| `frmScheme` | `schemeToolStripMenuItem_Click` (`L459`) |
| `frmTransportStockIn` | `transportStockInToolStripMenuItem_Click` (`L1837`) |

### 2. Inventory of Shared/Accounts Forms (General_Desktop)
Also triggered from `frmMDI`. These map to the centralized accounts UI that will feed the modern Accounts service.

| Form | Handlers + references |
| --- | --- |
| `frmASBillWiseDailySale` | `gSTFromBooksToolStripMenuItem_Click` (`L1674`), `_1_Click` (`L1692`) |
| `frmASGSTHSNWiseSummary` | `gSTHSNWiseSummaryToolStripMenuItem_Click` (`L1970`) |
| `frmASLedgerBook` | `updateLedgerBalanceToolStripMenuItem_Click` (`L1415`) |
| `frmASLogDetails` | `logDetailsToolStripMenuItem_Click` (`L1517`) |
| `frmAccountReports` | `accountsReportsToolStripMenuItem_Click` (`L1325`) |
| `frmAllMaster` | Misc reference data menus (`L223–L522`, `L1853`, `L1868`) |
| `frmAreaMaster` | `areaToolStripMenuItem_Click` (`L261`) |
| `frmAudit` | `postingDetailsToolStripMenuItem_Click` (`L1333`) |
| `frmBalanceSheet` | `balanceSheetToolStripMenuItem1_Click` (`L1729`) |
| `frmBalanceSheet2` | `balanceSheetToolStripMenuItem_Click` (`L1442`) |
| `frmBankCashDeposit` | `bankCashDepositToolStripMenuItem_Click` (`L1479`) |
| `frmBankChequeIssue` | `chequeIssueEntryToolStripMenuItem_Click` (`L1489`) |
| `frmBankReconciliation` | `bankReconcilliationToolStripMenuItem_Click` (`L1499`) |
| `frmBookPrinting` | `bookPrintingToolStripMenuItem_Click` (`L1790`) |
| `frmChangePassword` | `changePasswordToolStripMenuItem_Click` (`L189`) |
| `frmChequeBookIssue` | `chequeBookIssueToolStripMenuItem_Click` (`L1342`) |
| `frmCityMaster` | `cityToolStripMenuItem_Click` (`L252`) |
| `frmCompanyMaster` | `companyToolStripMenuItem_Click` (`L207`) |
| `frmCompanyYears` | `changeSessionToolStripMenuItem_Click` (`L1275`) |
| `frmDayBook` | `dayBookToolStripMenuItem_Click` (`L1385`) |
| `frmDepreciation` | `depreciationToolStripMenuItem_Click` (`L1508`) |
| `frmExpenditure` | `expenditureToolStripMenuItem_Click` (`L1469`) |
| `frmGSTDifferenceReport` | `gSTDifferenceReportToolStripMenuItem_Click` (`L1781`) |
| `frmGSTR1` | `gSTR1ToolStripMenuItem_Click` (`L1710`) |
| `frmGSTR3B` | `gSTR3BToolStripMenuItem_Click` (`L1810`) |
| `frmGSTR_TaxReport` | `gSTTaxReportToolStripMenuItem_Click` (`L1828`) |
| `frmGSTReports` | `gSTReportsToolStripMenuItem_Click` (`L1683`, `L1701`) |
| `frmLedgerBook` | `addressBookToolStripMenuItem_Click` (`L1460`) |
| `frmLedgerGroupMaster` | `ledgerGroupToolStripMenuItem_Click` (`L1041`) |
| `frmLedgerMaster` | `partyToolStripMenuItem_Click` (`L406`) |
| `frmLedgerMonthSummary` | `ledgerMonthWiseSummaryToolStripMenuItem_Click` (`L1424`) |
| `frmLedgerNew` | `ledgerToolStripMenuItem_Click` (`L553`) |
| `frmMailMaster` | `sendMailToolStripMenuItem_Click` (`L1451`) |
| `frmProfitLoss` | `profitLossToolStripMenuItem_Click` (`L1433`) |
| `frmReportMaster` | `reportSettingsToolStripMenuItem_Click` (`L1910`) |
| `frmStateMaster` | `stateToolStripMenuItem_Click` (`L243`) |
| `frmStockInHand` | `stockInHandToolStripMenuItem_Click` (`L1531`) |
| `frmTrialBalance` | `trialBalanceToolStripMenuItem_Click` (`L1394`) |
| `frmUserMaster` | `usersToolStripMenuItem_Click` (`L233`) |
| `frmVATReports` | `vATReportsToolStripMenuItem_Click` (`L1372`) |
| `frmVoucherEntry2` | `voucherEntryToolStripMenuItem_Click` (`L1236`), `voucherEntry2ToolStripMenuItem_Click` (`L1719`) |
| `frmVoucherTypeMaster` | `voucherOptionsToolStripMenuItem_Click` (`L1227`) |

### 3. Backend wiring scaffolding

  - Added `vidhione/apps/accounts/backend/src/db/client.ts` that centralizes the PostgreSQL connection (using `pg` + Drizzle). The helper looks for `AGENCY_DB_URL` / `ACCOUNTS_DB_URL` / `DATABASE_URL` and optionally enables SSL; this file will be imported by our Encore modules and the GraphQL resolver layer.
  - Added a local `package.json` for the accounts backend at `vidhione/apps/accounts/backend/package.json` with its own dependencies (`drizzle-orm`, `pg`) to keep per-app installs isolated. `npm install` still needs to be run from a supported shell (WSL2/Windows) in that folder or the repo root to generate `package-lock.json`.
  - Documented backend setup details in `vidhione/apps/accounts/backend/README.md`, covering environment variables (`AGENCY_DB_URL`, `PGSSL`, etc.), the WSL install caveat, and the roadmap for Drizzle schemas + GraphQL modules.
  - Removed the unused monorepo root manifest `vidhione/package.json` per request to keep dependencies scoped to each app/service.
  - `npm install` has now been run (lockfiles and `node_modules` exist under `apps/accounts/backend/`), so Drizzle/pg dependencies are available for backend development.
  - Scaffolded accounts backend structure:
    - `src/db/schemas/` with a README and `index.ts` for exporting upcoming Drizzle table/view definitions.
    - `src/graphql/ledger.ts` stub with target params/types for the ledger query; implementation is pending once schemas are defined (to mirror `Select_Acc_Ledger`/`Select_Acc_LedgerCurrentBalance`).
  - Added initial Drizzle view mappings for legacy outputs, derived from `dataset_Accounts.Designer.cs`:
    - `src/db/schemas/ledger.ts` → `selectAccLedger` (Select_Acc_Ledger).
    - `src/db/schemas/trialBalance.ts` → `selectAccTrialBalance`, `selectAccLedgerCurrentBalance`.
    - `src/db/schemas/profitLoss.ts` → `selectAccProfitLossCr`, `selectAccProfitLossDr`.
    - `src/db/schemas/balanceSheet.ts` → `selectAccBalanceSheetCr`, `selectAccBalanceSheetDr`.
    - `graphql/ledger.ts` now returns a limited result set from `selectAccLedger` (filters TODO) so wiring can be validated once matching PostgreSQL views exist.
    - Added GraphQL scaffolds for Trial Balance (`graphql/trialBalance.ts`), Profit & Loss (`graphql/profitLoss.ts`), and Balance Sheet (`graphql/balanceSheet.ts`); these currently page over the Drizzle views and map amounts to strings, with business filters still pending.
  - Populated SQL view definitions in `src/db/sql/views_legacy_accounts.sql` using the `agency_db` schema dump (`accounts_schema_dump.txt`). Views now select from `accounts.voucher_postings`, `accounts.ledgers`, `accounts.ledger_groups`, `accounts.voucher_types`, `accounts.ledger_balances`, and `reporting.net_profit_lines`. These are starter mappings; refine business logic (date filters, debit/credit rules, running balances) as requirements are confirmed.
  - Added a helper to apply the views directly via pg: `apps/accounts/backend/scripts/apply_views.js` (`node scripts/apply_views.js --url "postgres://..."`). It reads `src/db/sql/views_legacy_accounts.sql` by default and uses `AGENCY_DB_URL` if no URL flag is provided.
  - Applied filters to `graphql/ledger.ts` (ledgerId, dr/cr, voucherTypes; pagination retained). Trial balance remains a simple view reader; business filters/date range can be added once requirements are set.
  - Extended views and resolvers with company/year filters:
    - Views now carry `company_id` and `company_fiscal_year_id` where applicable (ledger, trial balance, profit/loss, balance sheet).
    - Resolvers for profit/loss and balance sheet filter by `companyId`/`yearId`; ledger already handles company/date/dr-cr/voucher types.
  - Added proper date casting for ledger filters: `select_acc_ledger` now exposes `voucherdate_cast` (to_date on yyyymmdd) and the ledger resolver filters on that for from/to dates.
  - Added a minimal GraphQL endpoint for accounts reporting:
    - New dependencies: `graphql`, `graphql-http`, `ts-node`; start via `npm run dev` in `apps/accounts/backend`.
    - Schema: `src/graphql/schema.ts` (queries for ledger, trialBalance, profitLoss, balanceSheet).
    - Server: `src/graphql/server.ts` serving `/graphql` on port 4000 by default.
    - Usage note: run `npm install` in `apps/accounts/backend`, then `AGENCY_DB_URL="postgres://.../agency_db" npm run dev:graphql` and hit `http://localhost:4000/graphql`. Example query:
    ```graphql
    {
      ledger(companyId: "1", fromDate: "2015-07-01", toDate: "2015-07-31", limit: 20) {
        voucherNo
        voucherDate
        ledger
        drAmt
        crAmt
        balance
      }
    }
    ```
    Additional sample queries:
    ```graphql
    {
      trialBalance(companyId: "1", yearId: "2024", limit: 50) {
        ledgerGroup
        ledger
        openingBalance
        debitAmount
        creditAmount
      }
      profitLoss(companyId: "1", yearId: "2024") {
        ledgerGroup
        ledger
        amount
        side
      }
      balanceSheet(companyId: "1", yearId: "2024") {
        ledgerGroup
        ledger
        amount
        side
      }
    }
    ```
  - Added Encore TS wiring for accounts backend:
    - `encore.app` JSON at backend root; removed the old `encore.app.ts`.
    - Service definition at `src/encore.service.ts` (Service name: accounts).
    - GraphQL exposed via Encore at `src/api.ts` (`/graphql` using `graphql-http` handler, GET + POST); optional standalone dev server at port 4000 via `npm run dev:graphql`.
    - Added `tsconfig.json` (ES2022, moduleResolution bundler, composite, strict) aligned with the InterLogIQ reference.
    - package.json scripts aligned with InterLogIQ: `dev`/`encore:run`, optional `dev:graphql`, `apply:views`, plus drizzle scripts (`drizzle:generate`, `drizzle:migrate`, `drizzle:push`, `drizzle:studio`, `migrate:app`).
    - Added Drizzle config scaffolding at `src/drizzle/drizzle.config.ts`; migration runner moved to `scripts/run-migrations.ts` to keep Encore parser clean.
    - Drizzle views now specify `schema: 'accounts'` to ensure correct resolution against the namespaced database objects.
    - Convenience scripts to run Encore with env defaults: `scripts/run-encore.sh` (bash) and `scripts/run-encore.ps1` (PowerShell). Both set `AGENCY_DB_URL` and `ENCORE_NODE_MODULES` if not already set, then invoke `npm run encore:run`.
  - Hardened Encore REST responses: resolvers now coerce all fields to primitives/strings to avoid circular JSON errors during serialization (was seen on balanceSheetApi).
  - Added SQL templates for legacy-compatible views at `src/db/sql/views_legacy_accounts.sql` (placeholders to be replaced with real SELECTs against `agency_db` once schema is confirmed).
  - Added `graphql/trialBalance.ts` scaffold that reads from `selectAccTrialBalance` (pagination params present; business filters pending).

---

## Data Mapping (Initial Pass)

Extracted the legacy stored procedure names referenced inside the highest-priority forms so we can replicate their result-sets in PostgreSQL (via Drizzle + GraphQL) and keep feature parity.

### Agency display / transaction forms

- `frmASInvoice`: `Select_AS_SaleInvoiceH`, `Select_InvoiceL_GST`, `Select_AS_EstimateH`, `Select_AS_EInvoiceAknowledgementH`, `Select_AS_VAT8`, `Select_AS_VATDifference`, `Select_SaleBillNo_DateWise`, `Select_LedgerMaster_Spl`, `Select_LoadingSheet`, `Select_Common_MaxVoucherNo`, `Select_PartyDebitNotes`, `Select_PartyCreditNotes`, `Select_AdditionalTaxation`, `Select_PartyDebitNotes`, plus report exporters `Select_rptInvoice`, `Select_rptInvoice_GST`, `Select_rptInvoice_Tax`.
- `frmASPurchase`: `Select_AS_PurchaseInvoiceH`, `Select_PurchaseInvoiceL_GST`, `Select_PurchaseBillNo_DateWise`, `Select_LedgerMaster_Spl`, `Select_LoadingSheet`, `Select_AS_VAT8`, with report hooks `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASStockLedger`: `Select_AS_StockLedger`, `Select_AS_StockLedgerMonthWise`, `Select_LedgerMaster_Spl`.
- `frmASStockPosition`: `Select_AS_StockPosition`, `Select_AS_StockLedger`, `Select_AS_StockPostion_rpt`, `Select_StockInL`, `Select_PurchaseL`, `Select_TradingPurchaseL`, `Select_LoadingSheet`, `Select_LedgerMaster_Spl`, `Select_Common_MaxVoucherNo`, `Select_VoucherType`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASCashReceiptBook`: `Select_AS_CashReceiptBook`, `Select_LedgerMaster_Spl`, `Select_Master`.
- `frmASMoneyReceiptCashBook`: `Select_AS_MoneyReceiptCashH`, `Select_AS_MoneyReceiptCashH_Detailed`, `Select_MReceiptBillNo_DateWise`, `Select_MReceiptNo`, `Select_LedgerMaster_Spl`, and report exporters `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASMoneyReceiptBankBook`: `Select_AS_MoneyReceiptBankH`, `Select_AS_MoneyReceiptBankH_Detailed`, `Select_MReceiptBillNo_DateWise`, `Select_MReceiptNo`, `Select_LedgerMaster_Spl`, plus `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASPartyRates`: `Select_AS_PartyRateH`, `Select_PartyRateL`, `Select_LedgerMaster_Spl`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASScheme`: `Select_AS_SchemeH`, `Select_SchemeL`, `Select_LedgerMaster_Spl`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASAreaWiseSummary`: `Select_AS_AreaWiseSummary`, `Select_AS_AreaWiseSummary_New`, `Select_AS_Filter_LedgerMaster_Area`, `Select_AS_Filter_ItemMaster_Brand`, `Select_AS_Filter_OtherLedgerMaster_Ledger`, `Select_AS_InvoiceDetail`, `Select_LedgerMaster_Spl`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASPartyWiseItemSaleDetail`: `Select_AS_PartyWiseItemSaleDetail`, `Select_AS_PartyWiseItemSaleDetail_Summary`, `Select_AS_PartyWiseItemSaleDetail_ItemList`, plus the same filter helpers (`Select_AS_Filter_*`) and `Select_LedgerMaster_Spl`.
- `frmASTransportStockIn`: `Select_AS_TransportStockInH`, `Select_rptTransportStockIn`.

_(Remaining items to catalog in detail: `frmEApp_Sync` internals and any miscellaneous utility forms not yet inspected.)_

#### Collections, receipts, loyalty

- `frmMoneyReceiptCash`: `Select_BillNo_MoneyReceipt`, `Select_PaidAmountBy_MoneyReceipt`, `Select_DebitNoteBillNo_MoneyReceipt`, `Select_DebiteNotePaidAmountBy_MoneyReceipt`, `Select_MReceiptNo`, `Select_MRBookIssueDetail`, `Select_LedgerMaster_Spl`, `Select_MaxReceiptNo_MoneyReceiptCash`, `Select_SaleBillDetails`, `Select_SaleBillNo_YearWise`, `Select_VoucherL_InvoiceRollover`, `Select_Common_MaxVoucherNo`, `Select_CompanyYears`, `Select_AS_`, `Select_DuplicateMoneyReceiptNo`.
- `frmMoneyReceiptBank`: shares all selectors above and adds `Select_AS_MoneyReceiptBankH`, `Select_BankLedgerBy_ById`, `Select_Master`, `Select_MaxReceiptNo_MoneyReceiptBank`.
- `frmMoneyReceiptManualBookIssue`: `Select_Common_MaxVoucherNo`, `Select_MaxId_Master`.
- `frmASMReceiptCashManualBook`: `Select_AS_MoneyReceiptIssueBookH`, `Select_LedgerMaster_Spl`, `Select_MReceiptBookNo_DateWise`.
- `frmASCashReceiptBook`: `Select_AS_CashReceiptBook`, `Select_LedgerMaster_Spl`, `Select_Master`.
- `frmASMoneyReceiptCashBook`: `Select_AS_MoneyReceiptCashH`, `Select_AS_MoneyReceiptCashH_Detailed`, `Select_MReceiptBillNo_DateWise`, `Select_MReceiptNo`, `Select_LedgerMaster_Spl`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASMoneyReceiptBankBook`: `Select_AS_MoneyReceiptBankH`, `Select_AS_MoneyReceiptBankH_Detailed`, `Select_MReceiptBillNo_DateWise`, `Select_MReceiptNo`, `Select_LedgerMaster_Spl`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmBillCollection`: `Select_AS_BillCollectionH_rpt`, `Select_AS_BillCollectionH_rpt2`, `Select_BillNo_MoneyReceipt_BillCollection`, `Select_PaidAmountBy_MoneyReceipt`, `Select_Common_L`, `Select_Common_MaxVoucherNo`, `Select_MaxId_Master`.
- `frmASBillCollection`: `Select_AS_BillCollectionH`, `Select_BillCollectionL`, `Select_BillCollectionBillNo_DateWise`, `Select_BillCollectionStatus_ByOrderNo`, `Select_LoadingSheet`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmPartyLoyaltyProgram`: `Select_AS_PartyLoyaltyProgramH`, `Select_AreaWiseRetailor`, `Select_Master`, `Select_Common_MaxVoucherNo`, `Select_MaxId_Master`.
- `frmASPartyLoyaltyProgram`: `Select_AS_PartyLoyaltyProgramH`, `Select_AS_`, `Select_LedgerMaster_Spl`.

#### Delivery, logistics, e-compliance

- `frmDeliveryProcess`: `Select_SaleBillDetails`, `Select_BillNo_DateWise`, `Select_Common_L`, `Select_Common_MaxVoucherNo`, `Select_MaxTripNo`, `Select_MaxId_Master`.
- `frmASDeliveryProcess`: `Select_AS_DeliveryProcessH`, `Select_DeliveryProcessL`, `Select_DeliveryBillNo_DateWise`, `Select_DeliveryStatus_ByOrderNo`, `Select_CheckedBy_ById`, `Select_LedgerMaster_Spl`, `Select_LoadingSheet`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmASEWayBill`: `Select_AS_E_Way_Bill`.
- `frmASEInvoice`: `Select_AS_E_Invoice`, `Select_AS_E_InvoiceReturn`, `Select_AS_E_PurchaseInvoiceReturn`, `Select_AS_E_ServiceInvoice`.
- `frmASEInvoiceAknowledgement`: `Select_AS_EInvoiceAknowledgementH`.
- `frmASInvoiceSheetImport`: `Select_SaleInvoice_ImportH`, `Select_ItemSaleTaxMaster_GST`, `Select_ItemTypeDetailMaster`.
- `frmASG1BillDetails`: `Select_AS_G1BillDetails`, `Select_LedgerMaster_Spl`.
- `frmASTransportSheetImport`: `Select_Transport_ImportH`, `Select_ItemSaleTaxMaster_GST`.
- `frmTransportStockIn`: `Select_Transport_PurVoucherNo_List`, `Select_Purchase_ImportH`, `Select_ItemSaleTaxMaster`, `Select_ItemUnitMaster`, `Select_Common_L`, `Select_Common_MaxVoucherNo`, `Select_MaxId_Master`, `Select_rptTransportStockIn`.
- `frmASTransportStockIn`: `Select_AS_TransportStockInH`, `Select_rptTransportStockIn`.
- `frmASTransportStockAnalysis`: `Select_AS_TransportStockAnalysis`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.
- `frmEApp_Sync`: `Select_AS_SyncSummary` (reads sync summary via `clsFunctions.GetSqlDataReader`; no Update/Delete proc usage observed).

#### Inventory / valuation

- `frmClosingStock`: `Select_ItemSaleTaxMaster`, `Select_ItemLandingCost`, `Select_ItemUnitMaster`, `Select_Common_L`, `Select_Common_MaxVoucherNo`, `Select_MaxId_Master`.
- `frmASClosingStock`: `Select_AS_StockInH`, `Select_StockInL2`, `Select_PurchaseL`, `Select_rptInvoice`, `Select_rptInvoice_Tax`.


### Accounts / shared forms (General_Desktop)

- `frmLedger` & `frmLedgerBook`: `Select_Acc_Ledger`, `Select_Acc_Ledger_Summary`, `Select_Acc_LedgerCurrentBalance`, `Select_Acc_Ledger_SummaryNew`, `Select_AS_PartyBook`, `Select_LedgerMaster_Spl`, `Select_VoucherType`.
- `frmDayBook`: `Select_Acc_DayBook`, `Select_VoucherType`, `Select_LedgerMaster_Spl`.
- `frmTrialBalance`: `Select_Acc_TrialBalance`, `Select_Acc_LedgerCurrentBalance`, `Select_Acc_Common_MaxVoucherNo`, `Select_Acc_BookPrinting`, `Select_VoucherType`, `Select_LedgerMaster_Spl`, `Select_City_List`.
- `frmProfitLoss`, `frmBalanceSheet`, `frmBalanceSheet2`: share `Select_Acc_ProfitLoss`, `Select_Acc_ProfitLossDetails`, `Select_Acc_ProfitLossPost`, `Select_Acc_TrialBalance`, `Select_Acc_LedgerCurrentBalance`, `Select_LedgerMaster_Spl`, plus `Select_TMP_BalanceSheet` for BalanceSheet2.
- `frmGSTR1`, `frmGSTR3B`, `frmGSTReports`, `frmGSTDifferenceReport`, `frmGSTR_TaxReport`: rely on `Select_AS_GSTR1`, `Select_AS_GSTR`, `Select_AS_GSTR2`, `Select_tmp_GSTR2A`, `Select_tmp_GSTR3B`, `Select_AS_BillWiseDailySale/Purchase/Journal_TaxWise`, and ledger filters.
- `frmGSTHSNWiseSummary`: `Select_AS_GST_HSNWiseSummary`.
- `frmVoucherEntry2`/`frmVoucherEntry`: `Select_Acc_VoucherEntry`, `Select_VoucherL/VoucherL2`, `Select_Common_L`, `Select_Acc_Common_MaxVoucherNo`, `Select_Acc_LedgerCurrentBalance`, `Select_Master`, `Select_LedgerMaster_Spl`, etc.
- `frmAccountReports`: `Select_Acc_Trading`, `Select_Acc_ProfitLoss`, `Select_Acc_BalanceSheet`, `Select_Acc_TrialBalance`.
- `frmBankCashDeposit`, `frmBankChequeIssue`, `frmBankReconciliation`: `Select_Acc_VoucherEntry`, `Select_Acc_Expenditure`, `Select_Acc_BankReconciliation`, `Select_LedgerMaster_Spl`, `Select_Master`, specialized procedures like `Select_ChequeBookIssueDetail`, `Select_DuplicateChequeNo`, `Select_MaxChequeNo`.
- `frmStockInHand`: `Select_Acc_StockInHand`, `Select_Acc_Common_MaxVoucherNo`, `Select_LedgerMaster_Spl`, `Select_Master`.

> These procedure names now give us the source contract to mirror on PostgreSQL. As we inspect each WinForms code-behind we’ll append parameter lists, expected result columns, and Drizzle GraphQL equivalents here.

---

## Next Planned Actions

1. **Frontend wiring:** Build accounts frontend routes/pages for ledger, trial balance, P&L, and balance sheet consuming the `/graphql` endpoint (or `/graphiql` for testing).
2. **Optional backend refinements:** Add date casting/filters to P&L and Balance Sheet if needed; add pagination defaults consistently across queries (current limit defaults exist).
3. **Database Access:** Keep `AGENCY_DB_URL` configured for dev/prod; document SSL requirements. Ensure Encore/Node are available in the runtime environment.
4. **Data Mapping (if needed):** Remaining legacy forms can be mapped similarly if more reports are to be added.

> _Keep updating this log at every milestone: discovery complete, schema created, resolver implemented, UI hooked, etc._
