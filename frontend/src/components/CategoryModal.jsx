import { useState, useEffect } from 'react';
import '../index.css';

function CategoryModal({ category, onClose, onSave }) {
    const [name, setName] = useState(category ? category.name : '');
    const [color, setColor] = useState(category ? category.color : '#3b82f6');
    const [type, setType] = useState(category ? category.type : 'expense');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, color, type });
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>{category ? 'Edit Category' : 'Add New Category'}</h3>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
                        <div>
                            <label>Category Name</label>
                            <input
                                type="text"
                                className="modal-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Type</label>
                            <select
                                className="modal-input"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label>Color</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    className="modal-input"
                                    style={{ width: '60px', padding: '2px', height: '40px' }}
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                />
                                <span style={{ fontSize: '13px', opacity: 0.7 }}>{color}</span>
                            </div>
                        </div>
                    </div>
                    <div className="modal-actions" style={{ marginTop: '24px' }}>
                        <button type="button" className="ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="primary-btn">Save Category</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CategoryModal;
