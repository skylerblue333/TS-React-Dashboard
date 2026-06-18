import React from 'react';
import { createRoot } from 'react-dom/client';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
        <p className="text-gray-600">Real-time metrics and analytics</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">24,592</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Revenue (YTD)</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">$1.2M</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">System Uptime</h2>
          <p className="text-4xl font-bold text-purple-600 mt-2">99.99%</p>
        </div>
      </div>
    </div>
  );
};

console.log("Dashboard component ready for rendering.");
export default Dashboard;