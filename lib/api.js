export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export class ApiError extends Error {
  status;

  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const { token, headers, ...rest } = options;
  let response;
  try {
    const hasBody = rest.body !== undefined && !(rest.body instanceof FormData);
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  }
  catch {
    throw new ApiError("Could not reach the PromptArc server. Check the API URL and network connection.");
  }
  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    }
    catch {
      payload = { message: "Unexpected server response" };
    }
  }
  if (!response.ok)
    throw new ApiError(payload.message || "Request failed", response.status);
  return payload;
}

function withQuery(path, query = "") {
  return `${path}${query ? `?${query}` : ""}`;
}

function segment(value) {
  return encodeURIComponent(String(value));
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  googleLogin: (credential) => request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  me: (token) => request("/auth/me", { token }),
  updateProfile: (body, token) => request("/auth/me", { method: "PATCH", token, body: JSON.stringify(body) }),

  prompts: (query = "") => request(withQuery("/prompts", query)),
  featured: () => request("/prompts/featured"),
  marketplaceStats: () => request("/prompts/marketplace-stats"),
  topCreators: () => request("/prompts/top-creators"),
  recentReviews: () => request("/prompts/recent-reviews"),
  creatorProfile: (id) => request(`/prompts/creators/${segment(id)}`),
  prompt: (id, token) => request(`/prompts/${segment(id)}`, { token }),
  copyPrompt: (id, token) => request(`/prompts/${segment(id)}/copy`, { method: "POST", token }),
  bookmarkPrompt: (id, token) => request(`/prompts/${segment(id)}/bookmark`, { method: "POST", token }),
  removeBookmark: (id, token) => request(`/prompts/${segment(id)}/bookmark`, { method: "DELETE", token }),
  reviewPrompt: (id, body, token) => request(`/prompts/${segment(id)}/reviews`, { method: "POST", token, body: JSON.stringify(body) }),
  deleteReview: (id, token) => request(`/prompts/${segment(id)}/reviews/me`, { method: "DELETE", token }),
  reportPrompt: (id, body, token) => request(`/prompts/${segment(id)}/reports`, { method: "POST", token, body: JSON.stringify(body) }),
  createPrompt: (body, token) => request("/prompts", { method: "POST", token, body: JSON.stringify(body) }),
  updatePrompt: (id, body, token) => request(`/prompts/${segment(id)}`, { method: "PATCH", token, body: JSON.stringify(body) }),
  deletePrompt: (id, token) => request(`/prompts/${segment(id)}`, { method: "DELETE", token }),

  dashboard: (token, range = 6) => request(`/dashboard?range=${range}`, { token }),
  myPrompts: (query, token) => request(withQuery("/dashboard/my-prompts", query), { token }),
  savedPrompts: (query, token) => request(withQuery("/dashboard/saved", query), { token }),
  myReviews: (query, token) => request(withQuery("/dashboard/reviews", query), { token }),
  notifications: (token, limit = 10) => request(`/dashboard/notifications?limit=${limit}`, { token }),
  markNotificationsRead: (token) => request("/dashboard/notifications/read", { method: "PATCH", token }),
  markNotificationRead: (id, token) => request(`/dashboard/notifications/${segment(id)}/read`, { method: "PATCH", token }),

  createCheckout: (token, returnTo) => request("/payments/create-checkout-session", { method: "POST", token, body: JSON.stringify({ returnTo }) }),
  verifyPayment: (sessionId, token) => request(`/payments/verify/${segment(sessionId)}`, { token }),

  upload: async (file, token) => {
    const form = new FormData();
    form.append("image", file);
    let response;
    try {
      response = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
    }
    catch {
      throw new ApiError("Could not reach the upload service");
    }
    const payload = await response.json().catch(() => ({ message: "Unexpected upload response" }));
    if (!response.ok)
      throw new ApiError(payload.message || "Upload failed", response.status);
    return payload;
  },

  adminAnalytics: (token, range = 6) => request(`/admin/analytics?range=${range}`, { token }),
  adminUsers: (query, token) => request(withQuery("/admin/users", query), { token }),
  updateRole: (id, role, token) => request(`/admin/users/${segment(id)}/role`, { method: "PATCH", token, body: JSON.stringify({ role }) }),
  updateUserStatus: (id, status, token) => request(`/admin/users/${segment(id)}/status`, { method: "PATCH", token, body: JSON.stringify({ status }) }),
  deleteUser: (id, token) => request(`/admin/users/${segment(id)}`, { method: "DELETE", token }),
  adminPrompts: (query, token) => request(withQuery("/admin/prompts", query), { token }),
  moderatePrompt: (id, status, token, feedback) => request(`/admin/prompts/${segment(id)}/moderate`, { method: "PATCH", token, body: JSON.stringify({ status, feedback }) }),
  featurePrompt: (id, token) => request(`/admin/prompts/${segment(id)}/feature`, { method: "PATCH", token }),
  deleteAdminPrompt: (id, token) => request(`/admin/prompts/${segment(id)}`, { method: "DELETE", token }),
  adminPayments: (query, token) => request(withQuery("/admin/payments", query), { token }),
  adminReports: (query, token) => request(withQuery("/admin/reports", query), { token }),
  resolveReport: (id, action, token) => request(`/admin/reports/${segment(id)}`, { method: "PATCH", token, body: JSON.stringify({ action }) }),
};

export function getStoredToken() {
  if (typeof window === "undefined")
    return null;
  return window.localStorage.getItem("promptarc_token");
}
