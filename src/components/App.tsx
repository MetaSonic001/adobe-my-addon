import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import { Theme } from "@swc-react/theme";
import React, { Component, useState, useEffect } from "react";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { GroqService, GeneratedContent } from "../services/api";
import Settings from "./Settings";
import CreativeSparkPanel from "./CreativeSparkPanel";
import "./App.css";

const Toast = ({ message, type, onClose }: { 
  message: string; 
  type: 'success' | 'error' | 'info'; 
  onClose: () => void;
}) => (
  <div 
    className={`toast toast-${type}`}
    style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      maxWidth: '300px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      animation: 'slideIn 0.3s ease-out'
    }}
  >
    <span>{message}</span>
    <button 
      onClick={onClose}
      style={{
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px',
        marginLeft: '8px'
      }}
    >
      ×
    </button>
  </div>
);

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error?: string }> {
  state = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{this.state.error}</p>
          <p>Please refresh the add-on or check your API keys in Settings.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [googleTranslateApiKey, setGoogleTranslateApiKey] = useState('');
  const [unsplashApiKey, setUnsplashApiKey] = useState('');
  const [brandInfo, setBrandInfo] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [groqService, setGroqService] = useState<GroqService | null>(null);

  useEffect(() => {
    const timer = toast ? setTimeout(() => setToast(null), 3000) : null;
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleSaveSettings = (
    groqApiKey: string,
    googleTranslateApiKey?: string,
    unsplashApiKey?: string,
    brandInfo?: string
  ) => {
    if (!groqApiKey) {
      showToast('Please enter a Groq API key.', 'error');
      return;
    }
    setApiKey(groqApiKey);
    setGoogleTranslateApiKey(googleTranslateApiKey || '');
    setUnsplashApiKey(unsplashApiKey || '');
    setBrandInfo(brandInfo || '');
    setGroqService(new GroqService(groqApiKey, googleTranslateApiKey, unsplashApiKey));
    setShowSettings(false);
    showToast('Settings saved. Ready to generate content!', 'success');
  };

  const handleGenerateContent = async () => {
    if (!groqService) {
      showToast('Please configure your API keys in Settings.', 'error');
      return;
    }
    if (!prompt) {
      showToast('Please enter a prompt.', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const content = await groqService.generateContent(prompt, brandInfo);
      setGeneratedContent(content);
      showToast('Content generated successfully!', 'success');
    } catch (error: any) {
      showToast(`Failed to generate content: ${error.message}`, 'error');
      console.error('Content generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <Theme system="express" scale="medium" color="light">
        <div className="container">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
          {showSettings ? (
            <Settings onSave={handleSaveSettings} onToast={showToast} />
          ) : (
            <>
              <header className="header">
                <h1>🔥 CreativeSpark AI</h1>
                <p>AI-powered design optimization</p>
                <button
                  className="action-button"
                  onClick={() => setShowSettings(true)}
                >
                  Back to Settings
                </button>
              </header>
              <div className="content-generator">
                <div className="form-group">
                  <label htmlFor="prompt">Content Prompt</label>
                  <textarea
                    id="prompt"
                    className="textarea"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your content prompt (e.g., 'Create a vibrant Instagram post for a coffee shop')"
                    rows={3}
                  />
                </div>
                <div className="quick-prompts">
                  <small>Quick Prompts:</small>
                  <button
                    className="quick-prompt-btn"
                    onClick={() => setPrompt('Create a bold Instagram post for a fashion brand')}
                  >
                    Fashion Ad
                  </button>
                  <button
                    className="quick-prompt-btn"
                    onClick={() => setPrompt('Design a minimalist flyer for a tech event')}
                  >
                    Tech Flyer
                  </button>
                  <button
                    className="quick-prompt-btn"
                    onClick={() => setPrompt('Generate a fun social media post for a pet store')}
                  >
                    Pet Store Post
                  </button>
                </div>
                <button
                  className="action-button"
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                >
                  {isGenerating ? <span className="loading-spinner">⟳</span> : 'Generate Content'}
                </button>
              </div>
              {generatedContent && (
                <CreativeSparkPanel
                  content={generatedContent}
                  addOnUISdk={addOnUISdk}
                  onToast={showToast}
                />
              )}
              {!apiKey && (
                <div className="warning">
                  ⚠️ Set your Groq API key to get started
                </div>
              )}
            </>
          )}
        </div>
      </Theme>
    </ErrorBoundary>
  );
};

export default App;