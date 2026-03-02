import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Recover } from "../reactjs/recoverPresenter";
import { Recover2 } from "../reactjs/recover2Presenter";

function renderWithRouter(ui, initialEntry = "/") {
  return render(<MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>);
}

describe("recovery presenters", () => {
  beforeEach(() => {
    window.location.hash = "#/";
  });

  test("Recover presenter validates short identifiers on the client", async () => {
    const appModel = {
      rec1: jest.fn(),
    };

    renderWithRouter(<Recover model={appModel} />);

    fireEvent.change(screen.getByLabelText(/username or email/i), {
      target: { value: "ab" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send recovery link/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 3 characters/i);
    expect(appModel.rec1).not.toHaveBeenCalled();
  });

  test("Recover presenter shows a generic success message after mocked backend acceptance", async () => {
    const appModel = {
      rec1: jest.fn().mockResolvedValue({ accepted: true }),
    };

    renderWithRouter(<Recover model={appModel} />);

    fireEvent.change(screen.getByLabelText(/username or email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send recovery link/i }));

    await waitFor(() => {
      expect(appModel.rec1).toHaveBeenCalledWith("alice@example.com");
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/check your inbox/i);
  });

  test("Recover presenter shows a generic error when the backend call fails", async () => {
    const appModel = {
      rec1: jest.fn().mockRejectedValue(new Error("network down")),
    };

    renderWithRouter(<Recover model={appModel} />);

    fireEvent.change(screen.getByLabelText(/username or email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send recovery link/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't send the recovery email/i);
  });

  test("Recover2 presenter renders the invalid-link view when no token is present", () => {
    renderWithRouter(<Recover2 model={{ rec2: jest.fn() }} />, "/__recover");

    expect(screen.getByRole("alert")).toHaveTextContent(/incomplete or invalid/i);

    fireEvent.click(screen.getByRole("button", { name: /request new recovery link/i }));
    expect(window.location.hash).toBe("#/rec1");
  });

  test("Recover2 presenter validates password length before calling the model", async () => {
    const appModel = {
      rec2: jest.fn(),
    };

    renderWithRouter(<Recover2 model={appModel} />, "/__recover?token=raw-token");

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save new password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 8 characters/i);
    expect(appModel.rec2).not.toHaveBeenCalled();
  });

  test("Recover2 presenter submits a valid token/password pair and redirects home", async () => {
    const appModel = {
      rec2: jest.fn().mockResolvedValue({ token: "jwt", role: "applicant" }),
    };

    renderWithRouter(<Recover2 model={appModel} />, "/__recover?token=raw-token");

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "new-secret-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save new password/i }));

    await waitFor(() => {
      expect(appModel.rec2).toHaveBeenCalledWith("raw-token", "new-secret-pass");
      expect(window.location.hash).toBe("#/"
      );
    });
  });
});
