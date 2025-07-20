import React, { useState } from 'react';
import './app.css';

interface SettingsProps {
  onSave: (apiKey: string, googleTranslateApiKey?: string, unsplashApiKey?: string, brandInfo?: string) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave, onToast }) => {
  const [apiKey, setApiKey] = useState('');
  const [googleTranslateApiKey, setGoogleTranslateApiKey] = useState('');
  const [unsplashApiKey, setUnsplashApiKey] = useState('');
  const [brandInfo, setBrandInfo] = useState('');

  const handleSave = () => {
    if (!apiKey) {
      onToast('Please enter a Groq API key.', 'error');
      return;
    }
    onSave(apiKey, googleTranslateApiKey, unsplashApiKey, brandInfo);
    onToast('Settings saved! Optional APIs will enhance features.', 'success');
  };

  return (
    <div className="settings-panel">
      <div className="header">
        <h1>CreativeSpark AI Settings</h1>
        <p>Configure your API keys and brand details</p>
      </div>
      <div className="warning">
        <strong>Warning:</strong> API keys are stored in memory for this session only. Do not share sensitive keys.
      </div>
      <div className="form-group">
        <label htmlFor="apiKey">Groq API Key (Required)</label>
        <input
          id="apiKey"
          className="input"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Groq API key"
        />
      </div>
      <div className="form-group">
        <label htmlFor="googleTranslateApiKey">Google Translate API Key (Optional)</label>
        <input
          id="googleTranslateApiKey"
          className="input"
          value={googleTranslateApiKey}
          onChange={(e) => setGoogleTranslateApiKey(e.target.value)}
          placeholder="Enter your Google Translate API key for translations"
        />
      </div>
      <div className="form-group">
        <label htmlFor="unsplashApiKey">Unsplash API Key (Optional)</label>
        <input
          id="unsplashApiKey"
          className="input"
          value={unsplashApiKey}
          onChange={(e) => setUnsplashApiKey(e.target.value)}
          placeholder="Enter your Unsplash API key for images"
        />
      </div>
      <div className="form-group">
        <label htmlFor="brandInfo">Brand Information</label>
        <textarea
          id="brandInfo"
          className="textarea"
          value={brandInfo}
          onChange={(e) => setBrandInfo(e.target.value)}
          placeholder="Enter brand details (e.g., name, tone, audience)"
          rows={4}
        />
      </div>
      <button className="action-button" onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default Settings;