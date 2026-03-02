jest.mock("../../src/repositories/db", () => ({
  exec: jest.fn(),
}));

const { exec } = require("../../src/repositories/db");
const { competenceRepository } = require("../../src/repositories/competenceRepository");

describe("repositories/competenceRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listCompetences returns rows ordered by name", async () => {
    exec.mockResolvedValueOnce({
      rows: [
        { id: 1, code: "JAVA", name: "Java" },
        { id: 2, code: "JS", name: "JavaScript" },
      ],
    });

    const rows = await competenceRepository.listCompetences();

    expect(exec).toHaveBeenCalledWith(
      null,
      "SELECT id, code, name FROM competence ORDER BY name ASC",
      []
    );
    expect(rows).toEqual([
      { id: 1, code: "JAVA", name: "Java" },
      { id: 2, code: "JS", name: "JavaScript" },
    ]);
  });
});
