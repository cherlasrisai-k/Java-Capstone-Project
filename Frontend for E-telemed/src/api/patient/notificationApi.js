import axiosClient from "../axiosClient";
import { BASE_URLS } from "../axiosClient";

const API = BASE_URLS.NOTIFICATION;

export default {
  send(data) {
    return axiosClient.post(`${API}/api/v1/notifications`, data);
  },

  markRead(id) {
    return axiosClient.put(`${API}/api/v1/notifications/${id}/mark-read`);
  },

  unreadCount(userId) {
    return axiosClient.get(`${API}/api/v1/notifications/user/${userId}/unread-count`);
  },

  list(userId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/notifications/user/${userId}`, {
      params: pageable,
    });
  },
};
