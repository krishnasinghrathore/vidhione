import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

export type ReportFilters = {
  from?: Date | null;
  to?: Date | null;
  branch?: string | null;
};

export type FilterSidebarProps = {
  visible: boolean;
  onHide: () => void;
  value: ReportFilters;
  onChange: (next: ReportFilters) => void;
  branches?: { label: string; value: string }[];
  title?: string;
};

export default function FilterSidebar(props: FilterSidebarProps) {
  const { visible, onHide, value, onChange, branches = [], title = 'Filters' } = props;

  return (
    <Sidebar visible={visible} position="right" onHide={onHide} className="w-20rem">
      <div className="flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">{title}</h3>
        <Button icon="pi pi-times" onClick={onHide} rounded text aria-label="Close" />
      </div>

      <div className="flex flex-column gap-3">
        <div>
          <label className="block mb-2">From</label>
          <Calendar
            value={value.from ?? null}
            onChange={(e) => onChange({ ...value, from: (e.value as Date) ?? null })}
            dateFormat="dd-M-yy"
            showIcon
          />
        </div>

        <div>
          <label className="block mb-2">To</label>
          <Calendar
            value={value.to ?? null}
            onChange={(e) => onChange({ ...value, to: (e.value as Date) ?? null })}
            dateFormat="dd-M-yy"
            showIcon
          />
        </div>

        <div>
          <label className="block mb-2">Branch</label>
          <Dropdown
            value={value.branch ?? null}
            options={branches}
            onChange={(e) => onChange({ ...value, branch: (e.value as string) ?? null })}
            placeholder="Select Branch"
            className="w-full"
            showClear
          />
        </div>

        <div className="pt-2 flex gap-2">
          <Button label="Apply" icon="pi pi-check" severity="success" className="w-6" onClick={onHide} />
          <Button
            label="Reset"
            icon="pi pi-refresh"
            severity="secondary"
            className="w-6"
            onClick={() => onChange({ from: null, to: null, branch: null })}
          />
        </div>
      </div>
    </Sidebar>
  );
}