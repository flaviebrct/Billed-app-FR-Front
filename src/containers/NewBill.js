import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];

    // Array that contain the allowed mime types
    const allowedExtensions = ["jpg", "jpeg", "png"];
    // Removes and return the last element of the file name which is the mime type
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // First we check if there's a file uploaded
    if (file) {
      // Condition that checks if the file extension is not "jpg", "jpeg" or "png" and so it's not valid
      if (!allowedExtensions.includes(fileExtension)) {
        // Add a data-error attributes for maybe adding UI showing the error
        document
          .querySelector(`input[data-testid="file"]`)
          .setAttribute("data-error", "Le fichier n'est pas autorisé.");
        document
          .querySelector(`input[data-testid="file"]`)
          .setAttribute("data-error-visible", true);
      }
      // The condition is not valid so the file extension is either "jpg", "jpeg" or "png" and so it's valid
      else {
        // Removes the data-error attributes so if UI showing the error is added it would not be visible anymore
        document
          .querySelector(`input[data-testid="file"]`)
          .setAttribute("data-error", "");
        document
          .querySelector(`input[data-testid="file"]`)
          .setAttribute("data-error-visible", false);

        // Then we take the values ​​from the form to create a new bill and send the email and the file to the server
        const formData = new FormData();
        const email = JSON.parse(localStorage.getItem("user")).email;
        formData.append("file", file);
        formData.append("email", email);

        this.store
          .bills()
          .create({
            data: formData,
            headers: {
              noContentType: true,
            },
          })
          .then(({ fileUrl, key }) => {
            this.billId = key;
            this.fileUrl = fileUrl;
            this.fileName = fileName;
          })
          .catch((error) => console.error(error));
      }
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();

    // Select the data error attribute
    const errorVisible = this.document
      .querySelector(`input[data-testid="file"]`)
      .getAttribute("data-error-visible");
    // It log an error when the data error attribute is true
    if (errorVisible === "true") {
      console.log("Cannot submit form due to file error");
      return;
    }

    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
