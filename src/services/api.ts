import Groq from "groq-sdk";

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  tone: string;
  colorPalette: string[];
  fonts: string[];
  layoutSuggestions: string[];
}

export class GroqService {
  private groq: Groq;
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second

  constructor(apiKey: string) {
    console.warn(
      'WARNING: Using dangerouslyAllowBrowser in a browser environment. ' +
      'This exposes your API key. Use a proxy server for production.'
    );
    this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
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

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const completion = await this.groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Invalid API response format');
        }

        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const parsedContent = JSON.parse(cleanContent);

        // Validate response structure
        if (
          !parsedContent.caption ||
          !Array.isArray(parsedContent.hashtags) ||
          !parsedContent.tone ||
          !Array.isArray(parsedContent.colorPalette) ||
          !Array.isArray(parsedContent.fonts) ||
          !Array.isArray(parsedContent.layoutSuggestions)
        ) {
          throw new Error('Invalid content structure in API response');
        }

        return parsedContent;
      } catch (error: any) {
        if (error.response?.status === 429) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          console.warn(`429 error, retrying after ${delay}ms (attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to generate content after ${this.maxRetries} attempts: ${error.message}`);
        }
      }
    }
    throw new Error('Unexpected error: retries exhausted');
  }
}