/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { formatDate } from "../app/format.js";
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);
jest.mock("../app/format.js");

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills page", () => {
    beforeEach(() => {
      // Add a spy on the method "bills" of the object mockStore
      jest.spyOn(mockStore, "bills");
      // Replaces the 'localStorage' property of the 'window' object with a mocked version, 'localStorageMock'
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // Sets an item in the mocked localStorage for a logged in user
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      // Creating a div element with id "root" in the body of the document
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Calling the router
      router();
    });

    // test d'intégration GET
    test("fetches bills from mock API GET", async () => {
      // Simulates navigation to the Bills page
      window.onNavigate(ROUTES_PATH.Bills);
      expect(mockStore.bills).toHaveBeenCalled();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      // Simulates that the API returns a 500 error for the next call
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      // Simulates navigation to the Bills page
      window.onNavigate(ROUTES_PATH.Bills);
      // Wait until all pending asynchronous operations are done
      await new Promise(process.nextTick);
      // Wait to find an element with the text
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      // Simulates that the API returns a 500 error for the next call
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      // Simulates navigation to the Bills page
      window.onNavigate(ROUTES_PATH.Bills);
      // Wait until all pending asynchronous operations are done
      await new Promise(process.nextTick);
      // Wait to find an element with the text
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });

    test("Then data are corrupted, should return error", async () => {
      // Check if the given date matches the format YYYY-MM-DD.
      function isDateFormated(dateStr) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateStr);
      }
      // Simulates an error for the next call
      formatDate.mockImplementation(() => {
        throw new Error("Simulated error");
      });

      // Create a new instance of the Bills component
      const instance = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
      // Get all the bills in the array
      const newBills = await instance.getBills();
      newBills.forEach((bill) => {
        console.log(bill.date);
        expect(isDateFormated(bill.date)).toBeTruthy();
      });
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I am on Bills Page and click on NewBills", () => {
    test("Then it should navigate to new bills page", () => {
      // Peplaces the 'localStorage' property of the 'window' object with a mocked version, 'localStorageMock'
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // Sets an item in the mocked localStorage for a logged in user
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Creating a div element with id "root" in the body of the document
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Calling the router
      router();

      // Simulate the navigation with a given argument
      const mockOnNavigate = jest.fn();

      // Create a new instance of the Bills component
      const instance = new Bills({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      screen.getByTestId("btn-new-bill").click();
      console.log(screen.getByTestId("btn-new-bill"));

      expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });
});
