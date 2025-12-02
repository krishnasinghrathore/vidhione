import { useState } from 'react';
import { HoldingsPanel } from '../features/holdings/HoldingsPanel';
import { TransactionsPanel } from '../features/transactions/TransactionsPanel';
import { RealizedPanel } from '../features/realized/RealizedPanel';
import { ImportPanel } from '../features/imports/ImportPanel';

type Tab = 'holdings' | 'transactions' | 'realized' | 'import';

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>('holdings');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Wealth Tracker</h1>
          <p className="muted">Holdings, P&amp;L, and imports via GraphQL.</p>
        </div>
        <nav className="tabs">
          <TabButton id="holdings" current={tab} onSelect={setTab}>
            Holdings
          </TabButton>
          <TabButton id="transactions" current={tab} onSelect={setTab}>
            Transactions
          </TabButton>
          <TabButton id="realized" current={tab} onSelect={setTab}>
            Realized P&amp;L
          </TabButton>
          <TabButton id="import" current={tab} onSelect={setTab}>
            Imports
          </TabButton>
        </nav>
      </header>
      <main className="app-content">
        {tab === 'holdings' && <HoldingsPanel />}
        {tab === 'transactions' && <TransactionsPanel />}
        {tab === 'realized' && <RealizedPanel />}
        {tab === 'import' && <ImportPanel />}
      </main>
    </div>
  );
}

function TabButton({
  id,
  current,
  onSelect,
  children
}: {
  id: Tab;
  current: Tab;
  onSelect: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const active = current === id;
  return (
    <button className={active ? 'tab active' : 'tab'} onClick={() => onSelect(id)}>
      {children}
    </button>
  );
}
