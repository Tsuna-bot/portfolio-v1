import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface TransitionContextType {
  navigateWithTransition: (to: string) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(
  undefined
);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }
  return context;
};

interface TransitionProviderProps {
  children: ReactNode;
  navigateWithTransition: (to: string) => void;
}

export const TransitionProvider: React.FC<TransitionProviderProps> = ({
  children,
  navigateWithTransition,
}) => {
  return (
    <TransitionContext.Provider value={{ navigateWithTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};
