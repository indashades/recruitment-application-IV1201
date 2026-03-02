// jest-dom adds custom jest matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";

beforeEach(() => {
  jest.restoreAllMocks();
  window.alert = jest.fn();
  window.location.hash = "#/";
  window.localStorage.clear();
});
