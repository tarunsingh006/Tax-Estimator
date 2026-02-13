import axios from "axios";

const API_URL = "http://localhost:5000/api/budgets";

export const createBudget = async (budgetData) => {
    const response = await axios.post(API_URL, budgetData);
    return response.data;
};

export const getBudgets = async (userId) => {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
};

export const deleteBudget = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
