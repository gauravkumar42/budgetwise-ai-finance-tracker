import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';
import AISuggestions from '../components/AISuggestions';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      const data = response.data;
      setTransactions(data);

      const income   = data.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = data.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      setSummary({ income, expenses, balance: income - expenses });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Personal Finance Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.grid}>
          {[
            { label: 'Total Income',   value: fmt(summary.income),   color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Total Expenses', value: fmt(summary.expenses), color: '#dc2626', bg: '#fef2f2' },
            { label: 'Net Balance',    value: fmt(summary.balance),  color: summary.balance >= 0 ? '#2563eb' : '#dc2626', bg: '#eff6ff' },
          ].map((card) => (
            <div key={card.label} style={{ ...styles.summaryCard, backgroundColor: card.bg }}>
              <p style={styles.summaryLabel}>{card.label}</p>
              <p style={{ ...styles.summaryValue, color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Transaction Form */}
        <TransactionForm onTransactionAdded={fetchTransactions} />

        {/* Expense Analytics */}
        <ExpenseChart transactions={transactions} />

        {/* AI Budget Suggestions */}
        <AISuggestions />

        {/* Transaction List */}
        <div style={styles.listSection}>
          <h2 style={styles.listTitle}>
            Recent Transactions
            <span style={styles.badge}>{transactions.length}</span>
          </h2>
          {loading ? (
            <p style={styles.loading}>Loading transactions…</p>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '32px 16px',
  },
  container: {
    maxWidth: '760px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  logoutButton: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  summaryLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    margin: '0 0 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  listSection: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  listTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '13px',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '24px 0',
  },
};