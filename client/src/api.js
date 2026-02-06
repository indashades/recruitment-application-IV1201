
const BASE_URL = "http://localhost:3000/api/v1";

export let token = null;

export function setToken(newToken) {
  token = newToken;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const json = await res.json();

  if (!res.ok) {
    
    throw json.error ?? {
      code: "UNKNOWN",
      message: "Unknown error"
    };
  }

  return json.data;
}

export { request };
