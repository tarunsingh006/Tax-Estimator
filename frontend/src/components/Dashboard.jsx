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
  Target
} from 'lucide-react';

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
            <h4>Income vs Expenses</h4>
            <div className="chart-placeholder">Bar chart</div>
          </div>

          <div className="chart-small">
            <h4>Expense Breakdown</h4>
            <div className="chart-placeholder">Pie chart</div>
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
