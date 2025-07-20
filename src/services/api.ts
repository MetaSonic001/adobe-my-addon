export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  tone: string;
  colorPalette: string[];
  fonts: string[];
  layoutSuggestions: string[];
}

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string, brandInfo?: string): Promise<GeneratedContent> {
    const systemPrompt = `You are an expert brand content creator. Generate social media content with:
    1. A catchy caption (max 150 chars)
    2. 5-8 relevant hashtags
    3. Content tone (fun/elegant/bold/professional)
    4. Color palette (5 hex codes)
    5. Font suggestions (3 font names)
    6. Layout ideas (3 brief descriptions)

    Brand context: ${brandInfo || 'General brand'}
    
    Respond in JSON format only:
    {
      "caption": "...",
      "hashtags": ["#tag1", "#tag2"],
      "tone": "...",
      "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
      "fonts": ["Font1", "Font2", "Font3"],
      "layoutSuggestions": ["layout1", "layout2", "layout3"]
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser request: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Clean and parse JSON response
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate content');
    }
  }
}