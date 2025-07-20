import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { Component, useState, useCallback } from "react";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

import { GroqService, GeneratedContent } from "../services/api";
import Settings from "./Settings";
import ContentGenerator from "./ContentGenerator";
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
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
          <p>Please refresh the add-on or check your API key in Settings.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
  const [brandInfo, setBrandInfo] = useState(localStorage.getItem('brand_info') || '');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const groqService = new GroqService(apiKey);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSettings = useCallback(() => {
    localStorage.setItem('groq_api_key', apiKey);
    localStorage.setItem('brand_info', brandInfo);
    showToast('Settings saved successfully!', 'success');
  }, [apiKey, brandInfo]);

  const handleGenerateContent = useCallback(async (prompt: string): Promise<GeneratedContent> => {
    if (!apiKey) {
      throw new Error('Please set your Groq API key in settings');
    }

    setIsGenerating(true);
    try {
      const content = await groqService.generateContent(prompt, brandInfo);
      setGeneratedContent(content);
      showToast('Content generated successfully!', 'success');
      return content;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, brandInfo]);

  return (
    <ErrorBoundary>
      <Theme system="express" scale="medium" color="light">
        <div className="container">
          <header className="header">
            <h1>🔥 CreativeSpark AI</h1>
            <p>AI-powered design optimization</p>
          </header>

          <Settings
            apiKey={apiKey}
            brandInfo={brandInfo}
            onApiKeyChange={setApiKey}
            onBrandInfoChange={setBrandInfo}
            onSave={handleSaveSettings}
          />

          <ContentGenerator
            onGenerate={handleGenerateContent}
            isLoading={isGenerating}
          />

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

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </Theme>
    </ErrorBoundary>
  );
};

export default App;