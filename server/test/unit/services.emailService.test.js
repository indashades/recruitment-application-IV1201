jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

const nodemailer = require("nodemailer");
const { sendRecoveryEmail } = require("../../src/services/emailService");

describe("services/emailService", () => {
  beforeEach(() => {
    nodemailer.createTransport.mockReset();
    process.env.MAIL_USER = "smtp-user@test.local";
    process.env.MAIL_PASSWORD = "smtp-pass";
    process.env.MAIL_FROM = "Recruitment App <no-reply@test.local>";
    process.env.RECOVERY_TOKEN_TTL_MINUTES = "30";
    delete process.env.APP_NAME;
  });

  test("sendRecoveryEmail sends expected mail payload", async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: "abc123" });
    nodemailer.createTransport.mockReturnValue({ sendMail });

    await sendRecoveryEmail({
      to: "user@example.com",
      recoveryLink: "http://localhost:5173/account-recovery?token=xyz",
      mode: "reset_password",
    });

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(1);

    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe("user@example.com");
    expect(mail.from).toContain("Recruitment App");
    expect(mail.subject).toMatch(/reset your password/i);
    expect(mail.text).toContain("http://localhost:5173/account-recovery?token=xyz");
  });

  test("throws if provider returns no messageId", async () => {
    const sendMail = jest.fn().mockResolvedValue({}); // missing messageId
    nodemailer.createTransport.mockReturnValue({ sendMail });

    await expect(
      sendRecoveryEmail({
        to: "user@example.com",
        recoveryLink: "http://x",
        mode: "set_password",
      })
    ).rejects.toThrow(/provider/i);
  });
});