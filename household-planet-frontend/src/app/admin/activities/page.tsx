'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, User, Filter } from 'lucide-react';
import axios from 'axios';

interface AdminActivity {
  id: number;
  action: string;
  details: any;
  entityType?: string;
  entityId?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

interface ActivityStats {
  totalActivities: number;
  activitiesLast24h: number;
  activitiesLast7d: number;
  activitiesLast30d: number;
  topActions: Array<{ action: string; count: number }>;
  activeUsers: Array<{ user: any; activityCount: number }>;
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchActivities();
  }, [pagination.page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Handle different response structures
      const responseData = (response as any).data;
      if (responseData.data && Array.isArray(responseData.data)) {
        setActivities(responseData.data);
        setPagination(prev => ({ ...prev, ...(responseData.meta || {}) }));
      } else if (Array.isArray(responseData)) {
        setActivities(responseData);
        setPagination(prev => ({ ...prev, total: responseData.length, totalPages: 1 }));
      } else {
        console.warn('Unexpected activities API response structure:', responseData);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities/stats`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStats((response as any).data);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      setStats({
        totalActivities: 0,
        activitiesLast24h: 0,
        activitiesLast7d: 0,
        activitiesLast30d: 0,
        topActions: [],
        activeUsers: []
      });
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDetails = (details: any) => {
    if (!details) return 'N/A';
    if (typeof details === 'string') {
      try {
        const parsed = JSON.parse(details);
        return formatDetailsObject(parsed);
      } catch {
        return details;
      }
    }
    return formatDetailsObject(details);
  };

  const formatDetailsObject = (obj: any) => {
    if (typeof obj === 'string') return obj;
    if (typeof obj !== 'object') return String(obj);
    
    let formatted = '';
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'changes' && typeof value === 'string') {
        formatted += `${key}: ${(value as string).split(', ').join(', ')}\n`;
      } else {
        formatted += `${key}: ${value}\n`;
      }
    }
    return formatted.trim();
  };

  const getDetailsPreview = (details: any) => {
    const formatted = formatDetails(details);
    if (formatted === 'N/A') return formatted;
    return formatted.length > 100 ? formatted.substring(0, 100) + '...' : formatted;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Activity Log</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last 24h</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activitiesLast24h}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activitiesLast7d}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <User className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Activities Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP & User Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{activity.user?.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{activity.user?.role || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.entityType ? (
                      <div>
                        <p>{activity.entityType}</p>
                        {activity.entityId && <p className="text-gray-400">ID: {activity.entityId}</p>}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="group relative">
                      <div className="truncate cursor-help" title="Click to view full details">
                        {getDetailsPreview(activity.details)}
                      </div>
                      {formatDetails(activity.details) !== 'N/A' && (
                        <div className="absolute left-0 top-full mt-2 w-96 max-w-screen-sm bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg border border-gray-700">
                          <div className="mb-2 text-gray-300 font-semibold">Activity Details:</div>
                          <div className="text-gray-100 max-h-64 overflow-y-auto space-y-1">
                            {formatDetails(activity.details).split('\n').map((line, idx) => {
                              const [key, ...valueParts] = line.split(': ');
                              const value = valueParts.join(': ');
                              return (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-blue-300 font-medium">{key}:</span>
                                  <span className="text-gray-100 ml-2 break-words">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          IP
                        </span>
                        <span className="font-mono text-xs">{activity.ipAddress && activity.ipAddress !== 'null' ? activity.ipAddress : 'N/A'}</span>
                      </div>
                      {activity.userAgent && (
                        <div className="group relative">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              UA
                            </span>
                            <span className="text-xs text-gray-400 truncate max-w-24 cursor-help">
                              {activity.userAgent.length > 20 ? activity.userAgent.substring(0, 20) + '...' : activity.userAgent}
                            </span>
                          </div>
                          <div className="absolute left-0 top-full mt-1 w-80 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg border border-gray-700">
                            <div className="mb-1 text-gray-300 font-semibold">User Agent:</div>
                            <div className="text-gray-100 break-words">{activity.userAgent}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Activity className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
                    <p className="text-gray-500">Admin activities will appear here once actions are performed.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Top Actions */}
      {stats && stats.topActions && stats.topActions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Most Common Actions</h2>
          <div className="space-y-3">
            {stats.topActions.map((actionStat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{actionStat.action}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${stats.topActions[0]?.count ? (actionStat.count / stats.topActions[0].count) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{actionStat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
