export const mockBillsError500 = {
    list: () => {
      return Promise.reject(new Error("Erreur 500"));
    },
  };