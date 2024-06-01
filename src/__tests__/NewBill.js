/**
 * @jest-environment jsdom
 */
import userEvent from "@testing-library/user-event";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

jest.mock("../app/store", () => mockStore);

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
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const createSpy = jest
        .spyOn(newBill.store.bills(), "create")
        .mockResolvedValue({
          fileUrl: "https://example.com/test.jpg",
          key: "1234",
        });

      const fakeEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "test.png",
        },
      };

      const inputFile = document.querySelector(`input[data-testid="file"]`);

      inputFile.addEventListener("change", () => {
        newBill.handleChangeFile(fakeEvent);
      });

      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["test.png"], "test.png", {
              type: "image/png",
            }),
          ],
        },
      });

      expect(createSpy).toBeCalled();
      expect(inputFile.files[0].type).toBe("image/png");
    });
  });

  // test d'intégration POST
  describe("When I complete the form", () => {
    test("Then if all the inputs are filled the form should be submitted and we should be redirected to the bill page", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
          password: "employee",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      const mockOnNavigate = jest.fn();

      const newBill = new NewBill({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const form = document.querySelector('form[data-testid="form-new-bill"]');

      form.addEventListener("submit", (e) => {
        handleSubmit(e);
      });

      const expenseType = document.querySelector(
        `select[data-testid="expense-type"]`
      );
      const expenseName = document.querySelector(
        `input[data-testid="expense-name"]`
      );
      const datePicker = document.querySelector(
        `input[data-testid="datepicker"]`
      );
      const amount = document.querySelector(`input[data-testid="amount"]`);
      const vat = document.querySelector(`input[data-testid="vat"]`);
      const pct = document.querySelector(`input[data-testid="pct"]`);
      const commentary = document.querySelector(
        `textarea[data-testid="commentary"]`
      );
      const fileInput = document.querySelector(`input[data-testid="file"]`);

      const submitBtn = document.querySelector("#btn-send-bill");

      expenseType.value = "Services en ligne";
      expenseName.value = "Test services en ligne";
      datePicker.value = "2020-08-06";
      amount.value = 572;
      vat.value = 93;
      pct.value = 27;
      commentary.value = "Ceci est un test d'intégration pour la méthode POST";

      const file = new File(["test"], "test.png", { type: "image/png" });

      userEvent.upload(fileInput, file);

      userEvent.click(submitBtn);

      expect(handleSubmit).toBeCalled();
      expect(form).toBeTruthy();
    });
  });
});
