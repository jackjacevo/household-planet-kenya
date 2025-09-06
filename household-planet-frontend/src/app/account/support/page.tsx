'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Phone, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const COMPANY_WHATSAPP = '+254790227760';
const WHATSAPP_BUSINESS_HOURS = 'Monday - Friday: 8:00 AM - 6:00 PM EAT';

export default function SupportPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateWhatsAppMessage = (issue: string) => {
    const customerInfo = `Customer: ${user?.name || 'N/A'}\nEmail: ${user?.email || 'N/A'}\nPhone: ${user?.phone || 'N/A'}`;
    const message = `Hello Household Planet Kenya Support Team,\n\nI need assistance with: ${issue}\n\n${customerInfo}\n\nThank you!`;
    return encodeURIComponent(message);
  };

  const openWhatsApp = (issue: string) => {
    const message = generateWhatsAppMessage(issue);
    const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const commonIssues = [
    'Order Status Inquiry',
    'Payment Issues',
    'Product Information',
    'Delivery Problems',
    'Return/Refund Request',
    'Account Issues',
    'Technical Support',
    'General Inquiry'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Support</h1>
          <p className="text-gray-600">Get instant help through WhatsApp - our preferred support channel</p>
        </div>

        {/* Contact Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">WhatsApp Support</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(COMPANY_WHATSAPP)}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Number'}
            </Button>
          </div>
          
          <div className="text-2xl font-bold text-green-800 mb-2">{COMPANY_WHATSAPP}</div>
          
          <div className="flex items-center text-sm text-green-700">
            <Clock className="h-4 w-4 mr-2" />
            <span>{WHATSAPP_BUSINESS_HOURS}</span>
          </div>
        </div>

        {/* Quick Issue Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">What do you need help with?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonIssues.map((issue) => (
              <button
                key={issue}
                onClick={() => {
                  setSelectedIssue(issue);
                  openWhatsApp(issue);
                }}
                className={`p-4 text-left border rounded-lg transition-colors hover:bg-green-50 hover:border-green-300 ${
                  selectedIssue === issue ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{issue}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Direct WhatsApp Button */}
        <div className="text-center">
          <Button
            onClick={() => openWhatsApp('General Inquiry')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Start WhatsApp Chat
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Click to open WhatsApp with your customer information pre-filled
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Instant Response</h3>
            <p className="text-sm text-gray-600">Get real-time support during business hours</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Personal Touch</h3>
            <p className="text-sm text-gray-600">Direct communication with our support team</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Easy & Familiar</h3>
            <p className="text-sm text-gray-600">Use the app you already know and love</p>
          </div>
        </div>
      </div>
    </div>
  );
}