import { API_BASE_URL } from "./api/config";

const BASE_URL = API_BASE_URL.replace(/\/$/, "");

export let token = null;

export function setToken(newToken) {
  token = newToken;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw json.error ?? {
      code: "UNKNOWN",
      message: "Unknown error",
    };
  }

  return json.data;
}

export { request };
