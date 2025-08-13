'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';

interface FAQ {
  id: string;
  data: string;
}

interface FAQData {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState<FAQData>({
    question: '',
    answer: '',
    category: 'General',
    sortOrder: 0,
    isActive: true
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/content/faqs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFaqs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setLoading(false);
    }
  };

  const createFAQ = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/admin/content/faqs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFAQ)
      });
      
      setNewFAQ({
        question: '',
        answer: '',
        category: 'General',
        sortOrder: 0,
        isActive: true
      });
      setShowNewForm(false);
      fetchFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
    }
  };

  const updateFAQ = async (id: string, data: FAQData) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/content/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      setEditingFAQ(null);
      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/content/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const parseFAQData = (dataString: string): FAQData => {
    try {
      return JSON.parse(dataString);
    } catch {
      return {
        question: '',
        answer: '',
        category: 'General',
        sortOrder: 0,
        isActive: true
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
              <p className="text-gray-600">Manage frequently asked questions</p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add FAQ</span>
            </button>
          </div>
        </div>

        {/* New FAQ Form */}
        {showNewForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New FAQ</h2>
              <button
                onClick={() => setShowNewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <input
                  type="text"
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ({...newFAQ, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the question"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                <textarea
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ({...newFAQ, answer: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the answer"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ({...newFAQ, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Orders">Orders</option>
                    <option value="Payment">Payment</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Returns">Returns</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={newFAQ.sortOrder}
                    onChange={(e) => setNewFAQ({...newFAQ, sortOrder: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newFAQ.isActive.toString()}
                    onChange={(e) => setNewFAQ({...newFAQ, isActive: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createFAQ}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <FiSave className="h-4 w-4" />
                  <span>Save FAQ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQs List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const faqData = parseFAQData(faq.data);
            const isEditing = editingFAQ === faq.id;
            
            return (
              <div key={faq.id} className="bg-white rounded-lg shadow">
                {isEditing ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                        <input
                          type="text"
                          defaultValue={faqData.question}
                          onChange={(e) => faqData.question = e.target.value}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                        <textarea
                          defaultValue={faqData.answer}
                          onChange={(e) => faqData.answer = e.target.value}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                          defaultValue={faqData.category}
                          onChange={(e) => faqData.category = e.target.value}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="General">General</option>
                          <option value="Orders">Orders</option>
                          <option value="Payment">Payment</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Returns">Returns</option>
                        </select>
                        
                        <input
                          type="number"
                          defaultValue={faqData.sortOrder}
                          onChange={(e) => faqData.sortOrder = parseInt(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        
                        <select
                          defaultValue={faqData.isActive.toString()}
                          onChange={(e) => faqData.isActive = e.target.value === 'true'}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => setEditingFAQ(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateFAQ(faq.id, faqData)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{faqData.question}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            faqData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {faqData.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {faqData.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{faqData.answer}</p>
                        <p className="text-sm text-gray-500">Sort Order: {faqData.sortOrder}</p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingFAQ(faq.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFAQ(faq.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {faqs.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiHelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first FAQ</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First FAQ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}