import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

export const saveReport = async (reportData) => {
    const response = await axios.post(`${API_URL}`, reportData);
    return response.data;
};

export const getReportHistory = async (userId) => {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
};

export const deleteReportHistory = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
