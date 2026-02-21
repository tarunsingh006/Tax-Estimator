const db = require("../config/db");

// Get all categories for a user
exports.getCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            "SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error("Get categories error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Add a new category
exports.addCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, color, type } = req.body;

        const [result] = await db.query(
            "INSERT INTO categories (user_id, name, color, type) VALUES (?, ?, ?, ?)",
            [userId, name, color || '#3b82f6', type || 'expense']
        );

        res.status(201).json({
            message: "Category added successfully",
            categoryId: result.insertId
        });
    } catch (err) {
        console.error("Add category error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, color, type } = req.body;

        const [result] = await db.query(
            "UPDATE categories SET name = ?, color = ?, type = ? WHERE id = ? AND user_id = ?",
            [name, color, type, id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category updated successfully" });
    } catch (err) {
        console.error("Update category error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM categories WHERE id = ? AND user_id = ?",
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Delete category error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
