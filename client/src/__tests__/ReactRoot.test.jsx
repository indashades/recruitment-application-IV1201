import { render, screen, cleanup } from "@testing-library/react";
import { ReactRoot } from "../reactjs/ReactRoot";
import { model } from "../EmploymentModel";
import { act } from "react";
import { runInAction } from "mobx";

describe("ReactRoot", () => {
  afterEach(() => {
    act(() => {
      runInAction(() => {
        model.readym = true;
      });
    });
    window.location.hash = "#/";
    cleanup();
  });

  test("renders a loading state while the model is not ready", () => {
    model.readym = false;

    render(<ReactRoot />);

    expect(screen.getByRole("heading", { name: /loading/i })).toBeInTheDocument();
  });

  test("renders the start route when the model is ready", async () => {
    model.readym = true;
    window.location.hash = "#/";

    render(<ReactRoot />);

    expect(await screen.findByRole("heading", { name: /welcome/i })).toBeInTheDocument();
  });
});
