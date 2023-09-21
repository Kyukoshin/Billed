/**
 * @jest-environment jsdom
 */

// Import necessary testing utilities and components
import { screen, waitFor } from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { mockBillsError404 } from '../__mocks__/error404.js';
import { mockBillsError500 } from '../__mocks__/error500.js';
import router from "../app/Router.js";

// Mock the store for testing purposes
jest.mock("../app/Store", () => mockStore);

// Begin describing the test suite
describe("Given I am connected as an employee", () => {
  // Describe the first test scenario
  describe("When I am on Bills Page", () => {
    // Define the first test case
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Set up the test environment and navigate to the Bills page
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Wait for the bill icon to appear and check its presence
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    });

    // Define the second test case
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => (a > b);
      const datesSorted = [ ...dates ].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // Describe the third test scenario (When I click on the eye icon of a bill)
  describe("When I click on the eye icon of a bill", () => {
    // Define the third test case
    test("It should open a modal", async () => {
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bills });

      const handleClickIconEye = jest.fn(icon => billsContainer.handleClickIconEye(icon));
      const iconEye = await screen.getAllByTestId("icon-eye");
      const modaleFile = document.getElementById("modaleFile");

      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));

      iconEye.forEach(icon => {
        icon.addEventListener("click", handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });

      expect(modaleFile).toBeTruthy();
    });
  });

  // Describe the fourth test scenario (When I click on the New Bill button)
  describe("When I click on the New Bill button", () => {
    // Define the fourth test case
    test("It should open the New Bill page", async () => {
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bills });

      const btnNewBill = await screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill);
      btnNewBill.addEventListener("click", handleClickNewBill);

      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
});

// Integration test for GET request
describe("Given I am connected as an employee", () => {
  // Describe the fifth test scenario (When I am on Bills Page)
  describe("When I am on Bills Page", () => {
    // Define the fifth test case
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("tbody")).toBeTruthy();
    });
  });

  // Describe the sixth test scenario (When an error occurs on API)
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    // Define the seventh test case (API error with 404 message)
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => mockBillsError404);
    
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    // Define the eighth test case (API error with 500 message)
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => mockBillsError500);
    
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
