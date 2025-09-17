'use client';

import { useState, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  CloudArrowDownIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface ImportJob {
  id: string;
  filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  errors?: any[];
  createdAt: string;
  completedAt?: string;
}

export default function BulkProductManager() {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/products/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Start polling for job status
      pollJobStatus(response.data.jobId);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await api.get(`/products/import/status/${jobId}`);
        const job = response.data;
        
        setImportJobs(prev => {
          const existing = prev.find(j => j.id === jobId);
          if (existing) {
            return prev.map(j => j.id === jobId ? job : j);
          } else {
            return [job, ...prev];
          }
        });

        if (job.status === 'PROCESSING' || job.status === 'PENDING') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    };

    poll();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/products/export/csv', {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export products');
    } finally {
      setExporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getStatusIcon = (status: ImportJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'PROCESSING':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: ImportJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-100';
      case 'FAILED':
        return 'text-red-700 bg-red-100';
      case 'PROCESSING':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-yellow-700 bg-yellow-100';
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,slug,sku,price,description,categoryId,brandId,tags,images
"Sample Product","sample-product","SKU001",1500,"Product description",1,1,"tag1,tag2","[]"
"Another Product","another-product","SKU002",2500,"Another description",2,2,"tag3,tag4","[]"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product-import-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Product Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Download Template</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <CloudArrowDownIcon className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export Products'}</span>
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div
          className={`text-center ${dragOver ? 'border-blue-500 bg-blue-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">Import Products</h3>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your CSV file here, or click to browse
            </p>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Supported format: CSV</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Import Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Download the template to see the required format</li>
          <li>• Ensure all required fields are filled: name, slug, sku, price, categoryId</li>
          <li>• Use existing category and brand IDs</li>
          <li>• Images should be JSON array format: ["image1.jpg", "image2.jpg"]</li>
          <li>• Tags should be comma-separated: "tag1,tag2,tag3"</li>
        </ul>
      </div>

      {/* Import Jobs */}
      {importJobs.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Import History</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {importJobs.map((job) => (
              <div key={job.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{job.filename}</h4>
                      <p className="text-sm text-gray-600">
                        Started {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                {/* Progress */}
                {job.status === 'PROCESSING' && job.totalRows > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{job.processedRows} / {job.totalRows}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(job.processedRows / job.totalRows) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Results */}
                {job.status === 'COMPLETED' && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="font-semibold text-green-700">{job.successRows}</div>
                      <div className="text-green-600">Successful</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="font-semibold text-red-700">{job.errorRows}</div>
                      <div className="text-red-600">Errors</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-700">{job.totalRows}</div>
                      <div className="text-gray-600">Total</div>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {job.errors && job.errors.length > 0 && (
                  <div className="mt-3">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-red-700 hover:text-red-800">
                        View Errors ({job.errors.length})
                      </summary>
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        <pre className="text-xs bg-red-50 p-3 rounded border text-red-800">
                          {JSON.stringify(job.errors, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
