import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface DataUploadHelpProps {
  type: 'products' | 'siteData';
}

export function DataUploadHelp({ type }: DataUploadHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const productExample = [
    {
      "name": "Premium Vanilla Candle",
      "price": "$24.99",
      "description": "Hand-poured vanilla scented candle with 40-hour burn time",
      "category": "Scented Candles",
      "inStock": true,
      "imageUrl": "https://example.com/vanilla-candle.jpg",
      "features": ["40-hour burn time", "Natural soy wax", "Cotton wick"],
      "specifications": {
        "Weight": "8 oz",
        "Dimensions": "3.5\" x 4\"",
        "Burn Time": "40 hours"
      }
    }
  ];

  const siteDataExample = [
    {
      "title": "Shipping Policy",
      "content": "We offer free shipping on orders over $50. Standard shipping takes 3-5 business days.",
      "category": "policy",
      "tags": ["shipping", "delivery", "policy"]
    },
    {
      "title": "Custom Candle Process",
      "content": "Our custom candles are made to order. Choose your scent, color, and container. Processing takes 2-3 business days.",
      "category": "service",
      "tags": ["custom", "process", "how-to"]
    }
  ];

  const example = type === 'products' ? productExample : siteDataExample;
  const title = type === 'products' ? 'Products JSON Format' : 'Site Data JSON Format';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-gray-300 transition-colors"
        title={`${title} help`}
      >
        <HelpCircle size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Upload a JSON file with an array of {type === 'products' ? 'products' : 'data items'} in this format:
              </p>
              
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(example, null, 2)}
              </pre>
              
              <div className="text-gray-400 text-xs space-y-1">
                {type === 'products' ? (
                  <>
                    <p>• <strong>Required fields:</strong> name, price, description, category</p>
                    <p>• <strong>Optional fields:</strong> inStock (default: true), imageUrl, features, specifications</p>
                    <p>• Features should be an array of strings</p>
                    <p>• Specifications should be an object with key-value pairs</p>
                  </>
                ) : (
                  <>
                    <p>• <strong>Required fields:</strong> title, content, category</p>
                    <p>• <strong>Categories:</strong> general, product, service, policy, faq</p>
                    <p>• <strong>Optional fields:</strong> tags (array of strings)</p>
                    <p>• Tags help the AI find relevant information</p>
                  </>
                )}
                <p>• Invalid entries will be skipped with error messages</p>
                <p>• The AI will use this data to help customers</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}