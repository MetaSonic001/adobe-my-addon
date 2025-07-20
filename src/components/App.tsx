import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { useState, useCallback } from "react";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

import { GroqService, GeneratedContent } from "../services/api"; // Updated import
import { DesignService } from "../services/design";
import Settings from "./Settings";
import ContentGenerator from "./ContentGenerator";
import LayoutSelector from "./LayoutSelector";
import "./App.css";

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
  const [brandInfo, setBrandInfo] = useState(localStorage.getItem('brand_info') || '');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingDesign, setIsCreatingDesign] = useState(false);
  
  const groqService = new GroqService(apiKey); // Updated service
  const designService = new DesignService(addOnUISdk);

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
      await designService.createDesign(generatedContent, layoutIndex);
    } finally {
      setIsCreatingDesign(false);
    }
  }, [generatedContent]);

  return (
    <Theme system="express" scale="medium" color="light">
      <div className="container">
        <header className="header">
          <h1>🚀 InstaBrand AI</h1>
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
  );
};

export default App;