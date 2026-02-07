import { render, screen } from "@testing-library/react";
import { ReactRoot } from "./reactjs/ReactRoot";

test("renders welcome screen", async () => {
  render(<ReactRoot />);
  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});
