
import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleIcon?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '', titleIcon }) => {
  return (
    <div className={`bg-[#17352b] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55] flex flex-col ${className}`}>
      <div className="flex items-center mb-4">
        {titleIcon && <span className="mr-2 text-[#8ecdb7]">{titleIcon}</span>}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
