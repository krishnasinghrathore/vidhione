import { TransactionsPanel } from '../../features/transactions/TransactionsPanel';

export default function TransactionsPage() {
  return (
    <div className="page-card">
      <header className="panel-header">
        <div>
          <h2>Transactions</h2>
          <p className="muted">Raw ledger entries (BUY/SELL/DIVIDEND/etc.).</p>
        </div>
      </header>
      <TransactionsPanel />
    </div>
  );
}

