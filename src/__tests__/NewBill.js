/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from '../constants/routes.js';

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
})

describe('handleSubmit', () => {
  let newBillInstance;
  let mockDocument;
  let mockOnNavigate;
  let mockStore;
  let mockLocalStorage;

  beforeEach(() => {
    // Create a mock document object with a file input element
    mockDocument = document.implementation.createHTMLDocument();
    mockDocument.body.innerHTML = `
      <form data-testid="form-new-bill">
        <input type="file" data-testid="file" />
        <!-- Other form fields here -->
      </form>
    `;

    // Mock the necessary dependencies (store, localStorage, etc.)
    mockOnNavigate = jest.fn();
    mockStore = {
      bills: {
        create: jest.fn().mockResolvedValue({ fileUrl: 'mocked-url', key: 'mocked-key' }),
        update: jest.fn().mockResolvedValue(),
      },
    };

    // Set up localStorage mock and set the "user" data
    mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify({ email: 'test@example.com' })),
      setItem: jest.fn(),
    };
    mockLocalStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));

    // Create a new instance of the NewBill class with the mock dependencies
    newBillInstance = new NewBill({
      document: mockDocument,
      onNavigate: mockOnNavigate,
      store: mockStore,
      localStorage: mockLocalStorage,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle form submission and update bill data', async () => {
    const formValues = {
      preventDefault: jest.fn(),
      target: {
        querySelector: jest.fn().mockImplementation(selector => {
          if (selector === 'select[data-testid="expense-type"]') {
            return { value: 'Expense Type' };
          }
          if (selector === 'input[data-testid="expense-name"]') {
            return { value: 'Expense Name' };
          }
          if (selector === 'input[data-testid="amount"]') {
            return { value: '100' };
          }
          if (selector === 'input[data-testid="datepicker"]') {
            return { value: '2023-09-06' };
          }
          if (selector === 'input[data-testid="vat"]') {
            return { value: '10' };
          }
          if (selector === 'input[data-testid="pct"]') {
            return { value: '20' };
          }
          if (selector === 'textarea[data-testid="commentary"]') {
            return { value: 'Commentary' };
          }
        }),
      },
    };

    await newBillInstance.handleSubmit(formValues);

    expect(newBillInstance.updateBill).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        type: 'Expense Type',
        name: 'Expense Name',
        amount: 100,
        date: '2023-09-06',
        vat: '10',
        pct: 20,
        commentary: 'Commentary',
        fileUrl: 'mocked-url',
        fileName: 'test.txt',
        status: 'pending',
      })
    );
    expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });
});
