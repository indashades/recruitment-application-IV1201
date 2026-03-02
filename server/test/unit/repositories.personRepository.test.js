jest.mock("../../src/repositories/db", () => ({
  exec: jest.fn(),
}));

const { exec } = require("../../src/repositories/db");
const { personRepository } = require("../../src/repositories/personRepository");

describe("repositories/personRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createPerson returns the inserted display-safe person row", async () => {
    exec.mockResolvedValueOnce({
      rows: [
        {
          id: 9,
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada@example.com",
        },
      ],
    });

    const row = await personRepository.createPerson(
      { query: jest.fn() },
      {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        personnummer: "199001011234",
      }
    );

    expect(exec).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining("INSERT INTO person"),
      ["Ada", "Lovelace", "ada@example.com", "199001011234"]
    );
    expect(row).toEqual({
      id: 9,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
    });
  });

  test("getPersonDisplayById returns null when no person exists", async () => {
    exec.mockResolvedValueOnce({ rows: [] });

    await expect(personRepository.getPersonDisplayById(999)).resolves.toBeNull();
  });
});
