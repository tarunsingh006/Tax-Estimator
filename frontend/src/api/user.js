import api from "./axios";

export const getProfile = async () => {
    const res = await api.get("/users/profile");
    return res.data;
};

export const updateProfile = async (data) => {
    const res = await api.put("/users/profile", data);
    return res.data;
};

export const updateNotifications = async (notification_preferences) => {
    const res = await api.put("/users/notifications", { notification_preferences });
    return res.data;
};

export const changePassword = async (data) => {
    const res = await api.put("/users/change-password", data);
    return res.data;
};

export const deleteAccount = async () => {
    const res = await api.delete("/users/delete-account");
    return res.data;
};
