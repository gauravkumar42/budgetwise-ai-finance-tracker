import { useState } from 'react';
import api from '../api';

export default function AISuggestions() {
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai/suggestions');
      setSuggestions(response.data.suggestions);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to get AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>AI Budget Advisor</h2>
          <p style={styles.subtitle}>
            Get personalised suggestions based on your spending patterns.
          </p>
        </div>
        <button
          onClick={handleGetSuggestions}
          disabled={loading}
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Analysing…' : 'Get AI Suggestions'}
        </button>
      </div>

      {loading && (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>
            Analysing your transactions and generating suggestions…
          </p>
        </div>
      )}

      {!loading && suggestions && (
        <div style={styles.suggestionsBox}>
          <p style={styles.suggestionsText}>{suggestions}</p>
        </div>
      )}

      {!loading && !suggestions && (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>
            Click the button above to receive AI-powered budgeting advice
            tailored to your recent transactions.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid #bfdbfe',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    flexShrink: 0,
    animation: 'spin 0.75s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#3b82f6',
    margin: 0,
  },
  suggestionsBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
  },
  suggestionsText: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.75',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  emptyBox: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
    lineHeight: '1.6',
  },
};