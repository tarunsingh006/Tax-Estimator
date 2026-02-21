import { useState, useEffect } from "react";
import { showToast } from "./Toast";
import { getCategories } from "../api/categories";
import "../index.css";

function EditTransactionModal({ txn, onClose, onSuccess }) {
    const [form, setForm] = useState({
        type: "",
        category: "",
        amount: "",
        date: "",
    });

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (txn) {
            setForm({
                type: txn.type,
                category: txn.category,
                amount: txn.amount,
                date: new Date(txn.date).toISOString().split("T")[0],
            });
        }
    }, [txn]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.type || !form.amount || !form.date) {
            showToast("Required", "Please fill all required fields", "info");
            return;
        }

        try {
            setLoading(true);
            const { updateTransaction } = await import("../api/transactions");
            await updateTransaction(txn.id, form);
            showToast("Updated", "Transaction updated successfully ✅", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Update Error:", error.response?.data || error.message);
            const msg = error.response?.data?.error || error.response?.data?.message || "Failed to update transaction";
            showToast("Error", msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Edit Transaction</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                <p className="modal-sub">Update transaction details.</p>

                <form onSubmit={handleSave}>
                    <label>Type</label>
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                    >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    <label>Category</label>
                    <input
                        name="category"
                        list="edit-categories"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="Category"
                    />
                    <datalist id="edit-categories">
                        {categories
                            .filter(cat => cat.type === form.type)
                            .map(cat => (
                                <option key={cat.id} value={cat.name} />
                            ))}
                        {categories.length === 0 && (
                            <>
                                <option value="Food" />
                                <option value="Transport" />
                                <option value="Utilities" />
                                <option value="Shopping" />
                                <option value="Health" />
                                <option value="Salary" />
                                <option value="Investment" />
                                <option value="Other" />
                            </>
                        )}
                    </datalist>

                    <div className="modal-row">
                        <div>
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                className="modal-input"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="₹ 0.00"
                                required
                            />
                        </div>

                        <div>
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                className="modal-input"
                                value={form.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="primary"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTransactionModal;
