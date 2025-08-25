'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Phone, Bell, Smartphone } from 'lucide-react';

interface Communication {
  id: number;
  type: 'EMAIL' | 'SMS' | 'PUSH_NOTIFICATION' | 'IN_APP' | 'PHONE_CALL';
  subject?: string;
  message: string;
  channel: string;
  status: string;
  sentAt: string;
  sentBy?: string;
}

export default function CommunicationHistory() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCommunications();
  }, [page]);

  const fetchCommunications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/communications?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommunications(data);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Communication['type']) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'SMS':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'PHONE_CALL':
        return <Phone className="w-5 h-5 text-purple-500" />;
      case 'PUSH_NOTIFICATION':
        return <Bell className="w-5 h-5 text-orange-500" />;
      case 'IN_APP':
        return <Smartphone className="w-5 h-5 text-indigo-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: Communication['type']) => {
    switch (type) {
      case 'EMAIL':
        return 'Email';
      case 'SMS':
        return 'SMS';
      case 'PHONE_CALL':
        return 'Phone Call';
      case 'PUSH_NOTIFICATION':
        return 'Push Notification';
      case 'IN_APP':
        return 'In-App Message';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Communication History</h2>
        <p className="text-sm text-gray-500">All communications between you and our team</p>
      </div>

      <div className="divide-y divide-gray-200">
        {communications.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No communications yet</p>
          </div>
        ) : (
          communications.map((communication) => (
            <div key={communication.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getIcon(communication.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getTypeLabel(communication.type)}
                      </span>
                      <span className="text-xs text-gray-500">via {communication.channel}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        communication.status === 'SENT' 
                          ? 'bg-green-100 text-green-800'
                          : communication.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {communication.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(communication.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {communication.subject && (
                    <h3 className="text-sm font-medium text-gray-900 mt-1">
                      {communication.subject}
                    </h3>
                  )}
                  
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {communication.message}
                  </p>
                  
                  {communication.sentBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Sent by: {communication.sentBy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {communications.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={communications.length < 20}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}