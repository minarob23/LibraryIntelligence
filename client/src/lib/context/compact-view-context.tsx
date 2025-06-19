
import React, { createContext, useState, useContext, useEffect } from 'react';

interface CompactViewContextType {
  isCompactView: boolean;
  setIsCompactView: (value: boolean) => void;
}

const CompactViewContext = createContext<CompactViewContextType | undefined>(undefined);

export function CompactViewProvider({ children }: { children: React.ReactNode }) {
  const [isCompactView, setIsCompactView] = useState(() => {
    return localStorage.getItem('isCompactView') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isCompactView', isCompactView.toString());
  }, [isCompactView]);

  return (
    <CompactViewContext.Provider value={{ isCompactView, setIsCompactView }}>
      {children}
    </CompactViewContext.Provider>
  );
}

export function useCompactView() {
  const context = useContext(CompactViewContext);
  if (context === undefined) {
    throw new Error('useCompactView must be used within a CompactViewProvider');
  }
  return context;
}
