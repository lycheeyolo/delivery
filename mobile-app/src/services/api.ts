import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";

const defaultApiBaseUrl: string =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  (Constants.manifest as any)?.extra?.apiBaseUrl;

let customApiBaseUrl: string | null = null;
const STORAGE_KEY_API_BASE_URL = "customApiBaseUrl";
const CONFIG_FILE_PATH = `${FileSystem.documentDirectory || ""}backend-config.json`;

let authToken: string | null = null;

export const getToken = () => authToken;
export const clearToken = () => {
  authToken = null;
};

export const getDefaultApiBaseUrl = () => defaultApiBaseUrl;
export const getCurrentApiBaseUrl = () => customApiBaseUrl || defaultApiBaseUrl;
export const getCustomApiBaseUrl = () => customApiBaseUrl;

export const loadCustomApiBaseUrl = async () => {
  try {
    if (!CONFIG_FILE_PATH) {
      customApiBaseUrl = null;
      return;
    }
    const info = await FileSystem.getInfoAsync(CONFIG_FILE_PATH);
    if (!info.exists) {
      customApiBaseUrl = null;
      return;
    }
    const content = await FileSystem.readAsStringAsync(CONFIG_FILE_PATH);
    const parsed = JSON.parse(content);
    const v = parsed?.[STORAGE_KEY_API_BASE_URL];
    customApiBaseUrl = typeof v === "string" && v.trim() ? v.trim() : null;
  } catch {
    customApiBaseUrl = null;
  }
};

export const setCustomApiBaseUrl = async (url: string | null) => {
  const trimmed = url?.trim();
  customApiBaseUrl = trimmed || null;
  try {
    if (!CONFIG_FILE_PATH) return;
    if (customApiBaseUrl) {
      await FileSystem.writeAsStringAsync(
        CONFIG_FILE_PATH,
        JSON.stringify({ [STORAGE_KEY_API_BASE_URL]: customApiBaseUrl }),
      );
    } else if (await FileSystem.getInfoAsync(CONFIG_FILE_PATH).then((i) => i.exists)) {
      await FileSystem.deleteAsync(CONFIG_FILE_PATH, { idempotent: true });
    }
  } catch {
    // 忽略存储错误，不影响运行
  }
};

export const apiLogin = async (phone: string, password: string) => {
  const res = await fetch(`${getCurrentApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) {
    throw new Error("登录失败");
  }
  const data = await res.json();
  authToken = data.token;
  return data;
};

export const apiRegister = async (phone: string, password: string, name?: string) => {
  const res = await fetch(`${getCurrentApiBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password, name }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "注册失败");
  }
  return res.json();
};

async function request(path: string, options: RequestInit = {}) {
  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const baseUrl = getCurrentApiBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "请求失败");
  }
  return res.json();
}

export const apiGetPendingOrders = () => request("/api/orders/pending");

/** 带配送列表（待配送+配送中） */
export const apiGetDeliveryList = () => request("/api/orders/delivery-list");

/** 新增配送任务 */
export const apiCreateOrder = (payload: { householdId: string; taskNote?: string }) =>
  request("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiOptimizeRoute = (current: { lat: number; lng: number }, orderIds: string[]) =>
  request("/api/route/optimize", {
    method: "POST",
    body: JSON.stringify({ current, orderIds }),
  });

export const apiUpdateOrderStatus = (id: string, status: string) =>
  request(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const apiAddOrderNote = (id: string, content: string) =>
  request(`/api/orders/${id}/note`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const apiDeleteOrder = (id: string) =>
  request(`/api/orders/${id}`, {
    method: "DELETE",
  });

export const apiGetDailyStats = (date: string) => request(`/api/stats/daily?date=${date}`);

export const apiCreateContact = (payload: {
  phone: string;
  displayName: string;
  remark?: string;
  household?: {
    addressText?: string;
    lat: number;
    lng: number;
    doorplate?: string;
    note?: string;
  };
}) =>
  request("/api/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiGetContact = (id: string) => request(`/api/contacts/${id}`);

/** 通讯录列表（可选按手机号搜索），含 households */
export const apiGetContacts = (phone?: string) =>
  request(phone ? `/api/contacts?phone=${encodeURIComponent(phone)}` : "/api/contacts");

export const apiDeleteContact = (id: string) =>
  request(`/api/contacts/${id}`, {
    method: "DELETE",
  });

export const apiGetProfile = () => request("/api/auth/me");

export const apiUpdateProfile = (payload: { name?: string; phone?: string }) =>
  request("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const apiChangePassword = (payload: { oldPassword?: string; newPassword: string }) =>
  request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

