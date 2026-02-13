import api from "./axios";

export const saveTaxEstimate = async (estimateData) => {
    const res = await api.post("/taxes/estimate", estimateData);
    return res.data;
};

export const getTaxEstimates = async (userId) => {
    const res = await api.get(`/taxes/estimates/${userId}`);
    return res.data;
};

export const getTaxCalendarEvents = async (userId, year) => {
    const res = await api.get(`/taxes/calendar/${userId}`, {
        params: { year }
    });
    return res.data;
};
