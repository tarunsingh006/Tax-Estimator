import api from "./axios";

export const saveReport = async (reportData) => {
    const response = await api.post("/reports", reportData);
    return response.data;
};

export const getReportHistory = async (userId) => {
    const response = await api.get(`/reports/${userId}`);
    return response.data;
};

export const deleteReportHistory = async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
};
