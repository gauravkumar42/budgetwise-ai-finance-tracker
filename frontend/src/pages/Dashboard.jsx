import { useState, useEffect } from 'react';
import api from '../api';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';
import AISuggestions from '../components/AISuggestions';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(true);
  const [error, setError] = useState('');

  // START DEMO SESSION
  const startDemoSession = async () => {
    try {
      setDemoLoading(true);
      setError('');

      const response = await api.post('/auth/demo');

      const { token } = response.data;

      if (!token) {
        throw new Error('Demo authentication failed');
      }

      // Save JWT
      localStorage.setItem('token', token);

      return true;
    } catch (err) {
      console.error('Demo authentication failed:', err);

      setError(
        err.response?.data?.message ||
        'Unable to start demo mode. Please try again.'
      );

      return false;
    } finally {
      setDemoLoading(false);
    }
  };


  // FETCH TRANSACTIONS
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/transactions');
      const data = response.data;

      setTransactions(data);

      const income = data
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = data
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setSummary({
        income,
        expenses,
        balance: income - expenses,
      });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);

      setError(
        err.response?.data?.message ||
        'Unable to load transactions.'
      );
    } finally {
      setLoading(false);
    }
  };


  // AUTHENTICATE FIRST, THEN LOAD DASHBOARD
  useEffect(() => {
    const initializeDashboard = async () => {
      const authenticated = await startDemoSession();

      if (authenticated) {
        await fetchTransactions();
      } else {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);


  // FORMAT CURRENCY
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);


  // DEMO LOADING SCREEN
  if (demoLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>

          <h2 style={styles.loadingTitle}>
            Starting BudgetWise...
          </h2>

          <p style={styles.loadingText}>
            Preparing your demo experience
          </p>
        </div>
      </div>
    );
  }


  // ERROR SCREEN
  if (error && !localStorage.getItem('token')) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>
            Unable to start demo
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/*
          HEADER
        */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              BudgetWise
            </h1>

            <p style={styles.subtitle}>
              AI Personal Finance Tracker
            </p>
          </div>

        </div>

        {/*
          ERROR MESSAGE
        */}
        {error && (
          <div style={styles.errorBanner}>
            {error}
          </div>
        )}

        {/*
          SUMMARY CARDS
        */}
        <div style={styles.grid}>
          {[
            {
              label: 'Total Income',
              value: fmt(summary.income),
              color: '#16a34a',
              bg: '#f0fdf4',
            },
            {
              label: 'Total Expenses',
              value: fmt(summary.expenses),
              color: '#dc2626',
              bg: '#fef2f2',
            },
            {
              label: 'Net Balance',
              value: fmt(summary.balance),
              color:
                summary.balance >= 0
                  ? '#2563eb'
                  : '#dc2626',
              bg: '#eff6ff',
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                ...styles.summaryCard,
                backgroundColor: card.bg,
              }}
            >
              <p style={styles.summaryLabel}>
                {card.label}
              </p>

              <p
                style={{
                  ...styles.summaryValue,
                  color: card.color,
                }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/*
            TRANSACTION FORM
        */}
        <TransactionForm
          onTransactionAdded={fetchTransactions}
        />

        {/*
            EXPENSE ANALYTICS
        */}
        <ExpenseChart
          transactions={transactions}
        />

        {/*
            AI BUDGET SUGGESTIONS
        */}
        <AISuggestions />

        {/*
            TRANSACTION LIST
        */}
        <div style={styles.listSection}>
          <h2 style={styles.listTitle}>
            Recent Transactions

            <span style={styles.badge}>
              {transactions.length}
            </span>
          </h2>

          {loading ? (
            <p style={styles.loading}>
              Loading transactions…
            </p>
          ) : transactions.length === 0 ? (
            <p style={styles.empty}>
              No transactions yet. Add your first
              income or expense above.
            </p>
          ) : (
            <TransactionList
              transactions={transactions}
            />
          )}
        </div>


      </div>
    </div>
  );
}

// STYLES
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
    gap: '16px',
  },

  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },

  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0',
  },

  demoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 14px',
    borderRadius: '999px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },

  demoDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
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

  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '24px 0',
  },

  loadingPage: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },

  loadingCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
    minWidth: '280px',
  },

  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },

  loadingTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
  },

  loadingText: {
    margin: '8px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },

  errorCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
    maxWidth: '400px',
  },

  errorTitle: {
    margin: '0 0 10px',
    color: '#dc2626',
    fontSize: '20px',
  },

  errorText: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '20px',
  },

  retryButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
  },

  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },

};