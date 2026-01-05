import React from 'react';

interface CRTContainerProps {
  children: React.ReactNode;
}

const CRTContainer: React.FC<CRTContainerProps> = ({ children }) => {
  return (
    <div className="crt-container">
      {children}
    </div>
  );
};

export default CRTContainer;
