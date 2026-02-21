import api from "./axios";

export const forgotPassword = async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
};

export const verifyOtp = async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    return res.data;
};

export const resetPassword = async (email, resetSessionToken, newPassword) => {
    const res = await api.post("/auth/reset-password", { email, resetSessionToken, newPassword });
    return res.data;
};
