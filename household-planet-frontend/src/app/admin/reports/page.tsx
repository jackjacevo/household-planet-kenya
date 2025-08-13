'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiPackage, FiDollarSign } from 'react-icons/fi';

export default function AdminReports() {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [activeReport, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:3001/api/admin/reports/${activeReport}`;
      
      if (activeReport === 'sales' || activeReport === 'financial') {
        url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const reports = [
    { id: 'sales', name: 'Sales Report', icon: FiTrendingUp, color: 'bg-green-500' },
    { id: 'customers', name: 'Customer Report', icon: FiUsers, color: 'bg-blue-500' },
    { id: 'inventory', name: 'Inventory Report', icon: FiPackage, color: 'bg-purple-500' },
    { id: 'financial', name: 'Financial Report', icon: FiDollarSign, color: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive business reports and insights</p>
            </div>
            <button
              onClick={exportReport}
              disabled={!reportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
            >
              <FiDownload className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activeReport === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${report.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{report.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Selector */}
        {(activeReport === 'sales' || activeReport === 'financial') && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="flex items-center space-x-4">
              <FiCalendar className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Date Range:</span>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Report Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Generating report...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Sales Report */}
            {activeReport === 'sales' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">
                      KSh {reportData.summary._sum.total?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold text-blue-600">{reportData.summary._count || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Order</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      KSh {reportData.summary._avg.total?.toFixed(2) || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                  <div className="space-y-2">
                    {reportData.topProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-900">Product ID: {product.productId}</span>
                        <div className="text-right">
                          <span className="font-medium">KSh {product._sum.total.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 ml-2">({product._sum.quantity} sold)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Report */}
            {activeReport === 'customers' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Customers</h3>
                    <p className="text-3xl font-bold text-blue-600">{reportData.customerStats.total}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Customers</h3>
                    <p className="text-3xl font-bold text-green-600">{reportData.customerStats.active}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">New (30 days)</h3>
                    <p className="text-3xl font-bold text-purple-600">{reportData.customerStats.new30Days}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
                  <div className="space-y-3">
                    {reportData.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({customer._count.orders} orders)</span>
                        </div>
                        <span className="font-bold text-green-600">
                          KSh {customer.totalSpent.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Report */}
            {activeReport === 'inventory' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Stock</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {reportData.stockLevels._sum.stock?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500">{reportData.stockLevels._count} products</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Stock Items</h3>
                    <p className="text-3xl font-bold text-red-600">{reportData.lowStock.length}</p>
                    <p className="text-sm text-gray-500">Need attention</p>
                  </div>
                </div>

                {reportData.lowStock.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
                    <div className="space-y-2">
                      {reportData.lowStock.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-900">{item.name}</span>
                          <span className="text-red-600 font-medium">
                            {item.stock} / {item.lowStockThreshold}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Financial Report */}
            {activeReport === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">
                      KSh {reportData.profit.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses</h3>
                    <p className="text-3xl font-bold text-red-600">
                      KSh {reportData.profit.expenses.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Profit</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      KSh {reportData.profit.profit.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{reportData.profit.margin.toFixed(1)}% margin</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-2">
                    {reportData.paymentMethods.map((method, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-900">{method.paymentMethod}</span>
                        <div className="text-right">
                          <span className="font-medium">KSh {method._sum.amount.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 ml-2">({method._count} transactions)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Select a report type to view data</p>
          </div>
        )}
      </div>
    </div>
  );
}