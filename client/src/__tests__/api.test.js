jest.mock("../api/config", () => ({
  API_BASE_URL: "http://test.local/api/v1",
}));

import { request, setToken } from "../api";

describe("client/api", () => {
  beforeEach(() => {
    setToken(null);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    setToken(null);
    jest.resetAllMocks();
  });

  test("request returns json.data for a successful response", async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: { ok: true, value: 42 } }),
    });

    const data = await request("/health");

    expect(fetch).toHaveBeenCalledWith("http://test.local/api/v1/health", {
      headers: { "Content-Type": "application/json" },
    });
    expect(data).toEqual({ ok: true, value: 42 });
  });

  test("request adds bearer authorization when a token exists", async () => {
    setToken("jwt-123");
    fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: { accepted: true } }),
    });

    await request("/applications", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith("http://test.local/api/v1/applications", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer jwt-123",
      },
    });
  });

  test("request throws the parsed backend error when response is not ok", async () => {
    fetch.mockResolvedValue({
      ok: false,
      text: async () =>
        JSON.stringify({
          error: { code: "AUTH_INVALID", message: "Invalid credentials" },
        }),
    });

    await expect(
      request("/auth/login", { method: "POST", body: "{}" })
    ).rejects.toEqual({ code: "AUTH_INVALID", message: "Invalid credentials" });
  });

  test("request returns undefined for an empty successful body", async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: async () => "",
    });

    await expect(request("/noop")).resolves.toBeUndefined();
  });
});
