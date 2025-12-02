import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Button } from 'primereact/button';

const REALIZED_QUERY = gql`
  query RealizedPnlPage($limit: Int, $offset: Int) {
    realizedPnlPage(limit: $limit, offset: $offset) {
      items {
        tdate
        symbol
        isin
        qty
        sellPrice
        sellValue
        costBasis
        fees
        realized
      }
      meta {
        total
        limit
        offset
        hasMore
        nextOffset
      }
    }
    realizedPnlSummary {
      symbol
      realized
      qtySold
    }
  }
`;

export function RealizedPanel() {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data, loading, error, refetch } = useQuery(REALIZED_QUERY, {
    variables: { limit, offset }
  });

  if (loading) return <div>Loading realized P&amp;L…</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const rows = data?.realizedPnlPage?.items ?? [];
  const meta = data?.realizedPnlPage?.meta;
  const canPrev = meta ? meta.offset > 0 : false;
  const canNext = meta ? meta.hasMore : false;

  return (
    <div>
      <header className="panel-header">
        <h2>Realized P&amp;L</h2>
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
            <th>Date</th>
            <th>Symbol</th>
            <th>ISIN</th>
            <th>Qty</th>
            <th>Sell Price</th>
            <th>Sell Value</th>
            <th>Cost Basis</th>
            <th>Fees</th>
            <th>Realized</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any, idx: number) => (
            <tr key={idx}>
              <td>{r.tdate}</td>
              <td>{r.symbol}</td>
              <td>{r.isin}</td>
              <td>{r.qty}</td>
              <td>{r.sellPrice}</td>
              <td>{r.sellValue}</td>
              <td>{r.costBasis}</td>
              <td>{r.fees}</td>
              <td>{r.realized}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
