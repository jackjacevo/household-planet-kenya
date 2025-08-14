'use client';

import { useState, useEffect } from 'react';

export default function PrivacyDashboard() {
  const [consents, setConsents] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    dataProcessing: false,
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
  });
  const [exportHistory, setExportHistory] = useState([]);

  useEffect(() => {
    fetchConsents();
    fetchExportHistory();
  }, []);

  const fetchConsents = async () => {
    try {
      const response = await fetch('/api/compliance/consents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setConsents(data);
    } catch (error) {
      console.error('Failed to fetch consents:', error);
    }
  };

  const fetchExportHistory = async () => {
    try {
      const response = await fetch('/api/compliance/export-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setExportHistory(data);
    } catch (error) {
      console.error('Failed to fetch export history:', error);
    }
  };

  const updatePrivacySetting = async (setting: string, value: boolean) => {
    try {
      await fetch('/api/compliance/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          consentType: setting,
          granted: value,
        }),
      });
      
      setPrivacySettings(prev => ({ ...prev, [setting]: value }));
      fetchConsents();
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/compliance/data-export', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      
      // Download the exported data
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      a.click();
      
      fetchExportHistory();
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Please provide a reason for account deletion (optional):');
    
    try {
      await fetch('/api/compliance/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });
      
      alert('Account deletion request submitted. Your account will be deleted in 30 days.');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Privacy Dashboard</h1>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-medium">Data Processing</h3>
              <p className="text-sm text-gray-600">Allow processing of personal data for service improvement</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.dataProcessing}
                onChange={(e) => updatePrivacySetting('dataProcessing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-medium">Marketing Communications</h3>
              <p className="text-sm text-gray-600">Receive promotional emails and offers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.marketing}
                onChange={(e) => updatePrivacySetting('marketing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-gray-600">Help us improve by sharing usage analytics</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.analytics}
                onChange={(e) => updatePrivacySetting('analytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Export</h2>
        <p className="text-gray-600 mb-4">
          Download all your personal data in JSON format. This includes your profile, orders, and preferences.
        </p>
        <button
          onClick={exportData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export My Data
        </button>
        
        {exportHistory.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Export History</h3>
            <div className="space-y-2">
              {exportHistory.map((export: any) => (
                <div key={export.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{export.fileName}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(export.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Consent History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Consent History</h2>
        <div className="space-y-2">
          {consents.map((consent: any) => (
            <div key={consent.id} className="flex justify-between items-center p-3 border-b">
              <div>
                <span className="font-medium">{consent.consentType}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  consent.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {consent.granted ? 'Granted' : 'Denied'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(consent.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Deletion */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-4">Delete Account</h2>
        <p className="text-red-700 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={deleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}