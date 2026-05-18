import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ExpenseChart({ transactions }) {
  const expenses = transactions?.filter((t) => t.type === 'expense') || [];

  const grouped = expenses.reduce((acc, t) => {
    const cat = t.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  // Currency formatter for Indian Rupees
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  if (labels.length === 0) {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Expenses by Category</h2>
        <p style={styles.empty}>No expense data to display.</p>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Expenses (₹)',
        data: values,
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(20, 184, 166, 0.7)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(20, 184, 166, 1)',
        ],
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#6b7280',
          font: { size: 13 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: {
          color: '#6b7280',
          font: { size: 13 },
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Expenses by Category</h2>
      <div style={styles.chartWrap}>
        <Bar data={data} options={options} />
      </div>
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
  title: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 20px',
  },
  chartWrap: {
    height: '280px',
    position: 'relative',
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '32px 0',
    margin: 0,
  },
};