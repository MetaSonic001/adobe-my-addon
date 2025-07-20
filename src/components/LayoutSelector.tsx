import React, { useState } from 'react';
import { Button } from "@swc-react/button";
import { Layout, Plus, Download, Copy } from 'lucide-react';
import { GeneratedContent } from '../services/api';

interface LayoutSelectorProps {
  layouts: string[];
  content: GeneratedContent;
  onCreateDesign: (layoutIndex: number) => Promise<void>;
  isCreating: boolean;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ 
  layouts, 
  content,
  onCreateDesign, 
  isCreating,
  onToast 
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

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(content.caption);
      onToast('Caption copied to clipboard!', 'success');
    } catch (error) {
      onToast('Failed to copy caption', 'error');
    }
  };

  const copyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(content.hashtags.join(' '));
      onToast('Hashtags copied to clipboard!', 'success');
    } catch (error) {
      onToast('Failed to copy hashtags', 'error');
    }
  };

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      onToast(`Color ${color} copied!`, 'success');
    } catch (error) {
      onToast('Failed to copy color', 'error');
    }
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
          {/* Instagram Post Preview */}
          <div style={{
            width: '100%',
            aspectRatio: '1/1',
            background: `linear-gradient(135deg, ${content.colorPalette[0]} 0%, ${content.colorPalette[1]} 50%, ${content.colorPalette[2]} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: `radial-gradient(circle, ${content.colorPalette[3]}20 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
              opacity: 0.6
            }} />
            
            {/* Floating Elements */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '80px',
              height: '80px',
              background: `linear-gradient(45deg, ${content.colorPalette[3]}, ${content.colorPalette[4]})`,
              borderRadius: selectedLayout === 1 ? '50%' : '20px',
              opacity: 0.8,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '20px',
              width: '60px',
              height: '60px',
              background: content.colorPalette[2],
              borderRadius: selectedLayout === 2 ? '0' : '50%',
              opacity: 0.9,
              transform: 'rotate(45deg)'
            }} />

            {/* Main Content Container */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              textAlign: 'center',
              zIndex: 2
            }}>
              {/* Sale Badge */}
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                padding: '8px 20px',
                borderRadius: '25px',
                marginBottom: '20px',
                border: `2px solid ${content.colorPalette[4]}`,
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
              }}>
                <span style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${content.colorPalette[0]}, ${content.colorPalette[3]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  UP TO 50% OFF
                </span>
              </div>

              {/* Main Text */}
              <h1 style={{
                color: 'rgba(255,255,255,0.95)',
                fontFamily: content.fonts[0],
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0 0 15px 0',
                textShadow: '0 3px 10px rgba(0,0,0,0.3)',
                lineHeight: '1.2',
                background: 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(5px)',
                padding: '15px 20px',
                borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {content.caption.replace(/#\w+/g, '').replace(/up to \d+% off/i, '').trim()}
              </h1>

              {/* CTA Button */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: `linear-gradient(45deg, ${content.colorPalette[3]}, ${content.colorPalette[4]})`,
                color: 'white',
                padding: '12px 25px',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}>
                <span>SHOP NOW</span>
                <div style={{
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid white',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent'
                }} />
              </div>
            </div>

            {/* Corner Accent */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100px',
              height: '100px',
              background: `linear-gradient(135deg, ${content.colorPalette[4]}, transparent)`,
              clipPath: 'polygon(0 0, 100% 0, 0 100%)'
            }} />

            {/* Bottom Wave */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '100%',
              height: '80px',
              background: `linear-gradient(to top, ${content.colorPalette[1]}80, transparent)`,
              clipPath: 'polygon(0 100%, 100% 100%, 100% 20%, 0 60%)'
            }} />

            {/* Tone Badge */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              right: '15px',
              background: 'rgba(255,255,255,0.9)',
              color: content.colorPalette[0],
              padding: '5px 12px',
              borderRadius: '15px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {content.tone}
            </div>
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
                  onClick={() => copyColor(color)}
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