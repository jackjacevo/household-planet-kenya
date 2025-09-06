'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import axios from 'axios'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters')
      return
    }
    
    setPasswordLoading(true)
    setPasswordMessage('')
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      setPasswordMessage('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (error: any) {
      setPasswordMessage(error.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={logout}
              className="px-3 py-2 sm:px-4 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors self-start sm:self-auto"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Name</p>
                  <p className="font-medium text-sm sm:text-base break-words">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Email</p>
                  <p className="font-medium text-sm sm:text-base break-words">{user.email}</p>
                  {user.emailVerified ? (
                    <span className="text-xs text-green-600">Verified</span>
                  ) : (
                    <span className="text-xs text-red-600">Not verified</span>
                  )}
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-sm sm:text-base">{user.phone}</p>
                    {user.phoneVerified ? (
                      <span className="text-xs text-green-600">Verified</span>
                    ) : (
                      <span className="text-xs text-red-600">Not verified</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Role</p>
                  <p className="font-medium text-sm sm:text-base capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Account Status</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span>Email Verified:</span>
                    <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Phone Verified:</span>
                    <span className={user.phoneVerified ? 'text-green-600' : 'text-red-600'}>
                      {user.phoneVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change'}
                  </Button>
                </div>
                
                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {passwordMessage && (
                      <div className={`text-sm p-2 rounded ${passwordMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {passwordMessage}
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full"
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}