import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export interface SummaryTableProps {
  title: string;
  data: any[];
  columns: { field: string; header: string; style?: React.CSSProperties }[];
  className?: string;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ title, data, columns, className = '' }) => {
  return (
    <div className={`bg-white border-1 border-200 border-round p-3 ${className}`}>
      <div className="text-lg font-semibold mb-3 text-900">{title}</div>
      <DataTable
        value={data}
        className="p-datatable-sm"
        scrollable
        scrollHeight="200px"
        style={{ fontSize: '12px' }}
      >
        {columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.header}
            headerStyle={{
              backgroundColor: '#ff8c00',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '12px',
              textAlign: 'center',
              border: '1px solid #e0e0e0',
              ...col.style
            }}
            bodyStyle={{
              textAlign: 'center',
              padding: '4px 8px',
              fontSize: '11px',
              border: '1px solid #e0e0e0',
              ...col.style
            }}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default SummaryTable;