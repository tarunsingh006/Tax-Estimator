import { useState, useEffect } from "react";
import { addTransaction } from "../api/transactions";
import { getCategories } from "../api/categories";
import { showToast } from './Toast';

function RecordIncomeModal({ onClose, onSuccess }) {

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.filter(c => c.type === 'income'));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!description || !amount || !category || !date) {
        showToast("Required", "Please fill all required fields", "info");
        return;
      }

      setLoading(true);

      const payload = {
        user_id: userId,
        type: "income",
        category,
        amount,
        date,
        description
      };

      await addTransaction(payload);
      showToast("Success", "Income added successfully ✅", "success");
      onSuccess && onSuccess();
      onClose();

    } catch (error) {
      console.error("Save income error:", error);
      showToast("Error", "Failed to save income ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Record New Income</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="modal-sub">
          Add details about your income to track your finances better.
        </p>

        <label>Description</label>
        <input
          className="modal-input"
          placeholder="e.g. Web Design Project"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Amount</label>
        <input
          type="number"
          className="modal-input"
          placeholder="₹ 0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="modal-row">
          <div>
            <label>Category</label>
            <select
              className="modal-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Date</label>
            <input
              type="date"
              className="modal-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordIncomeModal;
