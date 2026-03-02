import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Recruit } from "../reactjs/recruitPresenter";
import { Detailed } from "../reactjs/detailedPresenter";

describe("recruitment presenters", () => {
  beforeEach(() => {
    window.location.hash = "#/";
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Recruit presenter delegates searches to the model", async () => {
    const appModel = {
      applications: [],
      setss: jest.fn(),
      onSearch: jest.fn().mockResolvedValue(undefined),
      get1Application: jest.fn(),
      loggedin: 1,
      makeApp: jest.fn(),
    };

    render(<Recruit model={appModel} />);

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "accepted" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(appModel.setss).toHaveBeenCalled();
      expect(appModel.onSearch).toHaveBeenCalledTimes(1);
    });
  });

  test("Recruit presenter loads a clicked application and navigates to details", async () => {
    const appModel = {
      applications: [
        {
          applicationId: 10,
          fullName: "Alice Applicant",
          status: "unhandled",
          submissionDate: "2026-02-02",
        },
      ],
      setss: jest.fn(),
      onSearch: jest.fn(),
      get1Application: jest.fn().mockResolvedValue(undefined),
      loggedin: 1,
      makeApp: jest.fn(),
    };

    render(<Recruit model={appModel} />);

    fireEvent.click(screen.getByText(/Alice Applicant/i).closest("div"));

    await waitFor(() => {
      expect(appModel.get1Application).toHaveBeenCalledWith(10);
      expect(window.location.hash).toBe("#/det");
    });
  });

  test("Detailed presenter changes status, refreshes the list, and returns to recruiter view", async () => {
    const appModel = {
      application: {
        applicationId: 10,
        status: "unhandled",
        submissionDate: "2026-02-02",
        version: 1,
        person: {
          firstName: "Alice",
          lastName: "Applicant",
          email: "alice@example.com",
        },
        competences: [],
        availability: [],
      },
      setsstat: jest.fn(),
      changeStatus: jest.fn().mockImplementation(async () => {
        appModel.mes = {};
      }),
      setss: jest.fn(),
      onSearch: jest.fn().mockResolvedValue(undefined),
      mes: {},
    };

    render(<Detailed model={appModel} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "accepted" } });

    await waitFor(() => {
      expect(appModel.setsstat).toHaveBeenCalledTimes(1);
      expect(appModel.changeStatus).toHaveBeenCalledWith("accepted");
      expect(appModel.setss).toHaveBeenCalledWith("unhandled", "");
      expect(appModel.onSearch).toHaveBeenCalledTimes(1);
      expect(window.location.hash).toBe("#/rec");
    });
  });
});
