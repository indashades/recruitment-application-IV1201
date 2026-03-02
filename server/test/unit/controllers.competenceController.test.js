jest.mock("../../src/repositories/competenceRepository", () => ({
  competenceRepository: {
    listCompetences: jest.fn(),
  },
}));

const { competenceRepository } = require("../../src/repositories/competenceRepository");
const { listCompetences } = require("../../src/controllers/competenceController");

describe("controllers/competenceController", () => {
  function makeRes() {
    return {
      json: jest.fn(),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("maps repository rows into public competence objects", async () => {
    competenceRepository.listCompetences.mockResolvedValueOnce([
      { id: 1, code: "JAVA", name: "Java" },
      { id: 2, code: "JS", name: "JavaScript" },
    ]);

    const res = makeRes();
    await listCompetences({}, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Competences retrieved",
      data: [
        { id: 1, code: "JAVA", name: "Java" },
        { id: 2, code: "JS", name: "JavaScript" },
      ],
    });
  });
});
