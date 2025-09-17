'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SizeGuideProps {
  category: string;
}

const sizeGuides = {
  'kitchen-dining': {
    title: 'Kitchen & Dining Size Guide',
    measurements: [
      { size: 'Small', dimensions: '15cm x 10cm', capacity: '250ml' },
      { size: 'Medium', dimensions: '20cm x 15cm', capacity: '500ml' },
      { size: 'Large', dimensions: '25cm x 20cm', capacity: '750ml' },
      { size: 'XL', dimensions: '30cm x 25cm', capacity: '1000ml' },
    ]
  },
  'bedroom': {
    title: 'Bedroom Items Size Guide',
    measurements: [
      { size: 'Single', dimensions: '90cm x 190cm', note: 'Perfect for kids' },
      { size: 'Double', dimensions: '135cm x 190cm', note: 'Standard adult size' },
      { size: 'Queen', dimensions: '150cm x 200cm', note: 'Spacious comfort' },
      { size: 'King', dimensions: '180cm x 200cm', note: 'Maximum luxury' },
    ]
  },
  'bathroom': {
    title: 'Bathroom Accessories Size Guide',
    measurements: [
      { size: 'Compact', dimensions: '20cm x 15cm', note: 'Space-saving design' },
      { size: 'Standard', dimensions: '30cm x 20cm', note: 'Most popular choice' },
      { size: 'Large', dimensions: '40cm x 30cm', note: 'Family-sized' },
    ]
  }
};

export function SizeGuide({ category }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const guide = sizeGuides[category as keyof typeof sizeGuides];
  
  if (!guide) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Ruler className="h-4 w-4" />
        <span>Size Guide</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{guide.title}</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Size</th>
                        <th className="text-left py-3 px-4 font-semibold">Dimensions</th>
                        <th className="text-left py-3 px-4 font-semibold">
                          {guide.measurements[0].capacity ? 'Capacity' : 'Note'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {guide.measurements.map((measurement, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{measurement.size}</td>
                          <td className="py-3 px-4">{measurement.dimensions}</td>
                          <td className="py-3 px-4">
                            {measurement.capacity || measurement.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Measurement Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All measurements are approximate</li>
                    <li>• Consider your space before ordering</li>
                    <li>• Contact us if you need specific dimensions</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
