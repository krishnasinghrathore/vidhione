import React, { useMemo, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Menu } from 'primereact/menu';

export type ExportKind = 'excel' | 'csv' | 'pdf' | 'print';

export type ReportToolbarProps = {
  title: string;
  onToggleFilters?: () => void;
  onRefresh?: () => void;
  onExport?: (kind: ExportKind) => void;
  rightExtra?: React.ReactNode;
  leftExtra?: React.ReactNode;
};

export default function ReportToolbar(props: ReportToolbarProps) {
  const menuRef = useRef<Menu>(null);

  const exportItems = useMemo(
    () => [
      { label: 'Excel', icon: 'pi pi-file-excel', command: () => props.onExport?.('excel') },
      { label: 'CSV', icon: 'pi pi-download', command: () => props.onExport?.('csv') },
      { label: 'PDF', icon: 'pi pi-file-pdf', command: () => props.onExport?.('pdf') },
      { separator: true },
      { label: 'Print', icon: 'pi pi-print', command: () => props.onExport?.('print') }
    ],
    [props.onExport]
  );

  const leftTemplate = () => (
    <div className="flex align-items-center gap-2">
      <h3 className="m-0">{props.title}</h3>
      {props.leftExtra}
    </div>
  );

  const rightTemplate = () => (
    <div className="flex align-items-center gap-2">
      <Button icon="pi pi-sliders-h" label="Filters" onClick={props.onToggleFilters} outlined />
      <Button icon="pi pi-refresh" label="Refresh" onClick={props.onRefresh} outlined />
      <Button
        icon="pi pi-upload"
        label="Export"
        onClick={(e) => menuRef.current?.toggle(e)}
        severity="success"
      />
      <Menu model={exportItems as any} popup ref={menuRef} />
      {props.rightExtra}
    </div>
  );

  return <Toolbar start={leftTemplate} end={rightTemplate} className="mb-3" />;
}