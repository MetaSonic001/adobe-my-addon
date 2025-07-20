import React, { useState } from 'react';
import { Button } from "@swc-react/button";
import { Sparkles, Wand2 } from 'lucide-react';
import { GeneratedContent } from '../services/api';

interface ContentGeneratorProps {
  onGenerate: (prompt: string) => Promise<GeneratedContent>;
  isLoading: boolean;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastClick, setLastClick] = useState(0);

  const handleGenerate = async () => {
    const now = Date.now();
    if (now - lastClick < 1000) return; // Debounce: 1s delay
    setLastClick(now);

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    try {
      const result = await onGenerate(prompt);
      setContent(result);
    } catch (error: any) {
      setError(error.message || 'Failed to generate content. Please try again.');
      console.error('Generation failed:', error);
    }
  };

  const quickPrompts = [
    'Summer sale for beach wear',
    'Launch post for eco-friendly products',
    'Holiday promotion announcement',
    'New product reveal'
  ];

  return (
    <div className="content-generator">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="form-group">
        <label>What do you want to create?</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Launch sale for monsoon jackets, Instagram post for eco-friendly shampoo..."
          className="textarea"
          rows={3}
        />
      </div>

      <div className="quick-prompts">
        <small>Quick ideas:</small>
        {quickPrompts.map((quickPrompt, index) => (
          <button 
            key={index}
            className="quick-prompt-btn"
            onClick={() => setPrompt(quickPrompt)}
          >
            {quickPrompt}
          </button>
        ))}
      </div>

      <Button 
        size="m" 
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        style={{ width: '100%', marginTop: '12px' }}
      >
        {isLoading ? (
          <>
            <Wand2 size={16} className="spinning" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Content
          </>
        )}
      </Button>

      {content && (
        <div className="generated-content">
          <div className="content-section">
            <h4>Caption:</h4>
            <p className="caption">{content.caption}</p>
          </div>

          <div className="content-section">
            <h4>Hashtags:</h4>
            <div className="hashtags">
              {content.hashtags.map((tag, i) => (
                <span key={i} className="hashtag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h4>Tone: <span className="tone">{content.tone}</span></h4>
          </div>

          <div className="content-section">
            <h4>Color Palette:</h4>
            <div className="color-palette">
              {content.colorPalette.map((color, i) => (
                <div 
                  key={i} 
                  className="color-swatch" 
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;