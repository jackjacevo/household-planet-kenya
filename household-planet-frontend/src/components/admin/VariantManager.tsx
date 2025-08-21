'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, Hash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface Variant {
  id?: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

interface VariantManagerProps {
  productId?: number;
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

export default function VariantManager({ productId, variants, onVariantsChange }: VariantManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<Variant>({
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    attributes: {}
  });
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  useEffect(() => {
    if (editingVariant) {
      setFormData(editingVariant);
    } else {
      setFormData({
        name: '',
        sku: '',
        price: 0,
        stock: 0,
        attributes: {}
      });
    }
  }, [editingVariant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) {
      // For new products, just update local state
      if (editingVariant) {
        const updatedVariants = variants.map(v => 
          v.id === editingVariant.id ? formData : v
        );
        onVariantsChange(updatedVariants);
      } else {
        onVariantsChange([...variants, { ...formData, id: Date.now() }]);
      }
      resetForm();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (editingVariant && editingVariant.id) {
        // Update existing variant
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}/variants/${editingVariant.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const updatedVariants = variants.map(v => 
          v.id === editingVariant.id ? formData : v
        );
        onVariantsChange(updatedVariants);
      } else {
        // Create new variant
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}/variants`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        onVariantsChange([...variants, response.data]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const handleDelete = async (variant: Variant) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    if (!productId || !variant.id) {
      // For new products or local variants
      const updatedVariants = variants.filter(v => v.id !== variant.id);
      onVariantsChange(updatedVariants);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}/variants/${variant.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedVariants = variants.filter(v => v.id !== variant.id);
      onVariantsChange(updatedVariants);
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const addAttribute = () => {
    if (attributeKey && attributeValue) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeKey]: attributeValue
        }
      }));
      setAttributeKey('');
      setAttributeValue('');
    }
  };

  const removeAttribute = (key: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return { ...prev, attributes: newAttributes };
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingVariant(null);
    setFormData({
      name: '',
      sku: '',
      price: 0,
      stock: 0,
      attributes: {}
    });
  };

  const getTotalStock = () => {
    return variants.reduce((sum, variant) => sum + variant.stock, 0);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{variants.length}</div>
            <div className="text-sm text-gray-500">Variants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{getTotalStock()}</div>
            <div className="text-sm text-gray-500">Total Stock</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              KSh {variants.reduce((sum, v) => sum + v.price, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
        </div>
      </div>

      {/* Add Variant Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Variant Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-md font-semibold mb-4">
            {editingVariant ? 'Edit Variant' : 'Add New Variant'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Small, Red, 500ml"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Unique SKU"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (KSh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Attributes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attributes
              </label>
              
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={attributeKey}
                  onChange={(e) => setAttributeKey(e.target.value)}
                  placeholder="Attribute name (e.g., Color, Size)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={attributeValue}
                  onChange={(e) => setAttributeValue(e.target.value)}
                  placeholder="Value (e.g., Red, Large)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={addAttribute} size="sm">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.attributes).map(([key, value]) => (
                  <span
                    key={key}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {key}: {value}
                    <button
                      type="button"
                      onClick={() => removeAttribute(key)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingVariant ? 'Update Variant' : 'Add Variant'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Variants List */}
      {variants.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attributes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {variants.map((variant) => {
                  const stockStatus = getStockStatus(variant.stock);
                  return (
                    <tr key={variant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {variant.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {variant.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        KSh {variant.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {variant.stock} - {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(variant.attributes).map(([key, value]) => (
                            <span
                              key={key}
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingVariant(variant);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(variant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {variants.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No variants added yet. Click "Add Variant" to get started.</p>
        </div>
      )}
    </div>
  );
}