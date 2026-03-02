jest.mock("../../src/repositories/db", () => ({
  exec: jest.fn(),
}));

const { exec } = require("../../src/repositories/db");
const { eventLogRepository } = require("../../src/repositories/eventLogRepository");

describe("repositories/eventLogRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("insert serializes payload JSON before storing", async () => {
    exec.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    await eventLogRepository.insert(null, {
      ts: "2026-03-02T11:00:00.000Z",
      level: "info",
      event: "login_attempt",
      requestId: "req-1",
      actorUserId: 7,
      actorPersonId: 9,
      method: "POST",
      path: "/api/v1/auth/login",
      status: 200,
      ip: "127.0.0.1",
      userAgent: "jest",
      payload: { success: true },
    });

    const [_client, sql, params] = exec.mock.calls[0];
    expect(sql).toContain("INSERT INTO public.event_log");
    expect(params[0]).toBe("2026-03-02T11:00:00.000Z");
    expect(params[1]).toBe("info");
    expect(params[2]).toBe("login_attempt");
    expect(params[11]).toBe(JSON.stringify({ success: true }));
  });

  test("list builds filters and pagination into the SQL query", async () => {
    exec.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });

    const rows = await eventLogRepository.list({
      from: "2026-03-01T00:00:00.000Z",
      to: "2026-03-02T00:00:00.000Z",
      level: "info",
      event: "login_attempt",
      requestId: "req-1",
      actorUserId: 7,
      limit: 25,
      offset: 5,
    });

    const [_client, sql, params] = exec.mock.calls[0];
    expect(sql).toContain("FROM public.event_log");
    expect(sql).toContain("WHERE");
    expect(sql).toContain("ORDER BY ts DESC, id DESC");
    expect(params).toEqual([
      "2026-03-01T00:00:00.000Z",
      "2026-03-02T00:00:00.000Z",
      "info",
      "login_attempt",
      "req-1",
      7,
      25,
      5,
    ]);
    expect(rows).toEqual([{ id: 1 }]);
  });
});
