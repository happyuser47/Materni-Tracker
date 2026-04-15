import React from 'react';

export const Badge = ({ children, type }) => {
  const styles = {
    High: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-red-100 text-red-800 border-red-200',
    Alert: 'bg-orange-100 text-orange-800 border-orange-200',
    Urgent: 'bg-red-100 text-red-800 border-red-200',
    Delivery: 'bg-blue-100 text-blue-800 border-blue-200',
    Success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Closed: 'bg-slate-100 text-slate-700 border-slate-300',
    Admin: 'bg-teal-100 text-teal-800 border-teal-200',
    Staff: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Default: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${styles[type] || styles.Default}`}>
      {children}
    </span>
  );
};