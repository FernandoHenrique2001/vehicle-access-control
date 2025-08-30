
import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  actions?: ReactNode; // Slot for buttons or other actions
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actions }) => {
  return (
    <div className="mb-6 pb-4 border-b border-gray-300 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
