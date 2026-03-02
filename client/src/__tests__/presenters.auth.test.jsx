import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Start } from "../reactjs/startPresenter";
import { Login } from "../reactjs/LoginPresenter";
import { Register } from "../reactjs/RegisterPresenter";

describe("auth-related presenters", () => {
  beforeEach(() => {
    window.location.hash = "#/";
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Start presenter redirects logged-out users to auth before viewing applicants", () => {
    const appModel = {
      recruiter: 0,
      loggedin: 0,
      setWantedPage: jest.fn(),
    };

    render(<Start model={appModel} />);

    fireEvent.click(screen.getByRole("button", { name: /view applicants/i }));

    expect(appModel.setWantedPage).toHaveBeenCalledWith("#/rec");
    expect(window.location.hash).toBe("#/RegOrLog");
  });

  test("Start presenter redirects logged-out users to auth before applying", () => {
    const appModel = {
      recruiter: 0,
      loggedin: 0,
      setWantedPage: jest.fn(),
    };

    render(<Start model={appModel} />);

    fireEvent.click(screen.getByRole("button", { name: /apply for the job/i }));

    expect(appModel.setWantedPage).toHaveBeenCalledWith("#/Appl");
    expect(window.location.hash).toBe("#/RegOrLog");
  });

  test("Login presenter calls model.loggaIn and redirects after success", async () => {
    const appModel = {
      wantedPage: "#/rec",
      loggedin: 0,
      loggaIn: jest.fn(async () => {
        appModel.loggedin = 1;
      }),
    };

    render(<Login model={appModel} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(appModel.loggaIn).toHaveBeenCalledWith("alice", "secret-pass");
      expect(window.location.hash).toBe("#/rec");
    });
  });

  test("Register presenter blocks missing fields before calling the model", async () => {
    const appModel = {
      wantedPage: "#/Appl",
      loggedin: 0,
      registrering: jest.fn(),
      loggaIn: jest.fn(),
    };

    render(<Register model={appModel} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("missing person number");
    });
    expect(appModel.registrering).not.toHaveBeenCalled();
    expect(appModel.loggaIn).not.toHaveBeenCalled();
  });

  test("Register presenter submits valid registration data and logs in", async () => {
    const appModel = {
      wantedPage: "#/Appl",
      loggedin: 0,
      registrering: jest.fn(async () => {}),
      loggaIn: jest.fn(async () => {
        appModel.loggedin = 1;
      }),
    };

    render(<Register model={appModel} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret-pass" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e-mail address/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: "Applicant" },
    });
    fireEvent.change(screen.getByPlaceholderText(/person number/i), {
      target: { value: "199001011234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(appModel.registrering).toHaveBeenCalledWith(
        "199001011234",
        "Alice",
        "Applicant",
        "alice@example.com",
        "secret-pass",
        "alice"
      );
      expect(appModel.loggaIn).toHaveBeenCalledWith("alice", "secret-pass");
      expect(window.location.hash).toBe("#/Appl");
    });
  });
});
