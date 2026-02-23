const { sendRecoveryEmail } = require("../../src/services/emailService");

function makeHeaders(map = {}) {
  const lowered = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [String(k).toLowerCase(), v])
  );
  return {
    get(name) {
      return lowered[String(name).toLowerCase()] ?? null;
    },
  };
}

describe("services/emailService (MailerSend)", () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    process.env.MAILERSEND_API_KEY = "ms_test_token";
    process.env.MAIL_FROM = "Recruitment App <no-reply@example.com>";
    process.env.MAILERSEND_API_URL = "https://api.mailersend.com/v1/email";
    process.env.RECOVERY_TOKEN_TTL_MINUTES = "30";
    delete process.env.APP_NAME;
    delete process.env.MAILERSEND_REPLY_TO;

    global.fetch = jest.fn();
  });

  test("sendRecoveryEmail sends expected MailerSend payload", async () => {
    global.fetch.mockResolvedValue({
      status: 202,
      headers: makeHeaders({ "x-message-id": "msg_123" }),
      text: async () => "",
    });

    await sendRecoveryEmail({
      to: "user@example.com",
      recoveryLink: "http://localhost:5173/account-recovery?token=xyz",
      mode: "reset_password",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("https://api.mailersend.com/v1/email");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer ms_test_token");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.from.email).toBe("no-reply@example.com");
    expect(body.from.name).toBe("Recruitment App");
    expect(body.to).toEqual([{ email: "user@example.com" }]);
    expect(body.subject).toMatch(/reset your password/i);
    expect(body.text).toContain("http://localhost:5173/account-recovery?token=xyz");
    expect(body.html).toContain("Continue account recovery");
  });

  test("throws on MailerSend API validation error", async () => {
    global.fetch.mockResolvedValue({
      status: 422,
      headers: makeHeaders({}),
      text: async () =>
        JSON.stringify({
          message: "The given data was invalid.",
          errors: {
            from: ["The domain must be verified."],
          },
        }),
    });

    await expect(
      sendRecoveryEmail({
        to: "user@example.com",
        recoveryLink: "http://x",
        mode: "set_password",
      })
    ).rejects.toThrow(/422|verified|invalid/i);
  });

  test("throws if accepted response has no message id", async () => {
    global.fetch.mockResolvedValue({
      status: 202,
      headers: makeHeaders({}),
      text: async () => "",
    });

    await expect(
      sendRecoveryEmail({
        to: "user@example.com",
        recoveryLink: "http://x",
        mode: "set_password",
      })
    ).rejects.toThrow(/message id/i);
  });
});