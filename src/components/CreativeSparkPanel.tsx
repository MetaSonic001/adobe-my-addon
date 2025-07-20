import React, { useState, useEffect } from 'react';
import { Button } from "@swc-react/button";
import { Copy, Plus, RefreshCcw, Share2, Download, Image } from 'lucide-react';
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { GeneratedContent } from '../services/api';

interface CreativeSparkPanelProps {
  content: GeneratedContent;
  addOnUISdk: AddOnSDKAPI;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CreativeSparkPanel: React.FC<CreativeSparkPanelProps> = ({ content, addOnUISdk, onToast }) => {
  const [activeTab, setActiveTab] = useState('ideas');
  const [feedback, setFeedback] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [designScore, setDesignScore] = useState(70);
  const [accordionOpen, setAccordionOpen] = useState<string[]>(['score', 'quickFixes']);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

  useEffect(() => {
    const checkCanvas = async () => {
      try {
        // Placeholder: Assume canvas is empty for prototype
        // Replace with: const doc = addOnUISdk.app.document; const elements = await doc.getArtboardElements();
        setIsCanvasEmpty(true);
      } catch (error) {
        console.error('Canvas check error:', error);
        setIsCanvasEmpty(true);
        onToast('Unable to check canvas. Assuming blank.', 'error');
      }
    };
    checkCanvas();

    let score = 100;
    if (content.caption.length > 150) score -= 20;
    if (content.hashtags.length < 5) score -= 10;
    if (content.colorPalette.every(c => c === content.colorPalette[0])) score -= 15;
    if (content.layoutTips.length < 3) score -= 5;
    if (content.accessibilitySuggestions.some(s => s.issue.includes('contrast'))) score -= 10;
    setDesignScore(Math.max(0, Math.min(100, score)));
  }, [content, addOnUISdk]);

  const toggleAccordion = (section: string) => {
    setAccordionOpen(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const applyElement = async (element: { type: string; description: string; placement?: string; content?: string }) => {
    try {
      // Mock implementation (replace with actual SDK method)
      // const doc = addOnUISdk.app.document as any;
      // if (element.type === 'text') await doc.addText(element.content || element.description, { placement: element.placement || 'center' });
      onToast(`${element.description} applied to canvas! (Mock)`, 'success');
      setIsCanvasEmpty(false);
    } catch (error) {
      onToast('Failed to apply element. SDK method unavailable.', 'error');
      console.error('Apply element error:', error);
    }
  };

  const copyText = async (text: string, type: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      onToast(`${type} copied to clipboard!`, 'success');
    } catch (error) {
      onToast(`Failed to copy ${type}. Please copy manually.`, 'error');
      console.error('Copy error:', error);
    }
  };

  const exportSnapshot = async () => {
    try {
      // Mock implementation (replace with actual SDK method)
      // const doc = addOnUISdk.app.document as any;
      // const snapshot = await doc.export({ format: 'png' });
      onToast('Snapshot exported! (Mock: Download not supported)', 'success');
    } catch (error) {
      onToast('Failed to export snapshot. SDK method unavailable.', 'error');
      console.error('Export snapshot error:', error);
    }
  };

  const generateFreshIdeas = async () => {
    try {
      const idea = { ...content.freshIdeas[0], placement: 'center' };
      await applyElement(idea);
      onToast('Fresh idea applied to canvas! (Mock)', 'success');
    } catch (error) {
      onToast('Failed to apply fresh idea', 'error');
      console.error('Fresh idea error:', error);
    }
  };

  const renderScoreGauge = () => (
    <div className="score-gauge">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#d1d5db" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={designScore > 75 ? '#22c55e' : designScore > 50 ? '#f59e0b' : '#ef4444'}
          strokeWidth="10"
          strokeDasharray={`${designScore * 2.83}, 283`}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="55" textAnchor="middle" className="score-text">{designScore}</text>
      </svg>
      <p style={{ fontSize: '11px', textAlign: 'center', color: '#1e40af' }}>
        {designScore > 75 ? 'Great: Ready to shine!' : designScore > 50 ? 'Good: Needs minor tweaks' : 'Needs work: Check quick fixes'}
      </p>
    </div>
  );

  if (isCanvasEmpty) {
    return (
      <div className="blank-canvas-panel">
        <h3>Blank Canvas Detected</h3>
        <p>Start by generating fresh ideas or optimizing for SEO.</p>
        <div className="tab-group">
          {['ideas', 'keywords'].map(tab => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {activeTab === 'ideas' && (
          <div>
            <div className="recommendation-card">
              <strong>Fresh Ideas</strong>
              {content.freshIdeas.map((idea, i) => (
                <div key={i} style={{ margin: '6px 0' }}>
                  <strong>{idea.description}</strong>: {idea.content || 'Add to canvas'}
                  <button className="action-button" onClick={() => applyElement({ ...idea, placement: 'center' })}>
                    <Plus size={12} /> Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div>
            <div className="recommendation-card">
              <strong>Keyword Input:</strong>
              <input
                className="keyword-input"
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                placeholder="Enter product or theme..."
              />
              <button
                className="action-button"
                onClick={() => onToast('Keywords updated! (Mock)', 'success')}
              >
                <RefreshCcw size={12} /> Update Keywords
              </button>
            </div>
            {content.keywordSuggestions.map((keyword, i) => (
              <div key={i} className="recommendation-card">
                <strong>{keyword.keyword} ({keyword.relevance}%)</strong>: {keyword.suggestion}
                <button className="action-button" onClick={() => copyText(keyword.keyword, 'Keyword')}>
                  <Copy size={12} /> Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="creativespark-panel">
      <div className="tab-group">
        {['recommendations', 'moodBoard', 'trends', 'feedback', 'analytics', 'export', 'keywords'].map(tab => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('Board', ' Board')}
          </div>
        ))}
      </div>

      {activeTab === 'recommendations' && (
        <div>
          <div className="preview-canvas">
            <div
              className="preview-text"
              style={{ background: content.colorPalette[0], color: content.colorPalette[1] }}
            >
              {content.caption.substring(0, 50)}...
            </div>
          </div>
          <div className="accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('score')}>
              Design Health Score
              <span>{accordionOpen.includes('score') ? '−' : '+'}</span>
            </div>
            {accordionOpen.includes('score') && (
              <div className="accordion-content active">
                {renderScoreGauge()}
                <div className="recommendation-card">
                  <strong>Breakdown:</strong>
                  <ul style={{ fontSize: '11px', paddingLeft: '12px' }}>
                    <li>Caption: {content.caption.length > 150 ? 'Too long' : 'Good length'}</li>
                    <li>Hashtags: {content.hashtags.length >= 5 ? 'Sufficient' : 'Add more'}</li>
                    <li>Colors: {content.colorPalette.every(c => c === content.colorPalette[0]) ? 'Low variety' : 'Good variety'}</li>
                    <li>Accessibility: {content.accessibilitySuggestions.length > 0 ? 'Issues detected' : 'Compliant'}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('quickFixes')}>
              Quick Fixes
              <span>{accordionOpen.includes('quickFixes') ? '−' : '+'}</span>
            </div>
            {accordionOpen.includes('quickFixes') && (
              <div className="accordion-content active">
                {content.quickFixes.map((fix, i) => (
                  <div key={i} className="recommendation-card">
                    <strong>{fix.issue}</strong>: {fix.suggestion}
                    {fix.action === 'applyText' && (
                      <button className="action-button" onClick={() => applyElement({ type: 'text', description: 'Text', placement: 'center' })}>
                        <Plus size={12} /> Apply
                      </button>
                    )}
                    {fix.action === 'applyColor' && (
                      <button className="action-button" onClick={() => copyText(content.colorPalette[1], 'Color')}>
                        <Copy size={12} /> Copy Color
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('content')}>
              Content Suggestions
              <span>{accordionOpen.includes('content') ? '−' : '+'}</span>
            </div>
            {accordionOpen.includes('content') && (
              <div className="accordion-content active">
                <div className="recommendation-card">
                  <strong>Multilingual Copy:</strong>
                  <select
                    className="dropdown"
                    value={selectedLanguage}
                    onChange={e => setSelectedLanguage(e.target.value)}
                  >
                    {content.multilingualContent.map(lang => (
                      <option key={lang.language} value={lang.language}>{lang.language}</option>
                    ))}
                  </select>
                </div>
                <div className="recommendation-card">
                  <strong>Caption:</strong> {content.multilingualContent.find(l => l.language === selectedLanguage)?.caption || content.caption}
                  <button className="action-button" onClick={() => copyText(content.multilingualContent.find(l => l.language === selectedLanguage)?.caption || content.caption, 'Caption')}>
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <div className="recommendation-card">
                  <strong>CTA:</strong> {content.multilingualContent.find(l => l.language === selectedLanguage)?.cta || content.cta}
                  <button className="action-button" onClick={() => copyText(content.multilingualContent.find(l => l.language === selectedLanguage)?.cta || content.cta, 'CTA')}>
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <div className="recommendation-card">
                  <strong>Hashtags:</strong> {content.hashtags.join(' ')}
                  <button className="action-button" onClick={() => copyText(content.hashtags.join(' '), 'Hashtags')}>
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('design')}>
              Design Suggestions
              <span>{accordionOpen.includes('design') ? '−' : '+'}</span>
            </div>
            {accordionOpen.includes('design') && (
              <div className="accordion-content active">
                <div className="recommendation-card">
                  <strong>Fonts:</strong> {content.fonts.join(', ')}
                </div>
                <div className="recommendation-card">
                  <strong>Color Palette:</strong>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {content.colorPalette.map((color, i) => (
                      <div
                        key={i}
                        className="tooltip"
                        style={{ width: '18px', height: '18px', backgroundColor: color, borderRadius: '4px', border: '1px solid #d1d5db', cursor: 'pointer' }}
                        onClick={() => copyText(color, 'Color')}
                      >
                        <span className="tooltip-text">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="recommendation-card">
                  <strong>Layout Tips:</strong>
                  <ul style={{ fontSize: '11px', paddingLeft: '12px' }}>
                    {content.layoutTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('accessibility')}>
              Accessibility Suggestions
              <span>{accordionOpen.includes('accessibility') ? '−' : '+'}</span>
            </div>
            {accordionOpen.includes('accessibility') && (
              <div className="accordion-content active">
                {content.accessibilitySuggestions.map((suggestion, i) => (
                  <div key={i} className="recommendation-card">
                    <strong>{suggestion.issue}</strong>: {suggestion.suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('templates')}>
              Template Suggestions
              <span>{accordionOpen.includes('templates') ? '−' : '+'}</span>
            </div>
            {accordionOpen.includes('templates') && (
              <div className="accordion-content active">
                {content.templateSuggestions.map((template, i) => (
                  <div key={i} className="recommendation-card">
                    <strong>{template.name}</strong>: {template.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'moodBoard' && (
        <div>
          <div className="preview-canvas">
            <div
              className="preview-text"
              style={{ background: content.moodBoard[0]?.color || '#f3f4f6', color: content.colorPalette[1] }}
            >
              {content.moodBoard[0]?.description || 'Mood Board Preview'}
            </div>
          </div>
          <div className="mood-board">
            {content.moodBoard.map((item, i) => (
              <div
                key={i}
                className="mood-item"
                style={{ background: item.color || '#f3f4f6' }}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', item.description)}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.description} />
                ) : (
                  <span>{item.description}</span>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
            Drag items to canvas or use Adobe Express library.
          </p>
        </div>
      )}

      {activeTab === 'trends' && (
        <div>
          {content.trends.map((trend, i) => (
            <div key={i} className="trend-item">
              <strong>{trend.hashtag}</strong>: {trend.description} (Popularity: {trend.popularity}%)
              <button className="action-button" onClick={() => copyText(trend.hashtag, 'Hashtag')}>
                <Copy size={12} /> Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div>
          <div className="recommendation-card">
            <strong>Share Design:</strong>
            <button className="action-button" onClick={exportSnapshot}>
              <Share2 size={12} /> Export Snapshot
            </button>
          </div>
          <div className="recommendation-card">
            <strong>Team Feedback:</strong>
            <textarea
              className="feedback-input"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Enter team feedback..."
            />
            <button
              className="action-button"
              onClick={() => {
                setFeedback('');
                onToast('Feedback saved! (Mock)', 'success');
              }}
            >
              <Plus size={12} /> Save Feedback
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          {content.analyticsSuggestions.map((analytics, i) => (
            <div key={i} className="recommendation-card">
              <strong>{analytics.platform}</strong>: {analytics.tip} ({analytics.postingTime})
            </div>
          ))}
        </div>
      )}

      {activeTab === 'export' && (
        <div>
          <div className="accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('export')}>
              Export Optimization
              <span>{accordionOpen.includes('export') ? '−' : '+'}</span>
            </div>
            {accordionOpen.includes('export') && (
              <div className="accordion-content active">
                {content.exportSuggestions.map((suggestion, i) => (
                  <div key={i} className="recommendation-card">
                    <strong>{suggestion.format} ({suggestion.useCase})</strong>: {suggestion.tip}
                    <button className="action-button" onClick={exportSnapshot}>
                      <Download size={12} /> Export as {suggestion.format}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'keywords' && (
        <div>
          <div className="recommendation-card">
            <strong>Keyword Input:</strong>
            <input
              className="keyword-input"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              placeholder="Enter product or theme..."
            />
            <button
              className="action-button"
              onClick={() => onToast('Keywords updated! (Mock)', 'success')}
            >
              <RefreshCcw size={12} /> Update Keywords
            </button>
          </div>
          {content.keywordSuggestions.map((keyword, i) => (
            <div key={i} className="recommendation-card">
              <strong>{keyword.keyword} ({keyword.relevance}%)</strong>: {keyword.suggestion}
              <button className="action-button" onClick={() => copyText(keyword.keyword, 'Keyword')}>
                <Copy size={12} /> Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreativeSparkPanel;