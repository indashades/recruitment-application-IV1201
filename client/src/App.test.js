import { render, screen } from "@testing-library/react";
import { StartView } from "./view/StartView";

test("shows the welcome screen", () => {
  render(
    <StartView
      onChange={() => {}}
      viewAppl={() => {}}
      apply={() => {}}
    />
  );

  expect(
    screen.getByRole("heading", { name: /welcome/i })
  ).toBeInTheDocument();
});
