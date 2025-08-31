'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Activity, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  _count: {
    orders: number;
    activities: number;
  };
}

const AVAILABLE_PERMISSIONS = [
  'manage_products',
  'manage_orders', 
  'manage_customers',
  'view_analytics',
  'manage_content',
  'manage_payments'
];

export default function AdminManagementPage() {
  const { user, isAdmin } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'STAFF',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/staff`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Filter to only show ADMIN users
      setStaff(response.data.filter((member: Staff) => member.role === 'ADMIN'));
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateAdmin = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/staff`,
        { ...formData, role: 'ADMIN' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setShowCreateDialog(false);
      resetForm();
      fetchStaff();
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('A user with this email already exists');
      } else {
        setError('Failed to create admin');
      }
    }
  };

  const handleEditStaff = async () => {
    if (!editingStaff) return;
    
    // If password is being changed, show confirmation dialog
    if (formData.password && formData.password.trim() !== '') {
      setShowPasswordConfirm(true);
      return;
    }
    
    await updateStaff();
  };

  const updateStaff = async () => {
    if (!editingStaff) return;
    try {
      const token = localStorage.getItem('token');
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/staff/${editingStaff.id}`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setShowEditDialog(false);
      setShowPasswordConfirm(false);
      setEditingStaff(null);
      resetForm();
      setConfirmPassword('');
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/staff/${deletingStaff.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setShowDeleteDialog(false);
      setDeletingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const openDeleteDialog = (staff: Staff) => {
    // Prevent staff from deleting their own account
    if (!isAdmin() && user?.id === staff.id) {
      alert('You cannot delete your own staff account. Contact an administrator.');
      return;
    }
    setDeletingStaff(staff);
    setShowDeleteDialog(true);
  };

  const openEditDialog = (staff: Staff) => {
    // Prevent staff from editing their own details
    if (!isAdmin() && user?.id === staff.id) {
      alert('You cannot edit your own staff details. Contact an administrator.');
      return;
    }
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '',
      role: staff.role,
      permissions: staff.permissions || []
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      permissions: []
    });
    setShowPassword(false);
    setConfirmPassword('');
    setError('');
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        {isAdmin() && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-2xl font-bold text-gray-900">{staff.filter(s => s.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Logins</p>
              <p className="text-2xl font-bold text-gray-900">{staff.filter(s => s.lastLogin).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    ADMIN
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {(member.permissions || []).slice(0, 2).map(permission => (
                      <span key={permission} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                    {(member.permissions || []).length > 2 && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        +{(member.permissions || []).length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>{member._count?.orders || 0} orders</div>
                    <div className="text-gray-400">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditDialog(member)}
                      className={`${(isAdmin() || user?.id !== member.id) ? 'text-blue-600 hover:text-blue-900' : 'text-gray-400 cursor-not-allowed'}`}
                      disabled={!isAdmin() && user?.id === member.id}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(member)}
                      className={`${(isAdmin() || user?.id !== member.id) ? 'text-red-600 hover:text-red-900' : 'text-gray-400 cursor-not-allowed'}`}
                      disabled={!isAdmin() && user?.id === member.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Admin Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Admin</h3>
                <button
                  onClick={() => { setShowCreateDialog(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {AVAILABLE_PERMISSIONS.map(permission => (
                        <label key={permission} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={formData.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, permissions: [...prev.permissions, permission] }));
                              } else {
                                setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }));
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700 capitalize">{permission.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowCreateDialog(false); resetForm(); }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Edit Staff Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Admin</h3>
                <button
                  onClick={() => { setShowEditDialog(false); setEditingStaff(null); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Leave blank to keep current password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    value="ADMIN"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {AVAILABLE_PERMISSIONS.map(permission => (
                        <label key={permission} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={formData.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, permissions: [...prev.permissions, permission] }));
                              } else {
                                setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }));
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700 capitalize">{permission.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowEditDialog(false); setEditingStaff(null); resetForm(); }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditStaff}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Update Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Admin</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{deletingStaff.name}</strong>? 
                  This action cannot be undone and will permanently remove their admin access.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => { setShowDeleteDialog(false); setDeletingStaff(null); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStaff}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Confirmation Dialog */}
      {showPasswordConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Confirm Password Change</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                You are about to change the password for <strong>{editingStaff?.name}</strong>. 
                This will be their new login password. Please confirm to proceed.
              </p>
              
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>New Login Password:</strong> {showPassword ? formData.password : '•'.repeat(formData.password.length)}
                  </p>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm This Login Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-type the password above"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== formData.password && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === formData.password && (
                  <p className="text-green-500 text-sm mt-1">✓ Password confirmed - this will be the new login password</p>
                )}
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => { setShowPasswordConfirm(false); setConfirmPassword(''); }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateStaff}
                  disabled={confirmPassword !== formData.password || !confirmPassword}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}