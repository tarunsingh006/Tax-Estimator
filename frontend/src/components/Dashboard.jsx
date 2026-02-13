import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  MinusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { getTransactions } from '../api/transactions';

import '../index.css';
import RecordIncomeModal from './RecordIncomeModal';
import RecordExpenseModal from './RecordExpenseModal';

function Dashboard({ onLogout, userName = 'User', userEmail = 'user@email.com' }) {
  const navigate = useNavigate();
  const displayUserName = userName || 'User';

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const transactionsRef = useRef(null);
  const dashboardRef = useRef(null);

  const loadTransactions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const data = await getTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((txn) => {
      if (txn.type === 'income') income += Number(txn.amount);
      if (txn.type === 'expense') expense += Number(txn.amount);
    });

    setTotalIncome(income);
    setTotalExpense(expense);
  }, [transactions]);

  // Preparing data for Bar Chart (Last 6 Months)
  const getBarData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = months[d.getMonth()];
      const year = d.getFullYear();

      const income = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === year)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === year)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      last6Months.push({ name: monthLabel, income, expense });
    }
    return last6Months;
  };

  // Preparing data for Pie Chart (Category Breakdown)
  const getPieData = () => {
    const categoryMap = {};
    const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
      });

    return Object.keys(categoryMap).map((cat, index) => ({
      name: cat,
      value: categoryMap[cat],
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  };

  const barData = getBarData();
  const pieData = getPieData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '13px', fontWeight: '600' }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-root">
      {/* ===== MAIN CONTENT ONLY ===== */}
      <main className="dashboard-main" ref={dashboardRef}>
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div>
            <h2 style={{ marginBottom: '4px' }}>Financial Dashboard</h2>
            <p style={{ opacity: 0.7, fontSize: '14px' }}>
              Welcome back, {displayUserName}! Here's your financial summary.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="action-btn record-income"
              onClick={() => setShowIncomeModal(true)}
            >
              <PlusCircle size={18} />
              Record Income
            </button>

            <button
              className="action-btn record-expense"
              onClick={() => setShowExpenseModal(true)}
            >
              <MinusCircle size={18} />
              Record Expense
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          {[
            {
              label: 'Monthly Income',
              value: `₹${totalIncome.toLocaleString()} `,
              icon: <TrendingUp size={24} />,
              bg: 'rgba(52, 211, 153, 0.15)', // emerald-400 with opacity
              color: '#34d399',
              trend: 'up'
            },
            {
              label: 'Monthly Expenses',
              value: `₹${totalExpense.toLocaleString()} `,
              icon: <TrendingDown size={24} />,
              bg: 'rgba(248, 113, 113, 0.15)', // red-400 with opacity
              color: '#f87171',
              trend: 'down'
            },
            {
              label: 'Estimated Tax Due',
              value: '₹0.00',
              icon: <Wallet size={24} />,
              bg: 'rgba(251, 191, 36, 0.15)', // amber-400 with opacity
              color: '#fbbf24',
              trend: 'neutral'
            },
            {
              label: 'Savings Rate',
              value: '0%',
              icon: <Target size={24} />,
              bg: 'rgba(96, 165, 250, 0.15)', // blue-400 with opacity
              color: '#60a5fa',
              trend: 'up'
            },
          ].map((item, i) => (
            <div
              className="stat-card"
              key={i}
              style={{ position: 'relative', cursor: item.label === 'Estimated Tax Due' ? 'pointer' : 'default' }}
              onClick={() => {
                if (item.label === 'Estimated Tax Due') navigate('/tax-estimator');
              }}
            >
              <span className="stat-card-icon"
                style={{
                  backgroundColor: item.bg,
                  color: item.color,
                }}
              >
                {item.icon}
              </span>

              <p>{item.label}</p>
              <h3>{item.value}</h3>
              <span className="trend-indicator">
                {item.trend === 'up' ? <ArrowUpCircle size={12} /> : item.trend === 'down' ? <ArrowDownCircle size={12} /> : null}
                0% from last month
              </span>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="chart-grid">
          <div className="chart-large">
            <div className="chart-header">
              <div className="chart-title-group">
                <BarChart2 size={18} className="chart-title-icon" />
                <h4>Income vs Expenses</h4>
              </div>
              <div className="chart-tabs">
                <span className="chart-tab active">Year</span>
                <span className="chart-tab">Quarter</span>
                <span className="chart-tab">Month</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 260, marginTop: '20px' }}>
              <ResponsiveContainer>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    hide
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-custom-legend">
              <div className="legend-item"><span className="dot income"></span> Income</div>
              <div className="legend-item"><span className="dot expense"></span> Expenses</div>
            </div>
          </div>

          <div className="chart-small">
            <div className="chart-header">
              <div className="chart-title-group">
                <PieChartIcon size={18} className="chart-title-icon" />
                <h4>Expense Breakdown</h4>
              </div>
            </div>
            <div style={{ width: '100%', height: 200, marginTop: '10px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend-container">
              {pieData.slice(0, 5).map((entry, index) => (
                <div key={index} className="pie-legend-item">
                  <div className="legend-left">
                    <span className="legend-dot" style={{ backgroundColor: entry.color }}></span>
                    <span className="legend-name">{entry.name}</span>
                  </div>
                  <span className="legend-value">
                    {Math.round((entry.value / totalExpense) * 100) || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div ref={transactionsRef} className="transactions-card">
          <div className="txn-header">
            <h4>Recent Transactions</h4>
            <span className="muted">View All</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="muted"
                    style={{ textAlign: 'center' }}
                  >
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{new Date(txn.date).toLocaleDateString()}</td>
                    <td>{txn.category}</td>
                    <td>₹{Number(txn.amount).toLocaleString()}</td>
                    <td className="txn-type-cell">
                      <span className={`txn-type-badge ${txn.type.toLowerCase()}`}>
                        {txn.type.toLowerCase() === 'income' ? (
                          <ArrowUpCircle size={14} style={{ marginRight: '4px' }} />
                        ) : (
                          <ArrowDownCircle size={14} style={{ marginRight: '4px' }} />
                        )}
                        {txn.type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODALS */}
      {showIncomeModal && (
        <RecordIncomeModal
          onClose={() => setShowIncomeModal(false)}
          onSuccess={loadTransactions}
        />
      )}

      {showExpenseModal && (
        <RecordExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={loadTransactions}
        />
      )}
    </div>
  );
}

export default Dashboard;
