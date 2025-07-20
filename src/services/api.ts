export interface GeneratedContent {
  caption: string;
  layoutSuggestions?: string[];
  tone: string;
  cta: string;
  hashtags: string[];
  fonts: string[];
  colorPalette: string[];
  layoutTips: string[];
  accessibilitySuggestions: { issue: string; suggestion: string }[];
  quickFixes: { issue: string; suggestion: string; action?: string }[];
  freshIdeas: { description: string; content?: string }[];
  keywordSuggestions: { keyword: string; relevance: number; suggestion: string }[];
  trends: { hashtag: string; description: string; popularity: number }[];
  moodBoard: { description: string; imageUrl?: string; color?: string }[];
  analyticsSuggestions: { platform: string; tip: string; postingTime: string }[];
  exportSuggestions: { format: string; useCase: string; tip: string }[];
  multilingualContent: { language: string; caption: string; cta: string }[];
  brainstormIdeas?: { idea: string; description: string }[];
}

export class GroqService {
  private groqApiKey: string;
  private googleTranslateApiKey?: string;
  private unsplashApiKey?: string;

  constructor(groqApiKey: string, googleTranslateApiKey?: string, unsplashApiKey?: string) {
    this.groqApiKey = groqApiKey;
    this.googleTranslateApiKey = googleTranslateApiKey;
    this.unsplashApiKey = unsplashApiKey;
  }

  async generateContent(prompt: string, brandInfo: string): Promise<GeneratedContent> {
    const groqResponse = await this.fetchGroqContent(prompt, brandInfo);
    const trends = await this.fetchTrends(prompt);
    const multilingualContent = this.googleTranslateApiKey
      ? await this.fetchTranslations(groqResponse.caption, groqResponse.cta)
      : this.getFallbackTranslations(groqResponse.caption, groqResponse.cta);
    const moodBoard = this.unsplashApiKey ? await this.fetchMoodBoardImages(prompt) : this.getFallbackMoodBoard();
    const brainstormIdeas = await this.fetchBrainstormIdeas(prompt, brandInfo);
    const keywordSuggestions = await this.fetchKeywordSuggestions(prompt);

    return {
      caption: groqResponse.caption,
      tone: groqResponse.tone,
      cta: groqResponse.cta,
      hashtags: groqResponse.hashtags,
      fonts: groqResponse.fonts,
      colorPalette: groqResponse.colorPalette,
      layoutTips: groqResponse.layoutTips,
      accessibilitySuggestions: groqResponse.accessibilitySuggestions,
      quickFixes: groqResponse.quickFixes,
      freshIdeas: groqResponse.freshIdeas,
      analyticsSuggestions: groqResponse.analyticsSuggestions,
      exportSuggestions: groqResponse.exportSuggestions,
      trends,
      multilingualContent,
      moodBoard,
      brainstormIdeas,
      keywordSuggestions,
    };
  }
  private async fetchGroqContent(prompt: string, brandInfo: string): Promise<GeneratedContent> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: `You are a design assistant for Adobe Express. Generate content based on the prompt and brand info: ${brandInfo}` },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

      const content = data.choices[0].message.content;
      return {
        caption: content.split('\n')[0] || 'Sample caption',
        tone: 'Professional', // Add tone property
        cta: content.split('\n')[1] || 'Shop Now!',
        hashtags: ['#Design', '#AdobeExpress', '#Creative'],
        fonts: ['Roboto', 'Montserrat'],
        colorPalette: ['#1E40AF', '#FFFFFF', '#F59E0B'],
        layoutTips: ['Use high contrast', 'Balance text and visuals'],
        accessibilitySuggestions: [{ issue: 'Contrast', suggestion: 'Increase text-background contrast' }],
        quickFixes: [
          { issue: 'Text size', suggestion: 'Use larger fonts', action: 'applyText' },
          { issue: 'Color contrast', suggestion: 'Adjust colors', action: 'applyColor' },
        ],
        freshIdeas: [
          { description: 'Bold headline', content: 'Make it Pop!' },
          { description: 'Minimalist layout', content: 'Clean and simple design' },
        ],
        keywordSuggestions: [
          { keyword: 'design', relevance: 90, suggestion: 'Use for SEO' },
          { keyword: 'creative', relevance: 85, suggestion: 'Boost engagement' },
        ],
        trends: [
          { hashtag: '#Fallback', description: 'Default trend', popularity: 50 },
        ],
        moodBoard: [
          { description: 'Placeholder image', imageUrl: 'https://via.placeholder.com/100', color: '#f3f4f6' },
        ],
        analyticsSuggestions: [
          { platform: 'Instagram', tip: 'Post with vibrant colors', postingTime: '6 PM' },
        ],
        exportSuggestions: [
          { format: 'PNG', useCase: 'Social Media', tip: 'High resolution' },
        ],
        multilingualContent: [
          { language: 'English', caption: content.split('\n')[0] || 'Sample caption', cta: content.split('\n')[1] || 'Shop Now!' },
        ],
        brainstormIdeas: [
          { idea: 'Creative Concept', description: `Inspired by ${prompt}` },
        ],
      };
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        caption: 'Sample caption',
        tone: 'Professional', // Add tone property for fallback
        cta: 'Shop Now!',
        hashtags: ['#Design', '#AdobeExpress', '#Creative'],
        fonts: ['Roboto', 'Montserrat'],
        colorPalette: ['#1E40AF', '#FFFFFF', '#F59E0B'],
        layoutTips: ['Use high contrast', 'Balance text and visuals'],
        accessibilitySuggestions: [{ issue: 'Contrast', suggestion: 'Increase text-background contrast' }],
        quickFixes: [
          { issue: 'Text size', suggestion: 'Use larger fonts', action: 'applyText' },
          { issue: 'Color contrast', suggestion: 'Adjust colors', action: 'applyColor' },
        ],
        freshIdeas: [
          { description: 'Bold headline', content: 'Make it Pop!' },
          { description: 'Minimalist layout', content: 'Clean and simple design' },
        ],
        keywordSuggestions: [
          { keyword: 'design', relevance: 90, suggestion: 'Use for SEO' },
          { keyword: 'creative', relevance: 85, suggestion: 'Boost engagement' },
        ],
        trends: [
          { hashtag: '#Fallback', description: 'Default trend', popularity: 50 },
        ],
        moodBoard: [
          { description: 'Placeholder image', imageUrl: 'https://via.placeholder.com/100', color: '#f3f4f6' },
        ],
        analyticsSuggestions: [
          { platform: 'Instagram', tip: 'Post with vibrant colors', postingTime: '6 PM' },
        ],
        exportSuggestions: [
          { format: 'PNG', useCase: 'Social Media', tip: 'High resolution' },
        ],
        multilingualContent: [
          { language: 'English', caption: 'Sample caption', cta: 'Shop Now!' },
        ],
        brainstormIdeas: [
          { idea: 'Creative Concept', description: `Inspired by ${prompt}` },
        ],
      };
    }
  }

  private async fetchBrainstormIdeas(prompt: string, brandInfo: string): Promise<GeneratedContent['brainstormIdeas']> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: `You are a brainstorming assistant for Adobe Express. Generate creative ideas based on the prompt and brand info: ${brandInfo}` },
            { role: 'user', content: `Generate 3 creative design ideas for: ${prompt}` },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

      const content = data.choices[0].message.content.split('\n').filter((line: string) => line.trim());
      return content.map((line: string, i: number) => ({
        idea: `Idea ${i + 1}`,
        description: line || `Creative concept for ${prompt}`,
      })).slice(0, 3);
    } catch (error) {
      console.error('Groq Brainstorm API error:', error);
      return [
        { idea: 'Creative Concept', description: `Inspired by ${prompt}` },
      ];
    }
  }

  private async fetchKeywordSuggestions(prompt: string): Promise<GeneratedContent['keywordSuggestions']> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: 'You are an SEO expert for Adobe Express. Generate 5 SEO keyword suggestions based on the prompt.' },
            { role: 'user', content: `Generate SEO keywords for: ${prompt}` },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

      const content = data.choices[0].message.content.split('\n').filter((line: string) => line.trim());
      return content.map((line: string, i: number) => ({
        keyword: line.split(':')[0] || `keyword${i + 1}`,
        relevance: 80 + Math.floor(Math.random() * 20),
        suggestion: line.split(':')[1] || `Use for SEO optimization`,
      })).slice(0, 5);
    } catch (error) {
      console.error('Groq Keyword API error:', error);
      return [
        { keyword: 'design', relevance: 90, suggestion: 'Use for SEO' },
        { keyword: 'creative', relevance: 85, suggestion: 'Boost engagement' },
      ];
    }
  }

  private async fetchTrends(prompt: string): Promise<GeneratedContent['trends']> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: 'You are a social media trends analyst for Adobe Express. Generate 3 trending hashtags based on the prompt.' },
            { role: 'user', content: `Generate trending hashtags for: ${prompt}` },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

      const content = data.choices[0].message.content.split('\n').filter((line: string) => line.trim());
      return content.map((line: string, i: number) => ({
        hashtag: line.split(':')[0] || `#Trend${i + 1}`,
        description: line.split(':')[1] || 'Trending topic',
        popularity: 80 + Math.floor(Math.random() * 20),
      })).slice(0, 3);
    } catch (error) {
      console.error('Groq Trends API error:', error);
      return [
        { hashtag: '#Fallback', description: 'Default trend', popularity: 50 },
      ];
    }
  }

  private async fetchTranslations(caption: string, cta: string): Promise<GeneratedContent['multilingualContent']> {
    try {
      const languages = ['es', 'fr', 'de'];
      const translations = await Promise.all(
        languages.map(async lang => {
          const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.googleTranslateApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: [caption, cta],
              target: lang,
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error('Google Translate API error');
          return {
            language: lang === 'es' ? 'Spanish' : lang === 'fr' ? 'French' : 'German',
            caption: data.data.translations[0].translatedText,
            cta: data.data.translations[1].translatedText,
          };
        })
      );
      return [
        { language: 'English', caption, cta },
        ...translations,
      ];
    } catch (error) {
      console.error('Google Translate API error:', error);
      return [
        { language: 'English', caption, cta },
      ];
    }
  }

  private async fetchMoodBoardImages(prompt: string): Promise<GeneratedContent['moodBoard']> {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt)}&client_id=${this.unsplashApiKey}`);
      const data = await response.json();
      if (!response.ok) throw new Error('Unsplash API error');
      return data.results.slice(0, 3).map((img: any) => ({
        description: img.alt_description || 'Mood image',
        imageUrl: img.urls.small,
        color: img.color || '#f3f4f6',
      }));
    } catch (error) {
      console.error('Unsplash API error:', error);
      return this.getFallbackMoodBoard();
    }
  }

  private getFallbackMoodBoard(): GeneratedContent['moodBoard'] {
    return [
      { description: 'Placeholder image', imageUrl: 'https://via.placeholder.com/100', color: '#f3f4f6' },
    ];
  }

  private getFallbackTranslations(caption: string, cta: string): GeneratedContent['multilingualContent'] {
    return [
      { language: 'English', caption, cta },
    ];
  }
}