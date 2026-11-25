import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EnquiryContextType {
  isOpen: boolean;
  initialService: string;
  openEnquiry: (service?: string) => void;
  closeEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

export const EnquiryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialService, setInitialService] = useState('Residential Full Home');

  const openEnquiry = (service?: string) => {
    if (service) {
      setInitialService(service);
    }
    setIsOpen(true);
  };

  const closeEnquiry = () => {
    setIsOpen(false);
  };

  return (
    <EnquiryContext.Provider value={{ isOpen, initialService, openEnquiry, closeEnquiry }}>
      {children}
    </EnquiryContext.Provider>
  );
};

export const useEnquiry = (): EnquiryContextType => {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiry must be used within an EnquiryProvider');
  }
  return context;
};
