const BASE = "/api";

function getToken() {
  return localStorage.getItem("findit_token");
}

async function req(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  signup: (data) => req("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  signin: (data) => req("/auth/signin", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => req("/auth/me"),
  getItems: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return req(`/items?${qs}`);
  },
  getMyItems: () => req("/items/my"),
  getRecentItems: () => req("/items/recent"),
  getReturnedItem: () => req("/items/returned"),
  getStats: () => req("/items/stats"),
  getCategories: () => req("/items/categories"),
  getItem: (id) => req(`/items/${id}`),
  reportItem: (data) => req("/items", { method: "POST", body: JSON.stringify(data) }),
  claimItem: (id) => req(`/items/${id}/claim`, { method: "PATCH" }),
  contactOwner: (id, data) => req(`/items/${id}/contact`, { method: "POST", body: JSON.stringify(data) }),
  deleteItem: (id) => req(`/items/${id}`, { method: "DELETE" }),
  adminStats: () => req("/admin/stats"),
  adminUsers: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return req(`/admin/users?${qs}`);
  },
  adminItems: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return req(`/admin/items?${qs}`);
  },
  adminDeleteItem: (id) => req(`/admin/items/${id}`, { method: "DELETE" }),
  adminDeleteUser: (id) => req(`/admin/users/${id}`, { method: "DELETE" }),
  adminToggleUser: (id) => req(`/admin/users/${id}/toggle`, { method: "PATCH" }),
  adminChangeRole: (id, role) => req(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
};

// Messages (admin)
export const messageApi = {
  getMessages: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")));
    return req(`/admin/messages?${qs}`);
  },
  markRead: (id) => req(`/admin/messages/${id}/read`, { method: "PATCH" }),
  markAllRead: () => req("/admin/messages/read-all", { method: "PATCH" }),
  deleteMessage: (id) => req(`/admin/messages/${id}`, { method: "DELETE" }),
};
