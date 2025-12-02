import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

const topItems: TopItem[] = [
  { name: 'Product A', quantity: 120, revenue: 24000 },
  { name: 'Product B', quantity: 92, revenue: 18400 },
  { name: 'Product C', quantity: 85, revenue: 13600 },
  { name: 'Product D', quantity: 75, revenue: 15000 },
  { name: 'Product E', quantity: 68, revenue: 10200 },
];

const TopItemsTable: React.FC = () => {
  return (
    <DataTable value={topItems} responsiveLayout="scroll" stripedRows>
      <Column field="name" header="Item"></Column>
      <Column field="quantity" header="Quantity Sold"></Column>
      <Column field="revenue" header="Revenue (₹)"></Column>
    </DataTable>
  );
};

export default TopItemsTable;
