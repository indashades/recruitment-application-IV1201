jest.mock("../asyncThings", () => ({
  getApplications: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  submitApplication: jest.fn(),
  getApplication: jest.fn(),
  editAppStatus: jest.fn(),
  sendRec1: jest.fn(),
  sendRec2: jest.fn(),
}));

import { model } from "../EmploymentModel";
import {
  getApplications,
  login,
  register,
  submitApplication,
  getApplication,
  editAppStatus,
  sendRec1,
  sendRec2,
} from "../asyncThings";

function resetModelState() {
  model.person_id = null;
  model.name = null;
  model.surname = null;
  model.pnr = null;
  model.email = null;
  model.pw = null;
  model.role_id = null;
  model.username = null;
  model.loggedin = 0;
  model.recruiter = 0;
  model.wantedPage = "#/";
  model.applications = [];
  model.selectedApplication = null;
  model.token = null;
  model.readym = true;
  model.status = null;
  model.search = null;
  model.mes = null;
  model.user = null;
}

describe("EmploymentModel", () => {
  beforeEach(() => {
    resetModelState();
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("setWantedPage updates navigation target", () => {
    model.setWantedPage("#/Appl");
    expect(model.wantedPage).toBe("#/Appl");
  });

  test("makeApp seeds two sample applications", () => {
    model.makeApp();
    expect(model.applications).toHaveLength(2);
    expect(model.applications[0]).toEqual(
      expect.objectContaining({ applicationId: 10, status: "unhandled" })
    );
  });

  test("setss stores search filters and applies defaults for null values", () => {
    model.setss(null, null);
    expect(model.status).toBe("unhandled");
    expect(model.search).toBe("");
  });

  test("onSearch loads applications through asyncThings and toggles ready state", async () => {
    getApplications.mockResolvedValue([{ applicationId: 7, fullName: "Alice Applicant" }]);

    await model.onSearch();

    expect(getApplications).toHaveBeenCalledWith("unhandled", "");
    expect(model.readym).toBe(true);
    expect(model.applications).toEqual([{ applicationId: 7, fullName: "Alice Applicant" }]);
  });

  test("get1Application stores the selected application details", async () => {
    getApplication.mockResolvedValue({ applicationId: 99, status: "unhandled" });

    await model.get1Application(99);

    expect(getApplication).toHaveBeenCalledWith(99);
    expect(model.selectedApplication).toEqual({ applicationId: 99, status: "unhandled" });
    expect(model.readym).toBe(true);
  });

  test("application builds competence and availability payloads before submitting", async () => {
    submitApplication.mockResolvedValue({ applicationId: 10 });

    await model.submitApplicationForm("2026-06-01", "2026-06-30", 1, 2, 3);

    expect(submitApplication).toHaveBeenCalledWith(
      [
        { competenceId: 1, yearsOfExperience: 1 },
        { competenceId: 2, yearsOfExperience: 2 },
        { competenceId: 3, yearsOfExperience: 3 },
      ],
      [{ fromDate: "2026-06-01", toDate: "2026-06-30" }]
    );
    expect(model.user).toEqual({ isAuthenticated: true });
  });

  test("registrering stores form data and sets loggedin on success", async () => {
    register.mockResolvedValue({ role: "applicant" });

    await model.registrering(
      "199001011234",
      "Alice",
      "Applicant",
      "alice@example.com",
      "secret-pass",
      "alice"
    );

    expect(register).toHaveBeenCalledWith(
      "alice",
      "secret-pass",
      "Alice",
      "Applicant",
      "alice@example.com",
      "199001011234"
    );
    expect(model.loggedin).toBe(1);
    expect(model.username).toBe("alice");
    expect(model.email).toBe("alice@example.com");
  });

  test("loggaIn sets loggedin and recruiter flags on successful recruiter login", async () => {
    login.mockResolvedValue({ role: "recruiter" });

    await model.loggaIn("recruiter1", "secret-pass");

    expect(login).toHaveBeenCalledWith("recruiter1", "secret-pass");
    expect(model.loggedin).toBe(1);
    expect(model.recruiter).toBe(1);
  });

  test("changeStatus stores backend success payload", async () => {
    model.selectedApplication = { applicationId: 5, version: 2 };
    editAppStatus.mockResolvedValue({ message: "Application status updated" });

    await model.changeStatus("accepted");

    expect(editAppStatus).toHaveBeenCalledWith(5, "accepted", 2);
    expect(model.mes).toEqual({ message: "Application status updated" });
  });

  test("changeStatus handles optimistic-lock conflicts without crashing", async () => {
    model.selectedApplication = { applicationId: 5, version: 2 };
    editAppStatus.mockRejectedValue({ error: { code: "CONFLICT" } });

    await model.changeStatus("accepted");

    expect(window.alert).toHaveBeenCalledWith(
      "Another user updated this application. Please refresh."
    );
    expect(model.mes).toEqual({ error: { code: "CONFLICT" } });
  });

  test("recovery helpers call asyncThings and update auth state when recovery succeeds", async () => {
    sendRec1.mockResolvedValue({ accepted: true });
    sendRec2.mockResolvedValue({ token: "jwt-new", role: "recruiter" });

    await model.rec1("alice@example.com");
    const result = await model.rec2("raw-token", "new-pass-123");

    expect(sendRec1).toHaveBeenCalledWith("alice@example.com");
    expect(sendRec2).toHaveBeenCalledWith("raw-token", "new-pass-123");
    expect(result).toEqual({ token: "jwt-new", role: "recruiter" });
    expect(model.loggedin).toBe(1);
    expect(model.recruiter).toBe(1);
  });
});
