import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Button } from 'primereact/button';

const TX_QUERY = gql`
  query TransactionsPage($limit: Int, $offset: Int) {
    transactionsPage(limit: $limit, offset: $offset) {
      items {
        id
        tdate
        ttype
        symbol
        isin
        qty
        price
        fees
        notes
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

export function TransactionsPanel() {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data, loading, error, refetch } = useQuery(TX_QUERY, {
    variables: { limit, offset }
  });

  if (loading) return <div>Loading transactions…</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const rows = data?.transactionsPage?.items ?? [];
  const meta = data?.transactionsPage?.meta;
  const canPrev = meta ? meta.offset > 0 : false;
  const canNext = meta ? meta.hasMore : false;

  return (
    <div>
      <header className="panel-header">
        <h2>Transactions</h2>
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
            <th>Type</th>
            <th>Symbol</th>
            <th>ISIN</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Fees</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id}>
              <td>{r.tdate}</td>
              <td>{r.ttype}</td>
              <td>{r.symbol}</td>
              <td>{r.isin}</td>
              <td>{r.qty}</td>
              <td>{r.price}</td>
              <td>{r.fees}</td>
              <td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
