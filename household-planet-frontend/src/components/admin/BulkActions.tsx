'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Upload, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface BulkActionsProps {
  selectedProducts: number[];
  onBulkUpdate: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({ selectedProducts, onBulkUpdate, onClearSelection }: BulkActionsProps) {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkData, setBulkData] = useState({
    categoryId: '',
    brandId: '',
    isActive: '',
    isFeatured: '',
    tags: ''
  });

  const handleBulkUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const updateData: any = { productIds: selectedProducts };
      
      if (bulkData.categoryId) updateData.categoryId = parseInt(bulkData.categoryId);
      if (bulkData.brandId) updateData.brandId = parseInt(bulkData.brandId);
      if (bulkData.isActive !== '') updateData.isActive = bulkData.isActive === 'true';
      if (bulkData.isFeatured !== '') updateData.isFeatured = bulkData.isFeatured === 'true';
      if (bulkData.tags) updateData.tags = bulkData.tags;

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/bulk`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onBulkUpdate();
      setShowBulkEdit(false);
      onClearSelection();
    } catch (error) {
      console.error('Error updating products:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = format === 'excel' ? 'export/excel' : 'export/csv';
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (format === 'excel') {
        downloadExcel(response.data, 'products.xlsx');
      } else {
        const csvContent = convertToCSV(response.data);
        downloadCSV(csvContent, 'products.csv');
      }
    } catch (error) {
      console.error('Error exporting products:', error);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const endpoint = isExcel ? 'import/excel' : 'import/csv';

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      onBulkUpdate();
    } catch (error) {
      console.error('Error importing products:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadExcel = (data: any[], filename: string) => {
    // Convert to CSV format for now - can be enhanced with proper Excel library
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedProducts.length === 0) {
    return (
      <div className="flex gap-2">
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('excel')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
        <div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
            className="hidden"
            id="file-import"
          />
          <label htmlFor="file-import">
            <Button as="span" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import File
            </Button>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-700">
          {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkEdit(!showBulkEdit)} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>
          <Button onClick={onClearSelection} variant="outline" size="sm">
            Clear Selection
          </Button>
        </div>
      </div>

      {showBulkEdit && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={bulkData.isActive}
              onChange={(e) => setBulkData(prev => ({ ...prev, isActive: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">No change</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Featured</label>
            <select
              value={bulkData.isFeatured}
              onChange={(e) => setBulkData(prev => ({ ...prev, isFeatured: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">No change</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category ID</label>
            <input
              type="number"
              value={bulkData.categoryId}
              onChange={(e) => setBulkData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="Category ID"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Brand ID</label>
            <input
              type="number"
              value={bulkData.brandId}
              onChange={(e) => setBulkData(prev => ({ ...prev, brandId: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="Brand ID"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleBulkUpdate} size="sm" className="w-full">
              Apply Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}