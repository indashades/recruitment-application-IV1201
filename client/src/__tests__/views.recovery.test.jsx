import { render, screen, fireEvent } from "@testing-library/react";
import { RecoverView } from "../view/RecoverView";
import { Recover2View } from "../view/Recover2View";

describe("recovery views", () => {
  test("RecoverView renders status messages and triggers actions", () => {
    const onChange = jest.fn();
    const doUsername = jest.fn();
    const onBack = jest.fn();

    render(
      <RecoverView
        onChange={onChange}
        doUsername={doUsername}
        usernameV="alice@example.com"
        errorMessage="Could not send email"
        successMessage="If the account exists, an email was sent"
        onBack={onBack}
      />
    );

    expect(screen.getByRole("heading", { name: /reset your password/i })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/could not send email/i);
    expect(screen.getByRole("status")).toHaveTextContent(/if the account exists/i);

    fireEvent.change(screen.getByLabelText(/username or email/i), {
      target: { value: "alice" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send recovery link/i }).closest("form"));
    fireEvent.click(screen.getByRole("button", { name: /back to sign in/i }));

    expect(doUsername).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test("Recover2View shows invalid-link state when no token is available", () => {
    const onRequestNewLink = jest.fn();
    const onBack = jest.fn();

    render(
      <Recover2View
        onChange={jest.fn()}
        doPW={jest.fn()}
        hasToken={false}
        onBack={onBack}
        onRequestNewLink={onRequestNewLink}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/incomplete or invalid/i);

    fireEvent.click(screen.getByRole("button", { name: /request new recovery link/i }));
    fireEvent.click(screen.getByRole("button", { name: /back to start/i }));

    expect(onRequestNewLink).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test("Recover2View submits a new password and supports loading state", () => {
    const onChange = jest.fn();
    const doPW = jest.fn();

    const { rerender } = render(
      <Recover2View
        onChange={onChange}
        doPW={doPW}
        hasToken
        passwordV=""
        loading={false}
        onBack={jest.fn()}
        onRequestNewLink={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "new-secret-pass" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /save new password/i }).closest("form"));

    expect(doPW).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(
      <Recover2View
        onChange={onChange}
        doPW={doPW}
        hasToken
        passwordV="new-secret-pass"
        loading
        onBack={jest.fn()}
        onRequestNewLink={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
