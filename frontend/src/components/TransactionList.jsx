export default function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>No transactions yet.</p>
      </div>
    );
  }

 const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatAmount = (amount, type) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return `${type === 'income' ? '+' : '-'}${formatted}`;
};

  return (
    <div style={styles.list}>
      {transactions.map((tx) => (
        <div key={tx._id} style={styles.row}>
          <div style={styles.left}>
            <p style={styles.txTitle}>{tx.title}</p>
            <p style={styles.txMeta}>
              {tx.category}
              <span style={styles.dot}>•</span>
              {formatDate(tx.date)}
            </p>
          </div>
          <span
            style={{
              ...styles.amount,
              color: tx.type === 'income' ? '#16a34a' : '#dc2626',
              backgroundColor: tx.type === 'income' ? '#f0fdf4' : '#fef2f2',
            }}
          >
            {formatAmount(tx.amount, tx.type)}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderRadius: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  txTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  txMeta: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: {
    fontSize: '10px',
    color: '#d1d5db',
  },
  amount: {
    fontSize: '15px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  empty: {
    backgroundColor: '#ffffff',
    padding: '36px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '15px',
    margin: 0,
  },
};