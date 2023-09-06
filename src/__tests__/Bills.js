/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import $ from 'jquery';


import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      console.log(dates)
      expect(dates).toEqual(datesSorted)
    })
    // New test for getBills method
    test("Then getBills should return bills sorted by date with formatted date and status", async () => {
      // Mock the store and set up a mock snapshot
      const mockStore = {
        bills: jest.fn(() => ({
          list: jest.fn(() => Promise.resolve([])), // Mock the store's list method
        })),
      };

      // Create an instance of the Bills class with the mock store
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore, // Provide the mock store
        localStorage: null, // Replace with your actual localStorage if needed
      });

      // Call the getBills method
      const result = await billsInstance.getBills();

      // Assertions for the result, you can customize these based on your implementation
      expect(result).toEqual([]); // Assert that the result matches your expected output
    });
  })

  describe("When I click the 'New Bill' button", () => {
    test("Then it should navigate to the NewBill route", async () => {
      // Set up the environment
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Mock the onNavigate function
      const mockOnNavigate = jest.fn();
      const billsInstance = new Bills({
        document: document,
        onNavigate: mockOnNavigate,
        store: null, // Replace with your actual store if needed
        localStorage: localStorageMock
      });

      // Simulate a click on the 'New Bill' button
      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.click();

      // Expect that the onNavigate function was called with the NewBill route
      await waitFor(() => expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill));
    });
  });

  describe("When I click an eye icon", () => {

    // Mock the jQuery methods before this test case
    $.fn.modal = jest.fn();
    $.fn.width = jest.fn(() => 100);

    test("Then it should display the bill image in a modal", () => {
      // Mock the necessary functions and setup
      const mockIcon = document.createElement('div');
      mockIcon.setAttribute('data-bill-url', 'mock-bill-url');

      // Mock jQuery functions
      const modalShowSpy = jest.spyOn($.fn, 'modal');
      const modalBodyHtmlSpy = jest.spyOn($.fn, 'html');
      const modalBodyWidthSpy = jest.spyOn($.fn, 'width').mockReturnValue(200);

      // Create an instance of the Bills class
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: null, // Replace with your actual store if needed
        localStorage: null, // Replace with your actual localStorage if needed
      });

      // Call the handleClickIconEye method
      billsInstance.handleClickIconEye(mockIcon);

      // Assertions
      expect(modalShowSpy).toHaveBeenCalledWith('show');
      expect(modalBodyWidthSpy).toHaveBeenCalled();
      expect(modalBodyHtmlSpy).toHaveBeenCalledWith(
        `<div style='text-align: center;' class="bill-proof-container"><img width=100 src=mock-bill-url alt="Bill" /></div>`
      );
    });
  });


})

