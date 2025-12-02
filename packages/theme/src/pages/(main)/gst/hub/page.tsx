import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

type NavItem = {
  label: string;
  to: string;
  icon?: string;
  description?: string;
};

const ComingSoon = ({ title }: { title: string }) => {
  return (
    <div className="grid">
      <div className="col-12 md:col-8">
        <Card title={title}>
          <p className="m-0">
            UI scaffolding in progress. This view will reflect the GST screenshots (GSTR-1/3B, HSN summaries, E-Invoice, E-Way Bill).
          </p>
        </Card>
      </div>
      <div className="col-12 md:col-4">
        <Card title="Quick Links">
          <ul className="m-0 pl-3">
            <li><Link to="/accounts">Accounts Hub</Link></li>
            <li><Link to="/gst">GST Hub</Link></li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default function GSTHub() {
  const location = useLocation();
  const appName = (import.meta as any).env?.VITE_APP_NAME || 'VidhiOne';

  const subpath = useMemo(() => {
    const path = location.pathname.replace(/\/+$/, '');
    const m = path.match(/\/gst\/?(.*)$/i);
    return (m && m[1]) ? m[1] : '';
  }, [location.pathname]);

  const titleMap: Record<string, string> = {
    'gstr-1': 'GSTR-1',
    'gstr-3b': 'GSTR-3B',
    'e-invoice': 'E-Invoice',
    'e-way-bill': 'E-Way Bill',
    'hsn-summary/sale': 'HSN Summary (Sale)'
  };

  if (subpath) {
    const title = titleMap[subpath] || `GST - ${subpath}`;
    return <ComingSoon title={title} />;
  }

  const navItems: NavItem[] = [
    { label: 'GSTR-1', to: '/gst/gstr-1', icon: 'pi pi-table', description: 'Outward supplies return.' },
    { label: 'GSTR-3B', to: '/gst/gstr-3b', icon: 'pi pi-chart-bar', description: 'Monthly summary return.' },
    { label: 'E-Invoice', to: '/gst/e-invoice', icon: 'pi pi-send', description: 'Generate/acknowledge IRNs.' },
    { label: 'E-Way Bill', to: '/gst/e-way-bill', icon: 'pi pi-truck', description: 'Manage transport e-way bills.' },
    { label: 'HSN Summary (Sale)', to: '/gst/hsn-summary/sale', icon: 'pi pi-tags', description: 'HSN-wise sale summary.' }
  ];

  return (
    <div className="grid">
      <div className="col-12">
        <Card title={`${appName} • GST`}>
          <p className="m-0">Choose a GST feature to proceed. These entries map directly to the Agency screenshots (GST section).</p>
        </Card>
      </div>

      <div className="col-12 md:col-6">
        <Card title="Quick Actions">
          <div className="flex gap-2 flex-wrap">
            {navItems.map((n) => (
              <Link key={n.to} to={n.to}>
                <Button label={n.label} icon={n.icon} outlined />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="col-12 md:col-6">
        <Card title="At a Glance">
          <DataTable value={navItems} size="small" stripedRows emptyMessage="No items">
            <Column field="label" header="Feature" />
            <Column field="description" header="Description" />
            <Column
              header="Open"
              body={(row: NavItem) => (
                <Link to={row.to}>
                  <Button icon="pi pi-arrow-right" rounded text />
                </Link>
              )}
              style={{ width: '6rem', textAlign: 'center' }}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}