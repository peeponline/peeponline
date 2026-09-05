import { createContext, useContext, useState } from 'react';

const SAVED_PRODUCTS_KEY = 'peep-saved-products';
const SavedContext = createContext();

const readSavedProducts = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_PRODUCTS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const SavedProvider = ({ children }) => {
  const [savedProducts, setSavedProducts] = useState(readSavedProducts);

  const toggleSaved = (productId) => {
    setSavedProducts((current) => {
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <SavedContext.Provider value={{ savedProducts, isSaved: (productId) => savedProducts.includes(productId), toggleSaved }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => useContext(SavedContext);
