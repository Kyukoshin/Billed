export const mockBillsError404 = {
    list: () => {
      return Promise.reject(new Error("Erreur 404"));
    },
  };