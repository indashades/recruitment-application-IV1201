import { render, screen, fireEvent } from "@testing-library/react";
import { RecruitView } from "../view/RecruitView";
import { DetailedView } from "../view/DetailedView";

describe("recruitment views", () => {
  test("RecruitView renders search controls and application cards", () => {
    const onSearch = jest.fn();
    const p1 = jest.fn();
    const p2 = jest.fn();
    const p3 = jest.fn();
    const applications = [
      {
        applicationId: 10,
        fullName: "Alice Applicant",
        status: "unhandled",
        submissionDate: "2026-02-02",
      },
      {
        applicationId: 11,
        fullName: "Bob Builder",
        status: "accepted",
        submissionDate: "2026-02-03",
      },
    ];

    render(
      <RecruitView
        onSearch={onSearch}
        p1={p1}
        p2={p2}
        p3={p3}
        model={{ applications }}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "accepted" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    fireEvent.click(screen.getByText(/Alice Applicant/i).closest("div"));

    expect(p1).toHaveBeenCalledTimes(1);
    expect(p2).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(p3).toHaveBeenCalledWith(10);
    expect(screen.getByText(/Bob Builder/i)).toBeInTheDocument();
  });

  test("DetailedView renders application details and allows status changes", () => {
    const p2 = jest.fn();
    const application = {
      applicationId: 10,
      status: "unhandled",
      submissionDate: "2026-02-02",
      version: 1,
      person: {
        firstName: "Alice",
        lastName: "Applicant",
        email: "alice@example.com",
      },
      competences: [
        {
          competenceId: 1,
          name: "Ticket sales",
          code: "TICKET",
          yearsOfExperience: 2.5,
        },
      ],
      availability: [{ fromDate: "2026-03-01", toDate: "2026-03-10" }],
    };

    render(<DetailedView p2={p2} model={{ application }} />);

    expect(screen.getByText(/First Name:/i)).toBeInTheDocument();
    expect(screen.getByText(/alice@example\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Ticket sales/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "accepted" } });

    expect(p2).toHaveBeenCalledTimes(1);
  });
});
