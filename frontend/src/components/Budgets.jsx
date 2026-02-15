import { useState, useEffect, useCallback } from 'react';
import '../index.css';
import { getBudgets, createBudget, deleteBudget } from '../api/budgets';
import { showToast } from './Toast';

function Budgets() {
  const [showForm, setShowForm] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    category: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7), // Default to current month
    description: '',
  });

  const userId = localStorage.getItem('userId');

  const fetchBudgets = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getBudgets(userId);
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showToast('Error', 'Failed to load budgets', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.month) {
      showToast('Required', 'Please fill all required fields', 'info');
      return;
    }

    try {
      await createBudget({
        user_id: userId,
        ...form
      });
      showToast('Created', 'Budget created successfully ✅', 'success');
      setForm({
        category: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7),
        description: ''
      });
      setShowForm(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      showToast('Error', 'Failed to create budget', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await deleteBudget(id);
      showToast('Deleted', 'Budget removed successfully', 'success');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      showToast('Error', 'Failed to delete budget', 'error');
    }
  };

  const getHealthStatus = (spent, amount) => {
    const ratio = spent / amount;
    if (ratio > 1) return { label: 'Over Budget', color: '#f87171', class: 'expense' };
    if (ratio > 0.8) return { label: 'Warning', color: '#fbbf24', class: 'warning' };
    return { label: 'Good', color: '#4ade80', class: 'income' };
  };

  const getOverallHealth = () => {
    if (budgets.length === 0) return { label: 'N/A', color: '#9ca3af' };
    const hasOverBudget = budgets.some(b => b.spent > b.amount);
    if (hasOverBudget) return { label: 'At Risk', color: '#f87171' };
    const hasWarning = budgets.some(b => b.spent > 0.8 * b.amount);
    if (hasWarning) return { label: 'Caution', color: '#fbbf24' };
    return { label: 'Good', color: '#4ade80' };
  };

  const overallHealth = getOverallHealth();

  return (
    <main className="dashboard-main">
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'nowrap',
        }}
      >
        <h2>Budgets</h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Budget Health */}
          <div className="budget-health-glass">
            <span>Overall Health:</span>
            <strong style={{ color: overallHealth.color }}>{overallHealth.label}</strong>
          </div>

          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + Create New Budget
          </button>
        </div>
      </div>

      {/* ===== CREATE FORM ===== */}
      {showForm && (
        <div className="transactions-card" style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px' }}>Create New Budget</h4>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <label>Category</label>
                <input
                  list="categories"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Type or select category"
                  className="modal-input"
                  required
                />
                <datalist id="categories">
                  <option value="Food" />
                  <option value="Transport" />
                  <option value="Utilities" />
                  <option value="Shopping" />
                  <option value="Health" />
                  <option value="Other" />
                </datalist>
              </div>

              <div>
                <label>Budget Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="₹ 0.00"
                  className="modal-input"
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label>Month</label>
              <input
                type="month"
                name="month"
                value={form.month}
                onChange={handleChange}
                className="modal-input"
                required
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <label>Description (Optional)</label>
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional notes"
                className="modal-input"
                style={{ resize: 'none' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="primary-btn"
                style={{
                  background: '#7f1d1d',
                  color: '#fff',
                  width: 'auto',
                  padding: '8px 16px',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                style={{
                  width: 'auto',
                  padding: '8px 16px',
                }}
              >
                Create Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="transactions-card">
        <h4 style={{ marginBottom: '16px' }}>Budgets Overview</h4>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Category</th>
              <th style={{ textAlign: 'left' }}>Month</th>
              <th style={{ textAlign: 'left' }}>Budget</th>
              <th style={{ textAlign: 'left' }}>Spent</th>
              <th style={{ textAlign: 'left' }}>Remaining</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="muted" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading budgets...
                </td>
              </tr>
            ) : budgets.length === 0 ? (
              <tr>
                <td colSpan="7" className="muted" style={{ textAlign: 'center', padding: '20px' }}>
                  No budgets created yet
                </td>
              </tr>
            ) : (
              budgets.map((b) => {
                const health = getHealthStatus(b.spent, b.amount);
                return (
                  <tr key={b.id}>
                    <td>{b.category}</td>
                    <td>{b.month}</td>
                    <td>₹{Number(b.amount).toLocaleString()}</td>
                    <td style={{ color: Number(b.spent) > Number(b.amount) ? '#f87171' : 'inherit' }}>
                      ₹{Number(b.spent).toLocaleString()}
                    </td>
                    <td>₹{Math.max(0, b.amount - b.spent).toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`txn-type-badge ${health.class}`}>
                        {health.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="txn-delete-btn"
                        onClick={() => handleDelete(b.id)}
                        title="Delete Budget"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Budgets;
