import React, { createContext, useState, useContext } from 'react';

const AppStateContext = createContext();

export const AppProvider = ({ children }) => {
  const [hasInitiated, setHasInitiatedState] = useState(() => {
    return sessionStorage.getItem('appInitiated') === 'true';
  });

  const setHasInitiated = (value) => {
    if (value) {
      sessionStorage.setItem('appInitiated', 'true');
    } else {
      sessionStorage.removeItem('appInitiated');
    }
    setHasInitiatedState(value);
  };

  return (
    <AppStateContext.Provider value={{ hasInitiated, setHasInitiated }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  return useContext(AppStateContext);
};
