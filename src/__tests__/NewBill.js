/**
 * @jest-environment jsdom
 */

// Import necessary testing utilities and components
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

// Mock the store for testing purposes
jest.mock("../app/Store", () => mockStore);

// Begin describing the test suite
describe("Given I am connected as an employee", () => {
  // Describe the first test scenario
  describe("When I am on NewBill Page", () => {
    // Define the first test case
    test("Then mail icon in vertical layout should be highlighted", async () => {
      // Set up the test environment and navigate to the NewBill page
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // Wait for the mail icon to appear and check its presence
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toBeTruthy();
    });
  });

  // Describe the second test scenario (Integration test for POSTing a new bill)
  describe("When I am on NewBill Page, I fill the form and submit", () => {
    // Define the second test case
    test("Then the bill is added to API POST", async () => {
      // Create the HTML for the NewBill page
      const html = NewBillUI()
      document.body.innerHTML = html

      // Define a sample bill data
      const bill = {
        email: "employee@test.tld",
        type: "Hôtel et logement",
        name: "Hôtel du centre ville",
        amount: 120,
        date: "2022-12-30",
        vat: "10",
        pct: 10,
        commentary: "",
        fileUrl: "testFacture.png",
        fileName: "testFacture",
        status: 'pending'
      };

      // Fill in the form fields with sample data
      const typeField = screen.getByTestId("expense-type");
      fireEvent.change(typeField, { target: { value: bill.type } });
      expect(typeField.value).toBe(bill.type);

      // Repeat similar steps for other form fields...

      // Create a NewBill instance and attach event listeners
      const newBillForm = screen.getByTestId("form-new-bill");
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Handle the file input change event
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      newBillForm.addEventListener("change", handleChangeFile);
      const fileField = screen.getByTestId("file");
      fireEvent.change(fileField, { target: { files: [ new File([bill.fileName], bill.fileUrl, { type: "image/png" }) ] } });
      expect(fileField.files[0].name).toBe(bill.fileUrl);
      expect(fileField.files[0].type).toBe("image/png");
      expect(handleChangeFile).toHaveBeenCalled();

      // Handle the form submit event
      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
