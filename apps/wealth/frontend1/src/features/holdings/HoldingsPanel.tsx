import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Button } from 'primereact/button';

const HOLDINGS_QUERY = gql`
  query HoldingsPage($limit: Int, $offset: Int) {
    holdingsPage(limit: $limit, offset: $offset) {
      items {
        securityId
        symbol
        isin
        name
        qty
        avgCost
        buyValue
        cmp
        currentValue
        totalPnl
        changePct
      }
      meta {
        total
        limit
        offset
        hasMore
        nextOffset
      }
    }
  }
`;

export function HoldingsPanel() {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data, loading, error, refetch } = useQuery(HOLDINGS_QUERY, {
    variables: { limit, offset }
  });

  if (loading) return <div>Loading holdings…</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const rows = data?.holdingsPage?.items ?? [];
  const meta = data?.holdingsPage?.meta;
  const canPrev = meta ? meta.offset > 0 : false;
  const canNext = meta ? meta.hasMore : false;

  return (
    <div>
      <header className="panel-header">
        <h2>Holdings</h2>
        <div className="panel-actions">
          <Button label="Refresh" onClick={() => refetch()} size="small" />
          {meta && (
            <>
              <Button
                label="Prev"
                size="small"
                disabled={!canPrev}
                onClick={() => setOffset(Math.max(0, meta.offset - meta.limit))}
                outlined
              />
              <Button
                label="Next"
                size="small"
                disabled={!canNext}
                onClick={() => setOffset(meta.nextOffset ?? meta.offset)}
                outlined
              />
            </>
          )}
        </div>
      </header>
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>ISIN</th>
            <th>Qty</th>
            <th>Avg Cost</th>
            <th>Buy Value</th>
            <th>CMP</th>
            <th>Current Value</th>
            <th>P&amp;L</th>
            <th>Change %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.securityId}>
              <td>{r.symbol || r.name || r.isin}</td>
              <td>{r.isin}</td>
              <td>{r.qty}</td>
              <td>{r.avgCost}</td>
              <td>{r.buyValue}</td>
              <td>{r.cmp ?? '-'}</td>
              <td>{r.currentValue ?? '-'}</td>
              <td>{r.totalPnl ?? '-'}</td>
              <td>{r.changePct ? `${r.changePct}%` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
