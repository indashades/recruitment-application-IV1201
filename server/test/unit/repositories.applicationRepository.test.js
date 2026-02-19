jest.mock("../../src/repositories/db", () => ({
  exec: jest.fn(),
}));

const { exec } = require("../../src/repositories/db");
const { applicationRepository } = require("../../src/repositories/applicationRepository").applicationRepository
  ? require("../../src/repositories/applicationRepository").applicationRepository
  : require("../../src/repositories/applicationRepository").applicationRepository;

const repo = require("../../src/repositories/applicationRepository").applicationRepository;

describe("repositories/applicationRepository", () => {
  beforeEach(() => exec.mockReset());

  test("listForRecruiter applies search relevance + caps limit/offset", async () => {
    exec.mockResolvedValueOnce({ rows: [] });

    await repo.listForRecruiter({
      sortKey: "fullName",
      direction: "asc",
      q: "Ann",
      limit: 9999,
      offset: -10,
    });

    expect(exec).toHaveBeenCalledTimes(1);
    const [_client, sql, params] = exec.mock.calls[0];

    expect(sql).toContain("FROM application a");
    expect(sql).toContain("JOIN person p");
    expect(sql).toMatch(/ILIKE/);
    expect(sql).toContain("ORDER BY");
    expect(sql).toContain("p.last_name ASC");

    const limit = params[params.length - 2];
    const offset = params[params.length - 1];
    expect(limit).toBe(500);
    expect(offset).toBe(0);
  });

  test("updateStatusWithOptimisticLock returns null when no row updated", async () => {
    exec.mockResolvedValueOnce({ rows: [] });

    const r = await repo.updateStatusWithOptimisticLock({
      applicationId: 1,
      status: "accepted",
      version: 3,
    });

    expect(r).toBeNull();
  });
});
