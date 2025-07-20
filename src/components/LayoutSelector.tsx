import React, { useState } from 'react';
import { Button } from "@swc-react/button";
import { Layout, Plus, Download, Copy } from 'lucide-react';
import { GeneratedContent } from '../services/api';

interface LayoutSelectorProps {
  layouts: string[];
  content: GeneratedContent;
  onCreateDesign: (layoutIndex: number) => Promise<void>;
  isCreating: boolean;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ 
  layouts, 
  content,
  onCreateDesign, 
  isCreating 
}) => {
  const [selectedLayout, setSelectedLayout] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreate = async () => {
    setError(null);
    try {
      await onCreateDesign(selectedLayout);
      setShowPreview(true);
    } catch (error: any) {
      setError(error.message || 'Design creation failed. Please try again.');
      console.error('Design creation failed:', error);
    }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(content.caption);
    alert('Caption copied to clipboard!');
  };

  const copyHashtags = () => {
    navigator.clipboard.writeText(content.hashtags.join(' '));
    alert('Hashtags copied to clipboard!');
  };

  if (layouts.length === 0) {
    return null;
  }

  return (
    <div className="layout-selector">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <h4><Layout size={16} /> Choose Layout:</h4>
      
      <div className="layout-options">
        {layouts.map((layout, index) => (
          <div 
            key={index}
            className={`layout-option ${selectedLayout === index ? 'selected' : ''}`}
            onClick={() => setSelectedLayout(index)}
          >
            <div className="layout-preview">
              <div className={`preview-${index % 3}`} style={{
                background: `linear-gradient(135deg, ${content.colorPalette[0]}, ${content.colorPalette[1]})`
              }}>
                <div className="preview-element" style={{
                  backgroundColor: content.colorPalette[2]
                }}></div>
                <div className="preview-text" style={{
                  backgroundColor: content.colorPalette[3]
                }}></div>
              </div>
            </div>
            <p style={{ fontSize: '10px' }}>{layout.substring(0, 50)}...</p>
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
            Create Design Preview
          </>
        )}
      </Button>

      {showPreview && (
        <div className="design-preview" style={{
          marginTop: '20px',
          border: '2px solid #e1e8ed',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'white'
        }}>
          {/* Mock Instagram Post Preview */}
          <div style={{
            width: '100%',
            aspectRatio: '1/1',
            background: `linear-gradient(135deg, ${content.colorPalette[0]}, ${content.colorPalette[1]})`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center'
          }}>
            {/* Main Caption */}
            <h2 style={{
              color: content.colorPalette[4] || '#ffffff',
              fontFamily: content.fonts[0],
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 15px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              lineHeight: '1.3'
            }}>
              {content.caption.replace(/#\w+/g, '').trim()}
            </h2>

            {/* Decorative Element based on layout */}
            {selectedLayout === 0 && (
              <div style={{
                width: '60px',
                height: '4px',
                backgroundColor: content.colorPalette[2],
                borderRadius: '2px',
                marginBottom: '10px'
              }} />
            )}
            
            {selectedLayout === 1 && (
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: content.colorPalette[3],
                borderRadius: '50%',
                position: 'absolute',
                top: '15px',
                right: '15px',
                opacity: 0.8
              }} />
            )}

            {selectedLayout === 2 && (
              <div style={{
                width: '20px',
                height: '80px',
                backgroundColor: content.colorPalette[4],
                position: 'absolute',
                top: '15px',
                right: '15px',
                opacity: 0.7,
                borderRadius: '10px'
              }} />
            )}

            {/* Tone indicator */}
            <span style={{
              background: content.colorPalette[3],
              color: 'white',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              textTransform: 'capitalize',
              marginTop: 'auto'
            }}>
              {content.tone} Style
            </span>
          </div>

          {/* Content Tools */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #eee'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px' 
              }}>
                <strong style={{ fontSize: '12px' }}>Caption:</strong>
                <Button size="s" variant="secondary" onClick={copyCaption}>
                  <Copy size={12} /> Copy
                </Button>
              </div>
              <p style={{ 
                fontSize: '11px', 
                color: '#666', 
                margin: '0',
                padding: '8px',
                background: '#f8f9fa',
                borderRadius: '4px'
              }}>
                {content.caption}
              </p>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px' 
              }}>
                <strong style={{ fontSize: '12px' }}>Hashtags:</strong>
                <Button size="s" variant="secondary" onClick={copyHashtags}>
                  <Copy size={12} /> Copy
                </Button>
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '4px' 
              }}>
                {content.hashtags.map((tag, i) => (
                  <span key={i} style={{
                    background: content.colorPalette[0],
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10px'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong style={{ fontSize: '12px' }}>Fonts:</strong>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {content.fonts.join(', ')}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '12px' }}>Color Palette:</strong>
              <div style={{ 
                display: 'flex', 
                gap: '6px', 
                marginTop: '4px' 
              }}>
                {content.colorPalette.map((color, i) => (
                  <div key={i} style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    position: 'relative'
                  }} 
                  title={color}
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                    alert(`Color ${color} copied!`);
                  }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutSelector;