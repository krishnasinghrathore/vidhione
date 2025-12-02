import { RealizedPanel } from '../../features/realized/RealizedPanel';

export default function RealizedPage() {
  return (
    <div className="page-card">
      <header className="panel-header">
        <div>
          <h2>Realized P&amp;L</h2>
          <p className="muted">FIFO-based realized profit/loss with summaries.</p>
        </div>
      </header>
      <RealizedPanel />
    </div>
  );
}

