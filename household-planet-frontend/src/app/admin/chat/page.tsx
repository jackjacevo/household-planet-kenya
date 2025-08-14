'use client';

import { useState, useEffect } from 'react';
import { FaComments, FaUser, FaCheck, FaTimes } from 'react-icons/fa';

interface ChatSession {
  id: string;
  visitorId: string;
  status: string;
  lastActivityAt: string;
  messages: Array<{
    id: string;
    message: string;
    isFromCustomer: boolean;
    createdAt: string;
  }>;
  _count: { messages: number };
}

export default function ChatAdminPage() {
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatData();
    const interval = setInterval(loadChatData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadChatData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/sessions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setActiveSessions(await response.json());
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load chat data:', error);
      setLoading(false);
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${sessionId}`);
      if (response.ok) {
        setChatHistory(await response.json());
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('/api/chat/staff/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: selectedSession,
          message: newMessage,
        }),
      });

      setNewMessage('');
      loadChatHistory(selectedSession);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const assignSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/sessions/${sessionId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadChatData();
    } catch (error) {
      console.error('Failed to assign session:', error);
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/sessions/${sessionId}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadChatData();
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Failed to close session:', error);
    }
  };

  const selectSession = (sessionId: string) => {
    setSelectedSession(sessionId);
    loadChatHistory(sessionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaComments className="text-6xl text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading chat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FaComments className="text-3xl text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Live Chat Dashboard</h1>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {activeSessions.length} Active Chats
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Active Sessions</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => selectSession(session.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedSession === session.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-sm">Visitor {session.visitorId.slice(-6)}</p>
                          <p className="text-xs text-gray-500">
                            {session._count.messages} messages
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            assignSession(session.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeSession(session.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                    {session.messages[0] && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {session.messages[0].message}
                      </p>
                    )}
                  </div>
                ))}
                {activeSessions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <FaComments className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>No active chat sessions</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow h-96 flex flex-col">
              {selectedSession ? (
                <>
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Chat Session</h3>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.isFromCustomer
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.isFromCustomer ? 'text-gray-500' : 'text-blue-200'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                            {message.user && ` • ${message.user.name}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FaComments className="text-6xl mx-auto mb-4 opacity-50" />
                    <p>Select a chat session to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}