import { useState } from 'react';
import api from '../api';

const initialForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: new Date().toISOString().split('T')[0],
};

export default function TransactionForm({ onTransactionAdded }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setForm(initialForm);
      onTransactionAdded?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add transaction. Please try again.');
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Add Transaction</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Grocery run"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Amount</label>
            <input
              style={styles.input}
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Type</label>
            <select
              style={styles.input}
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <input
              style={styles.input}
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Food, Salary"
              required
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Date</label>
          <input
            style={{ ...styles.input, maxWidth: '220px' }}
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          Add Transaction
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '28px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    width: '100%',
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: '4px',
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
};