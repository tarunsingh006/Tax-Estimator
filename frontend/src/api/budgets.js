import api from "./axios";

export const createBudget = async (budgetData) => {
    const response = await api.post("/budgets", budgetData);
    return response.data;
};

export const getBudgets = async (userId) => {
    const response = await api.get(`/budgets/${userId}`);
    return response.data;
};

export const deleteBudget = async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
};
