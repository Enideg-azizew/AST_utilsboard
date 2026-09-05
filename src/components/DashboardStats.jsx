import React from 'react';

const DashboardStats = ({ stats }) => {
  const { S = 0, I = 0, R = 0, total = 0 } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Tests</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>

      <div className="card flex items-center justify-between border-l-4 border-green-500">
        <div>
          <p className="text-sm text-gray-500 font-medium">Susceptible (S)</p>
          <p className="text-2xl font-bold text-green-600">{S}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="card flex items-center justify-between border-l-4 border-yellow-500">
        <div>
          <p className="text-sm text-gray-500 font-medium">Intermediate (I)</p>
          <p className="text-2xl font-bold text-yellow-600">{I}</p>
        </div>
        <div className="bg-yellow-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="card flex items-center justify-between border-l-4 border-red-500">
        <div>
          <p className="text-sm text-gray-500 font-medium">Resistant (R)</p>
          <p className="text-2xl font-bold text-red-600">{R}</p>
        </div>
        <div className="bg-red-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
