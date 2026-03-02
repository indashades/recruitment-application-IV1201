import { render, screen, fireEvent } from "@testing-library/react";
import { StartView } from "../view/StartView";
import { LoginView } from "../view/LoginView";
import { RegisterView } from "../view/RegisterView";
import { ApplyView } from "../view/ApplyView";

describe("basic views", () => {
  test("StartView renders primary actions and calls handlers", () => {
    const onChange = jest.fn();
    const viewAppl = jest.fn();
    const apply = jest.fn();

    render(<StartView onChange={onChange} viewAppl={viewAppl} apply={apply} />);

    expect(screen.getByRole("heading", { name: /welcome/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /register\/login/i }));
    fireEvent.click(screen.getByRole("button", { name: /view applicants/i }));
    fireEvent.click(screen.getByRole("button", { name: /apply for the job/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(viewAppl).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
  });

  test("LoginView captures username/password input and submits", () => {
    const onChange = jest.fn();
    const doUsername = jest.fn();
    const doPW = jest.fn();

    render(<LoginView onChange={onChange} doUsername={doUsername} doPW={doPW} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(doUsername).toHaveBeenCalledTimes(1);
    expect(doPW).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("RegisterView exposes all registration inputs and submits", () => {
    const props = {
      onChange: jest.fn(),
      usernamea: jest.fn(),
      pwa: jest.fn(),
      maila: jest.fn(),
      name1a: jest.fn(),
      name2a: jest.fn(),
      pnra: jest.fn(),
    };

    render(<RegisterView {...props} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: "alice" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "secret-pass" } });
    fireEvent.change(screen.getByPlaceholderText(/e-mail address/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: "Applicant" } });
    fireEvent.change(screen.getByPlaceholderText(/person number/i), {
      target: { value: "199001011234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(props.usernamea).toHaveBeenCalledTimes(1);
    expect(props.pwa).toHaveBeenCalledTimes(1);
    expect(props.maila).toHaveBeenCalledTimes(1);
    expect(props.name1a).toHaveBeenCalledTimes(1);
    expect(props.name2a).toHaveBeenCalledTimes(1);
    expect(props.pnra).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  test("ApplyView lets the user fill fields and use cancel/submit", () => {
    const props = {
      onChange: jest.fn(),
      onChange2: jest.fn(),
      doPW: jest.fn(),
      doUsername: jest.fn(),
      appl1: jest.fn(),
      appl2: jest.fn(),
      appl3: jest.fn(),
    };

    render(<ApplyView {...props} />);

    fireEvent.change(screen.getByPlaceholderText(/avalable from/i), {
      target: { value: "2026-05-01" },
    });
    fireEvent.change(screen.getByPlaceholderText(/avalable to/i), {
      target: { value: "2026-05-20" },
    });
    fireEvent.change(screen.getByPlaceholderText(/ticket sales/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByPlaceholderText(/lotteries work/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/roller coaster operation/i), {
      target: { value: "3" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(props.doPW).toHaveBeenCalledTimes(1);
    expect(props.doUsername).toHaveBeenCalledTimes(1);
    expect(props.appl1).toHaveBeenCalledTimes(1);
    expect(props.appl2).toHaveBeenCalledTimes(1);
    expect(props.appl3).toHaveBeenCalledTimes(1);
    expect(props.onChange2).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });
});
