import React, { useState } from 'react';
import { Button } from "@swc-react/button";
import { Settings as SettingsIcon, Save } from 'lucide-react';

interface SettingsProps {
  apiKey: string;
  brandInfo: string;
  onApiKeyChange: (key: string) => void;
  onBrandInfoChange: (info: string) => void;
  onSave: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  apiKey, 
  brandInfo, 
  onApiKeyChange, 
  onBrandInfoChange, 
  onSave 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="settings">
      <Button 
        size="s" 
        variant="secondary" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ marginBottom: '12px' }}
      >
        <SettingsIcon size={16} />
        Settings
      </Button>

      {isOpen && (
        <div className="settings-panel">
          <div className="form-group">
            <label>Groq API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter your Groq API key"
              className="input"
            />
          </div>

          <div className="form-group">
            <label>Brand Info:</label>
            <textarea
              value={brandInfo}
              onChange={(e) => onBrandInfoChange(e.target.value)}
              placeholder="Describe your brand (style, colors, target audience...)"
              className="textarea"
              rows={3}
            />
          </div>

          <Button size="s" onClick={onSave}>
            <Save size={16} />
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;