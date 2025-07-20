import React, { useState } from 'react';
import { Button } from "@swc-react/button";
import { Layout, Plus } from 'lucide-react';

interface LayoutSelectorProps {
  layouts: string[];
  onCreateDesign: (layoutIndex: number) => Promise<void>;
  isCreating: boolean;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ 
  layouts, 
  onCreateDesign, 
  isCreating 
}) => {
  const [selectedLayout, setSelectedLayout] = useState(0);

  const handleCreate = async () => {
    try {
      await onCreateDesign(selectedLayout);
    } catch (error) {
      console.error('Design creation failed:', error);
    }
  };

  if (layouts.length === 0) {
    return null;
  }

  return (
    <div className="layout-selector">
      <h4><Layout size={16} /> Choose Layout:</h4>
      
      <div className="layout-options">
        {layouts.map((layout, index) => (
          <div 
            key={index}
            className={`layout-option ${selectedLayout === index ? 'selected' : ''}`}
            onClick={() => setSelectedLayout(index)}
          >
            <div className="layout-preview">
              {/* Simple visual representation */}
              <div className={`preview-${index % 3}`}>
                <div className="preview-element"></div>
                <div className="preview-text"></div>
              </div>
            </div>
            <p>{layout}</p>
          </div>
        ))}
      </div>

      <Button 
        size="m" 
        onClick={handleCreate}
        disabled={isCreating}
        style={{ width: '100%', marginTop: '16px' }}
      >
        {isCreating ? (
          <>
            <Plus size={16} className="spinning" />
            Creating Design...
          </>
        ) : (
          <>
            <Plus size={16} />
            Create Design
          </>
        )}
      </Button>
    </div>
  );
};

export default LayoutSelector;