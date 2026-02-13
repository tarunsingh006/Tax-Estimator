import '../index.css';
import { useState } from "react";
import { addTransaction } from "../api/transactions";
import { showToast } from './Toast';

function RecordExpenseModal({ onClose, onSuccess }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!description || !amount || !category || !date) {
      showToast("Required", "Please fill all required fields", "info");
      return;
    }

    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");

      await addTransaction({
        user_id: userId,
        type: "expense",
        category,
        amount,
        date
      });

      showToast("Success", "Expense saved successfully ✅", "success");

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Expense Error:", error.response?.data || error.message);
      showToast("Error", error.response?.data?.message || "Failed to save expense", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Record New Expense</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="modal-sub">
          Add details about your expense to track your spending better.
        </p>

        <label>Description</label>
        <input
          className="modal-input"
          placeholder="e.g. Grocery Shopping"
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
            <input
              className="modal-input"
              list="expense-categories"
              placeholder="Enter or select category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="expense-categories">
              <option value="Food" />
              <option value="Transport" />
              <option value="Utilities" />
              <option value="Shopping" />
              <option value="Health" />
              <option value="Other" />
            </datalist>
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
            className="danger"
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

export default RecordExpenseModal;
