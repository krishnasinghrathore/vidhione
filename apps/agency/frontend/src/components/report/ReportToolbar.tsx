import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

export type ReportToolbarProps = {
  title: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  rightExtras?: React.ReactNode;
  leftExtras?: React.ReactNode;
};

const ReportToolbar: React.FC<ReportToolbarProps> = ({ title, onRefresh, onExport, onPrint, rightExtras, leftExtras }) => {
  const left = (
    <div className="flex align-items-center gap-3">
      <div className="text-xl font-semibold">{title}</div>
      {leftExtras}
    </div>
  );

  const right = (
    <div className="flex gap-2">
      <Button label="Export" icon="pi pi-download" outlined size="small" onClick={onExport} />
      <Button label="Print" icon="pi pi-print" outlined size="small" onClick={onPrint} />
      <Button label="Refresh" icon="pi pi-refresh" severity="secondary" size="small" onClick={onRefresh} />
      {rightExtras}
    </div>
  );

  return <Toolbar start={left} end={right} className="mb-3" />;
};

export default ReportToolbar;