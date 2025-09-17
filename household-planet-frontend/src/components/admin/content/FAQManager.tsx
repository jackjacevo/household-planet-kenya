'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
  isPublished: boolean;
  sortOrder: number;
}

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    isPublished: true,
    sortOrder: 0
  });

  const categories = [
    'General',
    'Shipping',
    'Payment',
    'Returns',
    'Products',
    'Account'
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/content/admin/faqs');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingFaq 
        ? `/api/content/faqs/${editingFaq.id}`
        : '/api/content/faqs';
      
      const method = editingFaq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchFaqs();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await fetch(`/api/content/faqs/${id}`, { method: 'DELETE' });
      await fetchFaqs();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      isPublished: true,
      sortOrder: 0
    });
    setEditingFaq(null);
    setShowForm(false);
  };

  const editFaq = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      isPublished: faq.isPublished,
      sortOrder: faq.sortOrder
    });
    setEditingFaq(faq);
    setShowForm(true);
  };

  const toggleExpanded = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">FAQ Management</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                />
                <Label htmlFor="isPublished">Published</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingFaq ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="flex items-center gap-2 text-left font-semibold hover:text-blue-600"
                    >
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {faq.question}
                    </button>
                    <span className={`px-2 py-1 rounded text-xs ${
                      faq.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {faq.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {faq.category && (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {faq.category}
                      </span>
                    )}
                  </div>
                  
                  {expandedFaq === faq.id && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editFaq(faq)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(faq.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
