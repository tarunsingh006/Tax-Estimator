import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getTransactions, deleteTransaction } from '../api/transactions';

import '../index.css';

function TransactionsPage({
  onLogout, // still passed but handled by layout
  userName = 'User',
  userEmail = 'user@email.com',
}) {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);

  const loadTransactions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const data = await getTransactions(userId);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await deleteTransaction(id);
      loadTransactions();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <main className="dashboard-main">
      <h2 style={{ marginBottom: '20px' }}>All Transactions</h2>

      <div className="transactions-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="muted" style={{ textAlign: 'center' }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.date).toLocaleDateString()}</td>
                  <td>{txn.category}</td>
                  <td>₹{Number(txn.amount).toLocaleString()}</td>
                  <td>
                    <span className={`txn-type-badge ${txn.type.toLowerCase()}`}>
                      {txn.type.toLowerCase() === 'income' ? (
                        <ArrowUpCircle size={14} style={{ marginRight: '4px' }} />
                      ) : (
                        <ArrowDownCircle size={14} style={{ marginRight: '4px' }} />
                      )}
                      {txn.type}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div className="txn-actions">
                      <button className="txn-edit-btn" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="txn-delete-btn"
                        onClick={() => handleDelete(txn.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default TransactionsPage;
