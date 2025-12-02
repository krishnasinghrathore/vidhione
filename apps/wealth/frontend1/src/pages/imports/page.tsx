import { ImportPanel } from '../../features/imports/ImportPanel';

export default function ImportPage() {
  return (
    <div className="page-card">
      <header className="panel-header">
        <div>
          <h2>Imports</h2>
          <p className="muted">Upload or paste CSV to load transactions.</p>
        </div>
      </header>
      <ImportPanel />
    </div>
  );
}

