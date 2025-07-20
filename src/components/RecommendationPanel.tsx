import React, { useState } from 'react';
import { Button } from "@swc-react/button";
import { Copy, Plus, RefreshCcw } from 'lucide-react';
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { GeneratedContent } from '../services/api';

interface RecommendationPanelProps {
  content: GeneratedContent;
  addOnUISdk: AddOnSDKAPI;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ content, addOnUISdk, onToast }) => {
  const [selectedPreview, setSelectedPreview] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const layouts = content.layoutSuggestions || [
    'Centered text with bold typography',
    'Image overlay with caption',
    'Split layout with graphics'
  ];

  const applyToCanvas = async (layoutIndex: number) => {
    try {
      const doc = addOnUISdk.app.document as any;
      const layout = layouts[layoutIndex];
      
      // Clear existing canvas content
      await doc.clear();

      // Add background with gradient
      await doc.addRectangle({
        width: 1080,
        height: 1080,
        fill: {
          type: 'gradient',
          gradientType: 'linear',
          colors: [
            { color: { hex: content.colorPalette[0] }, offset: 0 },
            { color: { hex: content.colorPalette[1] }, offset: 1 }
          ]
        },
        position: { x: 0, y: 0 }
      });

      // Add caption
      await doc.addText({
        text: content.caption,
        fontSize: 24,
        fontFamily: content.fonts[0] || 'Arial',
        color: { hex: content.colorPalette[2] || '#ffffff' },
        position: { x: 50, y: layout.includes('Centered') ? 540 : 100 },
        textAlign: 'center'
      });

      // Add decorative element based on layout
      if (layout.includes('Image')) {
        await doc.addRectangle({
          width: 300,
          height: 300,
          fill: { hex: content.colorPalette[3] || '#3498db' },
          position: { x: 390, y: 240 }
        });
      } else if (layout.includes('Split')) {
        await doc.addEllipse({
          width: 150,
          height: 150,
          fill: { hex: content.colorPalette[4] || '#e74c3c' },
          position: { x: 930, y: 50 }
        });
      }

      onToast('Design applied to canvas!', 'success');
    } catch (error) {
      onToast('Failed to apply design to canvas', 'error');
      console.error('Apply to canvas error:', error);
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
    const hashtagText = content.hashtags.join(' ');
    try {
      await navigator.clipboard.writeText(hashtagText);
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

  return (
    <div className="recommendation-panel">
      <div className="recommendation-header">
        <h3>Design Recommendations</h3>
        <button 
          className="toggle-button" 
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
        </button>
      </div>

      <div className="preview-cards">
        {layouts.map((layout, index) => (
          <div 
            key={index} 
            className="preview-card"
            onClick={() => setSelectedPreview(index)}
          >
            <div 
              className="preview-image"
              style={{
                '--gradient-start': content.colorPalette[0],
                '--gradient-end': content.colorPalette[1]
              } as React.CSSProperties}
            >
              <div 
                style={{
                  position: 'absolute',
                  top: index === 1 ? '20px' : '10px',
                  right: index === 2 ? '10px' : 'auto',
                  left: index === 0 ? '10px' : 'auto',
                  width: index === 1 ? '60px' : '40px',
                  height: index === 2 ? '80px' : '40px',
                  background: content.colorPalette[index % content.colorPalette.length],
                  borderRadius: index === 1 ? '50%' : '8px'
                }}
              />
              <div className="preview-text">
                {content.caption.substring(0, 50)}...
              </div>
            </div>
            <p style={{ fontSize: '12px', margin: '0 0 8px 0' }}>{layout}</p>
            <div className="preview-actions">
              <button 
                className="action-button"
                onClick={() => applyToCanvas(index)}
              >
                <Plus size={14} /> Apply
              </button>
              <button 
                className="action-button"
                onClick={() => setSelectedPreview(index)}
              >
                <RefreshCcw size={14} /> Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {showSuggestions && (
        <div className="suggestion-list">
          <div className="suggestion-item">
            <strong>Caption:</strong> {content.caption}
            <button 
              className="action-button" 
              style={{ marginLeft: '8px', padding: '4px 8px' }}
              onClick={copyCaption}
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <div className="suggestion-item">
            <strong>Hashtags:</strong> {content.hashtags.join(' ')}
            <button 
              className="action-button" 
              style={{ marginLeft: '8px', padding: '4px 8px' }}
              onClick={copyHashtags}
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <div className="suggestion-item">
            <strong>Tone:</strong> {content.tone}
          </div>
          <div className="suggestion-item">
            <strong>Fonts:</strong> {content.fonts.join(', ')}
          </div>
          <div className="suggestion-item">
            <strong>Color Palette:</strong>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {content.colorPalette.map((color, i) => (
                <div 
                  key={i} 
                  className="tooltip"
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                  onClick={() => copyColor(color)}
                >
                  <span className="tooltip-text">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationPanel;