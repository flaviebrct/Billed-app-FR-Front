/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I should be able to pass 'png', 'jpg' or 'jpeg' as a Proof", () => {
      const user = userEvent;

      const html = NewBillUI();
      document.body.innerHTML = html;
      const fileInput = screen.getByTestId("file");
      const files = [
        new File(["test1"], "test1.png", { type: "image/png" }),
        new File(["test2"], "test2.jpg", { type: "image/jpg" }),
        new File(["test3"], "test3.jpeg", { type: "image/jpeg" }),
      ];

      files.forEach((file) => {
        user.upload(fileInput, file);
        console.log(fileInput.files[0].type);

        expect(fileInput.files[0]).toBe(file);
        expect(fileInput.files.item(0)).toBe(file);
        expect(fileInput.files[0].type).toBe(file.type);
        expect(fileInput.files).toHaveLength(1);
      });
    });
  });
});
