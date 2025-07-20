import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { Component, useState, useCallback } from "react";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

import { GroqService, GeneratedContent } from "../services/api";
// import { DesignService } from "../services/design";
import Settings from "./Settings";
import ContentGenerator from "./ContentGenerator";
import LayoutSelector from "./LayoutSelector";
import "./App.css";

// Error Boundary Component
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
  const [isCreatingDesign, setIsCreatingDesign] = useState(false);
  
  const groqService = new GroqService(apiKey);
  // const designService = new DesignService(addOnUISdk);

  const handleSaveSettings = useCallback(() => {
    localStorage.setItem('groq_api_key', apiKey);
    localStorage.setItem('brand_info', brandInfo);
  }, [apiKey, brandInfo]);

  const handleGenerateContent = useCallback(async (prompt: string): Promise<GeneratedContent> => {
    if (!apiKey) {
      throw new Error('Please set your Groq API key in settings');
    }

    setIsGenerating(true);
    try {
      const content = await groqService.generateContent(prompt, brandInfo);
      setGeneratedContent(content);
      return content;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, brandInfo]);

  const handleCreateDesign = useCallback(async (layoutIndex: number) => {
    if (!generatedContent) return;

    setIsCreatingDesign(true);
    try {
      // Temporary: Just simulate design creation
      console.log('Design would be created with layout:', layoutIndex, generatedContent);
      alert(`Design created with ${generatedContent.layoutSuggestions[layoutIndex]} layout!`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } finally {
      setIsCreatingDesign(false);
    }
  }, [generatedContent]);

  return (
    <ErrorBoundary>
      <Theme system="express" scale="medium" color="light">
        <div className="container">
          <header className="header">
            <h1>🚀 InstaBrand AIs</h1>
            <p>AI-powered brand content creator</p>
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
            <LayoutSelector
              layouts={generatedContent.layoutSuggestions}
              content={generatedContent}
              onCreateDesign={handleCreateDesign}
              isCreating={isCreatingDesign}
            />
          )}

          {!apiKey && (
            <div className="warning">
              ⚠️ Set your Groq API key to get started
            </div>
          )}
        </div>
      </Theme>
    </ErrorBoundary>
  );
};

export default App;