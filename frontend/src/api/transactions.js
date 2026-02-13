import api from "./axios";

// Fetch transactions by userId
export const getTransactions = async (userId) => {
  const res = await api.get(`/transactions/${userId}`);
  return res.data;
};

// Add new transaction
export const addTransaction = async (data) => {
  const res = await api.post("/transactions", data);
  return res.data;
};

// ✅ DELETE transaction
export const deleteTransaction = async (transactionId) => {
  const res = await api.delete(`/transactions/${transactionId}`);
  return res.data;
};

// ✅ UPDATE transaction
export const updateTransaction = async (id, data) => {
  const res = await api.put(`/transactions/${id}`, data);
  return res.data;
};
// ✅ GET summary for reports
export const getTransactionSummary = async (userId) => {
  const res = await api.get(`/transactions/summary/${userId}`);
  return res.data;
};
