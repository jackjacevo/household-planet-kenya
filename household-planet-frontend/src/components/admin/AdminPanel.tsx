import React from 'react';

const AdminPanel: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <p className="text-gray-600">Manage your products</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-gray-600">View and manage orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Customers</h3>
          <p className="text-gray-600">Manage customer accounts</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
