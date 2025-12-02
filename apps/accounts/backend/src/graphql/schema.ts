import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean
} from 'graphql';
import { fetchLedger, LedgerRow } from './ledger';
import { fetchTrialBalance, TrialBalanceRow } from './trialBalance';
import { fetchProfitLoss, ProfitLossRow } from './profitLoss';
import { fetchBalanceSheet, BalanceSheetRow } from './balanceSheet';

const LedgerType = new GraphQLObjectType<LedgerRow>({
  name: 'LedgerRow',
  fields: {
    id: { type: GraphQLString },
    voucherDate: { type: GraphQLString },
    voucherDateCast: { type: GraphQLString },
    voucherNo: { type: GraphQLString },
    voucherType: { type: GraphQLString },
    ledger: { type: GraphQLString },
    narration: { type: GraphQLString },
    drAmt: { type: GraphQLString },
    crAmt: { type: GraphQLString },
    balance: { type: GraphQLString },
    drCr: { type: GraphQLString },
    companyId: { type: GraphQLString }
  }
});

const TrialBalanceType = new GraphQLObjectType<TrialBalanceRow>({
  name: 'TrialBalanceRow',
  fields: {
    ledgerGroup: { type: GraphQLString },
    ledger: { type: GraphQLString },
    openingBalance: { type: GraphQLString },
    debitAmount: { type: GraphQLString },
    creditAmount: { type: GraphQLString },
    toDate: { type: GraphQLString },
    companyId: { type: GraphQLString },
    companyFiscalYearId: { type: GraphQLString }
  }
});

const ProfitLossType = new GraphQLObjectType<ProfitLossRow>({
  name: 'ProfitLossRow',
  fields: {
    ledgerGroup: { type: GraphQLString },
    ledger: { type: GraphQLString },
    amount: { type: GraphQLString },
    side: { type: GraphQLString },
    toDate: { type: GraphQLString },
    companyId: { type: GraphQLString },
    companyFiscalYearId: { type: GraphQLString }
  }
});

const BalanceSheetType = new GraphQLObjectType<BalanceSheetRow>({
  name: 'BalanceSheetRow',
  fields: {
    ledgerGroup: { type: GraphQLString },
    ledger: { type: GraphQLString },
    amount: { type: GraphQLString },
    side: { type: GraphQLString },
    toDate: { type: GraphQLString },
    companyId: { type: GraphQLString },
    companyFiscalYearId: { type: GraphQLString }
  }
});

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ledger: {
        type: new GraphQLList(LedgerType),
        args: {
          ledgerId: { type: GraphQLString },
          fromDate: { type: GraphQLString },
          toDate: { type: GraphQLString },
          drCr: { type: GraphQLString },
          companyId: { type: GraphQLString },
          yearId: { type: GraphQLString },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt },
          voucherTypes: { type: new GraphQLList(GraphQLString) }
        },
        resolve: async (_src, args) => fetchLedger(args)
      },
      trialBalance: {
        type: new GraphQLList(TrialBalanceType),
        args: {
          toDate: { type: GraphQLString },
          companyId: { type: GraphQLString },
          yearId: { type: GraphQLString },
          includeOpening: { type: GraphQLBoolean },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt }
        },
        resolve: async (_src, args) => fetchTrialBalance(args)
      },
      profitLoss: {
        type: new GraphQLList(ProfitLossType),
        args: {
          toDate: { type: GraphQLString },
          companyId: { type: GraphQLString },
          yearId: { type: GraphQLString },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt }
        },
        resolve: async (_src, args) => fetchProfitLoss(args)
      },
      balanceSheet: {
        type: new GraphQLList(BalanceSheetType),
        args: {
          toDate: { type: GraphQLString },
          companyId: { type: GraphQLString },
          yearId: { type: GraphQLString },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt }
        },
        resolve: async (_src, args) => fetchBalanceSheet(args)
      }
    }
  })
});
