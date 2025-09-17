'use client';

import { useState } from 'react';
import { Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface QuickStockAdjustmentProps {
  productId: number;
  currentStock: number;
  onStockUpdate: (newStock: number) => void;
  className?: string;
}

export default function QuickStockAdjustment({
  productId,
  currentStock,
  onStockUpdate,
  className = ''
}: QuickStockAdjustmentProps) {
  const [adjustment, setAdjustment] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleQuickAdjustment = async (amount: number) => {
    const newStock = Math.max(0, currentStock + amount);
    await updateStock(newStock);
  };

  const handleCustomAdjustment = async () => {
    if (adjustment === 0) return;
    const newStock = Math.max(0, currentStock + adjustment);
    await updateStock(newStock);
    setAdjustment(0);
    setShowInput(false);
  };

  const updateStock = async (newStock: number) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}`,
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStockUpdate(newStock);
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Quick Stock Adjustment</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">{currentStock}</span>
      </div>

      <div className="space-y-3">
        {/* Quick adjustment buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAdjustment(-1)}
            disabled={updating || currentStock === 0}
            className="flex-1"
          >
            <Minus className="h-3 w-3 mr-1" />
            -1
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAdjustment(-5)}
            disabled={updating || currentStock < 5}
            className="flex-1"
          >
            <Minus className="h-3 w-3 mr-1" />
            -5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAdjustment(1)}
            disabled={updating}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            +1
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAdjustment(5)}
            disabled={updating}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            +5
          </Button>
        </div>

        {/* Custom adjustment */}
        {!showInput ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInput(true)}
            className="w-full"
          >
            Custom Adjustment
          </Button>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              placeholder="±Amount"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              size="sm"
              onClick={handleCustomAdjustment}
              disabled={updating || adjustment === 0}
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowInput(false);
                setAdjustment(0);
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {updating && (
          <div className="text-xs text-blue-600 text-center">
            Updating stock...
          </div>
        )}
      </div>
    </div>
  );
}
