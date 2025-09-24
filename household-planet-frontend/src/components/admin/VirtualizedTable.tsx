'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface VirtualizedTableProps {
  data: any[];
  columns: any[];
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({ data, columns }) => {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="text-gray-500">Table component placeholder</div>
    </div>
  );
};

export default VirtualizedTable;