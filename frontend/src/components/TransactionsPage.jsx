import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getTransactions, deleteTransaction } from '../api/transactions';
import EditTransactionModal from './EditTransactionModal';
import { showToast } from './Toast';

import '../index.css';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [editingTxn, setEditingTxn] = useState(null);

  const loadTransactions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const data = await getTransactions(userId);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions', err);
      showToast('Error', 'Failed to load transactions', 'error');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleDelete = async (id) => {
    // confirmation alert remains as standard or could be custom modal, 
    // but user asked for "attractive alerts" which usually refers to notifications.
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await deleteTransaction(id);
      showToast('Deleted', 'Transaction removed successfully', 'success');
      loadTransactions();
    } catch (err) {
      console.error('Delete failed', err);
      showToast('Error', 'Failed to delete transaction', 'error');
    }
  };

  const handleEdit = (txn) => {
    setEditingTxn(txn);
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
              <th style={{ textAlign: 'right' }}>Actions</th>
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
                  <td>{txn.category || 'Other'}</td>
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
                      <button
                        className="txn-edit-btn"
                        title="Edit"
                        onClick={() => handleEdit(txn)}
                      >
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

      {editingTxn && (
        <EditTransactionModal
          txn={editingTxn}
          onClose={() => setEditingTxn(null)}
          onSuccess={loadTransactions}
        />
      )}
    </main>
  );
}

export default TransactionsPage;
