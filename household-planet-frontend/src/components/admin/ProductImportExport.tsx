'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export function ProductImportExport() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);
      
      const result = await api.importProductsCsv(file);
      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({ error: 'Import failed. Please check your file format.' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await api.exportProductsCsv();
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,slug,description,sku,price,comparePrice,categoryId,brandId,images,tags
"Product Name","product-slug","Product description here","SKU001",2500,3000,1,1,"image1.jpg,image2.jpg","tag1,tag2"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <FileText className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Product Import/Export</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Products</h3>
          
          <div className="space-y-4">
            <div>
              <Button
                onClick={downloadTemplate}
                variant="outline"
                size="sm"
                className="mb-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Select CSV File
                  </>
                )}
              </Button>
            </div>

            {importResult && (
              <div className={`p-3 rounded-lg ${
                importResult.error 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center">
                  {importResult.error ? (
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  )}
                  <div>
                    {importResult.error ? (
                      <p className="text-red-800 font-medium">{importResult.error}</p>
                    ) : (
                      <>
                        <p className="text-green-800 font-medium">
                          Import successful!
                        </p>
                        <p className="text-green-700 text-sm">
                          {importResult.count} products imported
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">CSV Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Include headers: name, slug, description, sku, price, categoryId</li>
                <li>Images should be comma-separated URLs</li>
                <li>Tags should be comma-separated values</li>
                <li>CategoryId and BrandId must be valid IDs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Products</h3>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Export all products to a CSV file for backup or external processing.
            </p>
            
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Products
                </>
              )}
            </Button>

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Export includes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>All product information</li>
                <li>Category and brand details</li>
                <li>Pricing and stock data</li>
                <li>SEO and metadata</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
