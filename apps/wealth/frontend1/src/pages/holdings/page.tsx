import { HoldingsPanel } from '../../features/holdings/HoldingsPanel';

export default function HoldingsPage() {
  return (
    <div className="page-card">
      <header className="panel-header">
        <div>
          <h2>Holdings</h2>
          <p className="muted">Portfolio snapshot with lots and current values.</p>
        </div>
      </header>
      <HoldingsPanel />
    </div>
  );
}

