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

  private extractJSONFromResponse(content: string): string {
    // Remove markdown code blocks
    let cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Try to find JSON object boundaries
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    
    return cleanContent;
  }

  private validateGeneratedContent(content: any): GeneratedContent {
    // Provide defaults for missing fields
    const validated: GeneratedContent = {
      caption: content.caption || "Generated content caption",
      hashtags: Array.isArray(content.hashtags) ? content.hashtags : ["#content", "#social"],
      tone: content.tone || "professional",
      colorPalette: Array.isArray(content.colorPalette) ? content.colorPalette : ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"],
      fonts: Array.isArray(content.fonts) ? content.fonts : ["Arial", "Helvetica", "Georgia"],
      layoutSuggestions: Array.isArray(content.layoutSuggestions) ? content.layoutSuggestions : ["Centered text layout", "Image with text overlay", "Split layout with text and image"]
    };

    // Ensure hashtags start with #
    validated.hashtags = validated.hashtags.map(tag => 
      tag.startsWith('#') ? tag : `#${tag}`
    );

    // Ensure color palette has valid hex codes
    validated.colorPalette = validated.colorPalette.map(color => {
      if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
        return color;
      }
      // Return a default color if invalid
      return "#3B82F6";
    });

    return validated;
  }

  async generateContent(prompt: string, brandInfo?: string): Promise<GeneratedContent> {
    const systemPrompt = `You are an expert brand content creator. You MUST respond ONLY with valid JSON, no additional text before or after.

Generate social media content with these exact fields:
- caption: A catchy caption (max 150 characters)
- hashtags: Array of 5-8 relevant hashtags (include # symbol)
- tone: Content tone (one word: fun/elegant/bold/professional/friendly)
- colorPalette: Array of exactly 5 hex color codes (format: #RRGGBB)
- fonts: Array of exactly 3 font names
- layoutSuggestions: Array of exactly 3 brief layout descriptions

Brand context: ${brandInfo || 'General brand'}

IMPORTANT: Respond with ONLY the JSON object, no explanatory text:

{
  "caption": "Your caption here",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "tone": "professional",
  "colorPalette": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"],
  "fonts": ["Arial", "Helvetica", "Georgia"],
  "layoutSuggestions": ["Layout 1", "Layout 2", "Layout 3"]
}`;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Generating content...`);
        
        const completion = await this.groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.3, // Lower temperature for more consistent JSON output
          max_tokens: 800,
          response_format: { type: "json_object" } // Force JSON output if supported
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from API');
        }

        console.log('Raw API response:', content);

        // Extract and clean JSON
        const cleanContent = this.extractJSONFromResponse(content);
        console.log('Cleaned content:', cleanContent);

        let parsedContent;
        try {
          parsedContent = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Invalid JSON format: ${cleanContent.substring(0, 100)}...`);
        }

        // Validate and return content with defaults for missing fields
        const validatedContent = this.validateGeneratedContent(parsedContent);
        console.log('Validated content:', validatedContent);
        
        return validatedContent;

      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (error.response?.status === 429) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          console.warn(`Rate limited, retrying after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (attempt === this.maxRetries) {
          // Return fallback content instead of throwing
          console.warn('All attempts failed, returning fallback content');
          return this.getFallbackContent(prompt);
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // This should never be reached, but just in case
    return this.getFallbackContent(prompt);
  }

  private getFallbackContent(prompt: string): GeneratedContent {
    return {
      caption: `Check out our amazing ${prompt.split(' ').slice(0, 3).join(' ')}! ✨`,
      hashtags: ["#brand", "#content", "#social", "#marketing", "#creative"],
      tone: "professional",
      colorPalette: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"],
      fonts: ["Arial", "Helvetica", "Georgia"],
      layoutSuggestions: [
        "Centered text with brand logo",
        "Split layout with image and text",
        "Minimalist design with bold typography"
      ]
    };
  }
}