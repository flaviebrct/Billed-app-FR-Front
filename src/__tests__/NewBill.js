/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill form should be displayed", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      //to-do write expect expression
      expect(mailIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  describe("When I add a new Proof file", () => {
    beforeEach(async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.NewBill);
    });
    test("Then the file should not be added if is mime type isn't 'png', 'jpg' or 'jpeg' ", () => {
      const newBills = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(() => newBills.handleChangeFile);
      const fileInput = document.querySelector(`input[data-testid="file"]`);
      fileInput.addEventListener("change", (e) => handleChangeFile(e));
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["test.svg"], "test.svg", {
              type: "image/svg",
            }),
          ],
        },
      });

      expect(fileInput.value).toBe("");
      expect(handleChangeFile).toBeCalled();
    });
    test("Then the file should be added if is mime type is 'png', 'jpg' or 'jpeg' ", () => {
      const newBills = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(() => newBills.handleChangeFile);
      const fileInput = document.querySelector(`input[data-testid="file"]`);
      fileInput.addEventListener("change", (e) => handleChangeFile(e));
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["test.jpeg"], "test.jpeg", {
              type: "image/jpeg",
            }),
          ],
        },
      });

      expect(fileInput.files[0].type).toBe("image/jpeg");
      expect(handleChangeFile).toBeCalled();
    });
  });
});
