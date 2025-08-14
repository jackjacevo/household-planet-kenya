'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaUsers, FaCampaign, FaChartLine, FaCog, FaPlay, FaPause, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';

interface WhatsAppStats {
  messages: {
    total: number;
    sent: number;
    failed: number;
    deliveryRate: number;
  };
  contacts: {
    total: number;
    optedIn: number;
    optedOut: number;
    optInRate: number;
  };
  campaigns: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  createdAt: string;
}

interface Contact {
  id: string;
  phoneNumber: string;
  name?: string;
  isOptedIn: boolean;
  lastMessageAt?: string;
  totalMessages: number;
}

export default function WhatsAppAdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [whatsappStatus, setWhatsappStatus] = useState<{
    isReady: boolean;
    qrCode?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Campaign creation state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    message: '',
    phoneNumbers: '',
    scheduledAt: '',
  });

  // Business hours state
  const [businessHours, setBusinessHours] = useState<any>(null);
  const [showBusinessHoursModal, setShowBusinessHoursModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load WhatsApp status
      const statusResponse = await fetch('/api/whatsapp/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statusResponse.ok) {
        setWhatsappStatus(await statusResponse.json());
      }

      // Load analytics
      const analyticsResponse = await fetch('/api/whatsapp/business/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (analyticsResponse.ok) {
        setStats(await analyticsResponse.json());
      }

      // Load contacts
      const contactsResponse = await fetch('/api/whatsapp/business/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (contactsResponse.ok) {
        setContacts(await contactsResponse.json());
      }

      // Load business hours
      const hoursResponse = await fetch('/api/whatsapp/business/hours', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (hoursResponse.ok) {
        setBusinessHours(await hoursResponse.json());
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const token = localStorage.getItem('token');
      const phoneNumbers = campaignForm.phoneNumbers
        .split('\n')
        .map(num => num.trim())
        .filter(num => num);

      const response = await fetch('/api/whatsapp/business/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...campaignForm,
          phoneNumbers,
          scheduledAt: campaignForm.scheduledAt || undefined,
        }),
      });

      if (response.ok) {
        setShowCampaignModal(false);
        setCampaignForm({ name: '', message: '', phoneNumbers: '', scheduledAt: '' });
        loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const saveBusinessHours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/business/hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(businessHours),
      });

      if (response.ok) {
        setShowBusinessHoursModal(false);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to save business hours:', error);
    }
  };

  const sendWelcomeMessage = async (contact: Contact) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/whatsapp/business/quick-actions/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: contact.phoneNumber,
          customerName: contact.name,
        }),
      });
      
      alert('Welcome message sent!');
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaWhatsapp className="text-6xl text-green-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading WhatsApp Business Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FaWhatsapp className="text-3xl text-green-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                whatsappStatus?.isReady 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {whatsappStatus?.isReady ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
              { id: 'campaigns', label: 'Campaigns', icon: FaCampaign },
              { id: 'contacts', label: 'Contacts', icon: FaUsers },
              { id: 'settings', label: 'Settings', icon: FaCog },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaWhatsapp className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold">{stats.messages.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaUsers className="text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Active Contacts</p>
                      <p className="text-2xl font-bold">{stats.contacts.optedIn.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaCampaign className="text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Campaigns</p>
                      <p className="text-2xl font-bold">{stats.campaigns}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaChartLine className="text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Delivery Rate</p>
                      <p className="text-2xl font-bold">{stats.messages.deliveryRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code for Connection */}
            {!whatsappStatus?.isReady && whatsappStatus?.qrCode && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Connect WhatsApp Business</h3>
                <div className="flex items-center space-x-6">
                  <img 
                    src={whatsappStatus.qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-48 h-48 border rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium mb-2">Scan QR Code</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Open WhatsApp on your phone</li>
                      <li>2. Go to Settings → Linked Devices</li>
                      <li>3. Tap "Link a Device"</li>
                      <li>4. Scan this QR code</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Campaigns</h2>
              <button
                onClick={() => setShowCampaignModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create Campaign
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.map(campaign => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{campaign.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'SENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{campaign.totalRecipients}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.totalRecipients > 0 
                          ? `${((campaign.successfulSends / campaign.totalRecipients) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <FaEdit />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Contacts</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FaDownload className="inline mr-2" />
                Export Contacts
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map(contact => (
                    <tr key={contact.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">{contact.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{contact.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          contact.isOptedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {contact.isOptedIn ? 'Opted In' : 'Opted Out'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{contact.totalMessages}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => sendWelcomeMessage(contact)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Send Welcome
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Settings</h2>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Business Hours</h3>
              <button
                onClick={() => setShowBusinessHoursModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Configure Business Hours
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Auto-Reply Messages</h3>
              <p className="text-gray-600 mb-4">Configure automatic responses for different scenarios.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Manage Auto-Replies
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Create Campaign</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Campaign Name"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                placeholder="Message"
                value={campaignForm.message}
                onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                className="w-full p-3 border rounded-lg h-24"
              />
              <textarea
                placeholder="Phone Numbers (one per line)"
                value={campaignForm.phoneNumbers}
                onChange={(e) => setCampaignForm({...campaignForm, phoneNumbers: e.target.value})}
                className="w-full p-3 border rounded-lg h-24"
              />
              <input
                type="datetime-local"
                value={campaignForm.scheduledAt}
                onChange={(e) => setCampaignForm({...campaignForm, scheduledAt: e.target.value})}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}