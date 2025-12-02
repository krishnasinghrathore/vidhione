import React from 'react';
import { Menubar } from 'primereact/menubar';
import { MenuItem } from 'primereact/menuitem';

const MenuBar: React.FC = () => {
  const menuItems: MenuItem[] = [
    {
      label: 'Masters',
      items: [
        { label: 'Item Master' },
        { label: 'Ledger Master' },
        { label: 'Customer Master' },
        { label: 'Supplier Master' }
      ]
    },
    {
      label: 'Transactions',
      items: [
        { label: 'Sales' },
        { label: 'Purchase' },
        { label: 'Payment' },
        { label: 'Receipt' }
      ]
    },
    {
      label: 'Transport',
      items: [
        { label: 'Vehicle Management' },
        { label: 'Driver Management' },
        { label: 'Trip Management' }
      ]
    },
    {
      label: 'Reports',
      items: [
        { label: 'Sales Report' },
        { label: 'Purchase Report' },
        { label: 'Stock Report' },
        { label: 'Profit & Loss' }
      ]
    },
    {
      label: 'Accounts',
      items: [
        { label: 'Ledger' },
        { label: 'Day Book' },
        { label: 'Trial Balance' },
        { label: 'Balance Sheet' }
      ]
    },
    {
      label: 'GST',
      items: [
        { label: 'GSTR-1' },
        { label: 'GSTR-3B' },
        { label: 'E-Invoice' },
        { label: 'HSN Summary' }
      ]
    },
    {
      label: 'Additional Features',
      items: [
        { label: 'Backup' },
        { label: 'Restore' },
        { label: 'Data Import' },
        { label: 'Data Export' }
      ]
    },
    {
      label: 'Tools',
      items: [
        { label: 'Calculator' },
        { label: 'Calendar' },
        { label: 'Notepad' },
        { label: 'Settings' }
      ]
    },
    {
      label: 'Window',
      items: [
        { label: 'Cascade' },
        { label: 'Tile Horizontal' },
        { label: 'Tile Vertical' },
        { label: 'Close All' }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'User Manual' },
        { label: 'Keyboard Shortcuts' },
        { label: 'About' },
        { label: 'Support' }
      ]
    }
  ];

  const rightMenuItems: MenuItem[] = [
    { label: 'Hide Summary' },
    { label: 'E-App' },
    { label: 'Exit' }
  ];

  return (
    <div className="border-bottom-1 surface-border">
      <div className="flex justify-content-between align-items-center px-3 py-2">
        <Menubar model={menuItems} className="border-none bg-transparent" />
        <div className="flex gap-2">
          {rightMenuItems.map((item, index) => (
            <span
              key={index}
              className="p-menuitem-link cursor-pointer px-3 py-2 text-sm hover:surface-100 border-round"
              onClick={() => console.log(`${item.label} clicked`)}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuBar;