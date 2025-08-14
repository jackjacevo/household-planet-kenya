'use client';

import { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';

interface Message {
  id: string;
  message: string;
  isFromCustomer: boolean;
  createdAt: string;
  user?: { name: string; role: string };
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [offlineForm, setOfflineForm] = useState({ name: '', email: '', message: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const visitorId = localStorage.getItem('visitorId') || generateVisitorId();
      localStorage.setItem('visitorId', visitorId);

      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          userAgent: navigator.userAgent,
        }),
      });

      const session = await response.json();
      setSessionId(session.id);
      loadChatHistory(session.id);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setIsOnline(false);
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${sessionId}`);
      const history = await response.json();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          isFromCustomer: true,
        }),
      });

      const result = await response.json();
      
      setMessages(prev => [...prev, result.message]);
      
      if (result.autoResponse) {
        setTimeout(() => {
          setMessages(prev => [...prev, result.autoResponse]);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const sendOfflineMessage = async () => {
    try {
      await fetch('/api/chat/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offlineForm),
      });

      setShowOfflineForm(false);
      setOfflineForm({ name: '', email: '', message: '' });
      alert('Message sent! We\'ll get back to you soon.');
    } catch (error) {
      console.error('Failed to send offline message:', error);
    }
  };

  const generateVisitorId = () => {
    return 'visitor_' + Math.random().toString(36).substr(2, 9);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
        title="Chat with us"
      >
        <FaComments className="text-xl" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-80 h-96 bg-white rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <FaComments className="mr-2" />
          <div>
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-xs opacity-90">
              {isOnline ? 'We\'re online!' : 'Leave a message'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      {isOnline && !showOfflineForm ? (
        <>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <FaUser className="mx-auto mb-2 text-2xl" />
                <p>Hello! How can we help you today?</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isFromCustomer ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isFromCustomer
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.isFromCustomer ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                    {message.user && ` • ${message.user.name}`}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
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
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Offline Form */
        <div className="flex-1 p-4">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-gray-800">We're currently offline</h4>
            <p className="text-sm text-gray-600">Leave us a message and we'll get back to you!</p>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={offlineForm.name}
              onChange={(e) => setOfflineForm({...offlineForm, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Your email"
              value={offlineForm.email}
              onChange={(e) => setOfflineForm({...offlineForm, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Your message"
              value={offlineForm.message}
              onChange={(e) => setOfflineForm({...offlineForm, message: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendOfflineMessage}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}