'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, X, Info } from 'lucide-react';

interface SizeGuideProps {
  category: string;
  productType?: string;
}

interface SizeChart {
  [key: string]: {
    [size: string]: string;
  };
}

const sizeCharts: { [category: string]: SizeChart } = {
  'kitchen-dining': {
    'Knife Length': {
      'Small': '15-20cm',
      'Medium': '20-25cm',
      'Large': '25-30cm',
      'XL': '30cm+'
    },
    'Cookware Diameter': {
      'Small': '16-20cm',
      'Medium': '22-26cm',
      'Large': '28-32cm',
      'XL': '34cm+'
    }
  },
  'home-decor': {
    'Frame Size': {
      'Small': '10x15cm',
      'Medium': '20x25cm',
      'Large': '30x40cm',
      'XL': '50x70cm'
    },
    'Vase Height': {
      'Small': '10-20cm',
      'Medium': '20-35cm',
      'Large': '35-50cm',
      'XL': '50cm+'
    }
  },
  'storage': {
    'Container Volume': {
      'Small': '0.5-2L',
      'Medium': '2-5L',
      'Large': '5-10L',
      'XL': '10L+'
    },
    'Box Dimensions': {
      'Small': '20x15x10cm',
      'Medium': '30x25x20cm',
      'Large': '40x35x30cm',
      'XL': '50x45x40cm'
    }
  }
};

const measurementTips = {
  'kitchen-dining': [
    'Measure your cutting board to ensure knife fits comfortably',
    'Consider your hand size for handle comfort',
    'Check cabinet space for storage'
  ],
  'home-decor': [
    'Measure wall space before selecting frame size',
    'Consider room proportions for optimal visual impact',
    'Account for matting and frame thickness'
  ],
  'storage': [
    'Measure available shelf or cabinet space',
    'Consider what you plan to store',
    'Check door clearance for larger containers'
  ]
};

export function EnhancedSizeGuide({ category, productType }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const categoryData = sizeCharts[category];
  const tips = measurementTips[category as keyof typeof measurementTips] || [];

  if (!categoryData) return null;

  const chartTypes = Object.keys(categoryData);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
      >
        <Ruler className="h-4 w-4" />
        <span>Size Guide</span>
      </button>

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
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 rounded-lg p-2">
                    <Ruler className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold">Size Guide</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Tabs */}
                {chartTypes.length > 1 && (
                  <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                    {chartTypes.map((type, index) => (
                      <button
                        key={type}
                        onClick={() => setActiveTab(index)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === index
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                {/* Size Chart */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">{chartTypes[activeTab]}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">Size</th>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium">Measurement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(categoryData[chartTypes[activeTab]]).map(([size, measurement]) => (
                          <tr key={size} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2 font-medium">{size}</td>
                            <td className="border border-gray-200 px-4 py-2">{measurement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Measurement Tips */}
                {tips.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Info className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Measurement Tips</h4>
                    </div>
                    <ul className="space-y-2">
                      {tips.map((tip: string, index: number) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50">
                <p className="text-sm text-gray-600 text-center">
                  Still unsure? Contact our customer service for personalized sizing help.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
