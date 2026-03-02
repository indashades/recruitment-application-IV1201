jest.mock("../api/config", () => ({
  API_BASE_URL: "http://test.local/api/v1",
}));

import { setToken } from "../api";
import {
  login,
  register,
  submitApplication,
  getApplications,
  getApplication,
  editAppStatus,
  sendRec1,
  sendRec2,
} from "../asyncThings";

describe("client/asyncThings", () => {
  beforeEach(() => {
    setToken(null);
    global.fetch = jest.fn();
    jest.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    setToken(null);
    jest.restoreAllMocks();
  });

  test("login posts credentials and returns the role", async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ data: { token: "jwt-login", role: "recruiter" } }),
    });

    const result = await login("alice", "secret-pass");

    expect(fetch).toHaveBeenCalledWith(
      "http://test.local/api/v1/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "alice", password: "secret-pass" }),
      })
    );
    expect(result).toEqual({ role: "recruiter" });
  });

  test("register posts the applicant payload and stores the returned token", async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ data: { token: "jwt-register", role: "applicant" } }),
    });

    const result = await register(
      "alice",
      "secret-pass",
      "Alice",
      "Applicant",
      "alice@example.com",
      "199001011234"
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://test.local/api/v1/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          username: "alice",
          password: "secret-pass",
          firstName: "Alice",
          lastName: "Applicant",
          email: "alice@example.com",
          personnummer: "199001011234",
        }),
      })
    );
    expect(localStorage.setItem).toHaveBeenCalledWith("authToken", "jwt-register");
    expect(result).toEqual({ role: "applicant" });
  });

  test("submitApplication sends the auth token and application payload", async () => {
    setToken("jwt-applicant");
    fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: { applicationId: 10, status: "unhandled", version: 1 },
        }),
    });

    const payload = {
      competences: [{ competenceId: 1, yearsOfExperience: 2.5 }],
      availability: [{ fromDate: "2026-03-01", toDate: "2026-03-10" }],
    };

    const result = await submitApplication(payload.competences, payload.availability);

    expect(fetch).toHaveBeenCalledWith(
      "http://test.local/api/v1/applications",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-applicant",
        }),
      })
    );
    expect(result).toEqual({ applicationId: 10, status: "unhandled", version: 1 });
  });

  test("getApplications builds the expected query string", async () => {
    setToken("jwt-recruiter");
    fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ data: [{ applicationId: 10, fullName: "Alice Applicant" }] }),
    });

    const result = await getApplications("accepted", "Alice Smith");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "http://test.local/api/v1/applications?status=accepted&fullName=Alice+Smith"
      ),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer jwt-recruiter" }),
      })
    );
    expect(result).toEqual([{ applicationId: 10, fullName: "Alice Applicant" }]);
  });

  test("getApplication and editAppStatus hit the detail endpoints", async () => {
    setToken("jwt-recruiter");
    fetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ data: { applicationId: 10, status: "unhandled" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ data: { applicationId: 10, status: "accepted", version: 2 } }),
      });

    const details = await getApplication(10);
    const updated = await editAppStatus(10, "accepted", 1);

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://test.local/api/v1/applications/10",
      expect.objectContaining({ method: "GET" })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://test.local/api/v1/applications/10/status",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "accepted", version: 1 }),
      })
    );
    expect(details).toEqual({ applicationId: 10, status: "unhandled" });
    expect(updated).toEqual({ applicationId: 10, status: "accepted", version: 2 });
  });

  test("recovery helpers use backend endpoints only and never call mail services directly", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ data: { accepted: true } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({ data: { token: "jwt-recovered", role: "applicant" } }),
      });

    const requestResult = await sendRec1("alice@example.com");
    const confirmResult = await sendRec2("raw-recovery-token", "new-secret-pass");

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://test.local/api/v1/auth/recovery/request",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ identifier: "alice@example.com" }),
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://test.local/api/v1/auth/recovery/confirm",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "raw-recovery-token", newPassword: "new-secret-pass" }),
      })
    );
    expect(localStorage.setItem).toHaveBeenCalledWith("authToken", "jwt-recovered");
    expect(requestResult).toEqual({ accepted: true });
    expect(confirmResult).toEqual({ token: "jwt-recovered", role: "applicant" });
  });
});
