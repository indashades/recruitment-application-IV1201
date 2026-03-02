import { render, screen, fireEvent } from "@testing-library/react";
import { Apply } from "../reactjs/applyPresenter";

describe("apply presenter", () => {
  beforeEach(() => {
    window.location.hash = "#/Appl";
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("redirects non-authenticated users away from application submission", () => {
    const appModel = {
      loggedin: 0,
      application: jest.fn(),
    };

    render(<Apply model={appModel} />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(window.alert).toHaveBeenCalledWith("you are not logged in");
    expect(window.location.hash).toBe("#/");
    expect(appModel.application).not.toHaveBeenCalled();
  });

  test("cancel returns to the start page", () => {
    const appModel = {
      loggedin: 1,
      application: jest.fn(),
    };

    render(<Apply model={appModel} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(window.location.hash).toBe("#/");
  });
});
