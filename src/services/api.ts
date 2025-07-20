import Groq from "groq-sdk";

export interface GeneratedContent {
  caption: string;
  layoutSuggestions?: string[];
  cta: string;
  hashtags: string[];
  tone: string;
  colorPalette: string[];
  fonts: string[];
  layoutTips: string[];
  designSuggestions: {
    visualStyle: string;
    elements: { type: string; description: string; placement: string }[];
  };
  moodBoard: { type: string; description: string; color?: string; imageUrl?: string }[];
  trends: { hashtag: string; description: string; popularity: number }[];
  quickFixes: { issue: string; suggestion: string; action?: string }[];
  accessibilitySuggestions: { issue: string; suggestion: string }[];
  templateSuggestions: { name: string; description: string }[];
  analyticsSuggestions: { platform: string; postingTime: string; tip: string }[];
  freshIdeas: { type: string; description: string; content?: string }[];
  exportSuggestions: { format: string; useCase: string; tip: string }[];
  keywordSuggestions: { keyword: string; relevance: number; suggestion: string }[];
  multilingualContent: { language: string; caption: string; cta: string }[];
}

export class GroqService {
  private groq: Groq;
  private maxRetries = 3;
  private baseDelay = 1000;
  private serpApiKey: string = 'YOUR_SERPAPI_KEY';
  private deeplApiKey: string = 'YOUR_DEEPL_API_KEY';
  private unsplashApiKey: string = 'YOUR_UNSPLASH_API_KEY';

  constructor(apiKey: string) {
    console.warn(
      'WARNING: Using dangerouslyAllowBrowser in a browser environment. ' +
      'This exposes your API key. Use a proxy server for production.'
    );
    this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }

  private async fetchTrends(query: string): Promise<{ hashtag: string; description: string; popularity: number }[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(query)}&api_key=${this.serpApiKey}`);
      const data = await response.json();
      return data.interest_over_time?.timeline_data?.slice(0, 3).map((item: any) => ({
        hashtag: `#${item.query.replace(/\s+/g, '')}`,
        description: `Trending topic: ${item.query}`,
        popularity: Math.min(100, Math.max(0, parseInt(item.values[0].value) || 80))
      })) || [];
    } catch (error) {
      console.error('SerpApi error:', error);
      return [
        { hashtag: '#SocialMedia', description: 'Trending for engagement', popularity: 80 },
        { hashtag: '#Brand', description: 'Popular for promotions', popularity: 70 },
        { hashtag: '#Creative', description: 'Rising in design', popularity: 60 }
      ];
    }
  }

  private async fetchTranslation(text: string, targetLang: string): Promise<string> {
    try {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: { 'Authorization': `DeepL-Auth-Key ${this.deeplApiKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `text=${encodeURIComponent(text)}&target_lang=${targetLang}`
      });
      const data = await response.json();
      return data.translations[0].text;
    } catch (error) {
      console.error('DeepL error:', error);
      return text;
    }
  }

  private async fetchUnsplashImages(query: string): Promise<{ description: string; imageUrl: string }[]> {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&client_id=${this.unsplashApiKey}`);
      const data = await response.json();
      return data.results.map((item: any) => ({
        description: item.alt_description || 'Inspirational image',
        imageUrl: item.urls.small
      }));
    } catch (error) {
      console.error('Unsplash error:', error);
      return [];
    }
  }

  private extractJSONFromResponse(content: string): string {
    let cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    return cleanContent;
  }

  private validateGeneratedContent(content: any, trends: any[], images: any[]): GeneratedContent {
    const validated: GeneratedContent = {
      caption: content.caption || "Engage your audience now!",
      cta: content.cta || "Shop Now!",
      hashtags: Array.isArray(content.hashtags) ? content.hashtags : ["#content", "#social"],
      tone: content.tone || "professional",
      colorPalette: Array.isArray(content.colorPalette) ? content.colorPalette : ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"],
      fonts: Array.isArray(content.fonts) ? content.fonts : ["Montserrat", "Lora", "Roboto"],
      layoutTips: Array.isArray(content.layoutTips) ? content.layoutTips : [
        "Center focal text for impact",
        "Add white space for clarity",
        "Use bold typography for emphasis"
      ],
      designSuggestions: content.designSuggestions || {
        visualStyle: "modern",
        elements: [
          { type: "text", description: "Bold headline", placement: "center" },
          { type: "shape", description: "Decorative circle", placement: "top-right" },
          { type: "icon", description: "Brand icon", placement: "bottom-left" }
        ]
      },
      moodBoard: Array.isArray(content.moodBoard) ? content.moodBoard : [
        { type: "color", description: "Primary color", color: "#3B82F6" },
        { type: "color", description: "Accent color", color: "#EF4444" },
        ...images.map(img => ({ type: "image", description: img.description, imageUrl: img.imageUrl }))
      ],
      trends: trends.length > 0 ? trends : [
        { hashtag: "#SocialMedia", description: "Trending for engagement", popularity: 80 },
        { hashtag: "#Brand", description: "Popular for promotions", popularity: 70 }
      ],
      quickFixes: Array.isArray(content.quickFixes) ? content.quickFixes : [
        { issue: "Cluttered layout", suggestion: "Remove 2-3 elements", action: "applyLayout" },
        { issue: "Low contrast", suggestion: "Use darker text", action: "applyColor" }
      ],
      accessibilitySuggestions: Array.isArray(content.accessibilitySuggestions) ? content.accessibilitySuggestions : [
        { issue: "Low contrast", suggestion: "Ensure text-background contrast meets WCAG 4.5:1" },
        { issue: "Small font", suggestion: "Use font size ≥14px for readability" }
      ],
      templateSuggestions: Array.isArray(content.templateSuggestions) ? content.templateSuggestions : [
        { name: "Bold Promo", description: "Vibrant layout for ads" },
        { name: "Minimal Flyer", description: "Clean design for events" }
      ],
      analyticsSuggestions: Array.isArray(content.analyticsSuggestions) ? content.analyticsSuggestions : [
        { platform: "Instagram", postingTime: "6 PM", tip: "Post in evening for max engagement" },
        { platform: "Twitter", postingTime: "12 PM", tip: "Tweet at noon for visibility" }
      ],
      freshIdeas: Array.isArray(content.freshIdeas) ? content.freshIdeas : [
        { type: "text", description: "Headline", content: "Welcome to our brand!" },
        { type: "shape", description: "Background shape" }
      ],
      exportSuggestions: Array.isArray(content.exportSuggestions) ? content.exportSuggestions : [
        { format: "PNG", useCase: "Social Media", tip: "Use PNG for transparent backgrounds" },
        { format: "PDF", useCase: "Print", tip: "Use PDF for high-quality prints" }
      ],
      keywordSuggestions: Array.isArray(content.keywordSuggestions) ? content.keywordSuggestions : [
        { keyword: "brand", relevance: 90, suggestion: "Use in headline for SEO" },
        { keyword: "creative", relevance: 80, suggestion: "Add to caption for engagement" }
      ],
      multilingualContent: Array.isArray(content.multilingualContent) ? content.multilingualContent : [
        { language: "English", caption: "Engage your audience!", cta: "Shop Now!" },
        { language: "Spanish", caption: "¡Conecta con tu audiencia!", cta: "¡Compra ahora!" },
        { language: "French", caption: "Engagez votre public !", cta: "Achetez maintenant !" }
      ]
    };

    validated.hashtags = validated.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    validated.colorPalette = validated.colorPalette.map(color => 
      color.match(/^#[0-9A-Fa-f]{6}$/) ? color : "#3B82F6"
    );

    return validated;
  }

  async generateContent(prompt: string, brandInfo?: string): Promise<GeneratedContent> {
    const systemPrompt = `You are an expert content creator, design consultant, and marketing specialist. Respond ONLY with valid JSON, no additional text.

Generate social media content for Adobe Express with:
- caption: Catchy caption (max 150 characters)
- cta: Call-to-action phrase (max 50 characters)
- hashtags: 5-8 relevant hashtags (include #)
- tone: One word (fun/elegant/bold/professional/friendly)
- colorPalette: 5 hex color codes (#RRGGBB)
- fonts: 3 font names
- layoutTips: 3 layout improvement tips
- designSuggestions: Object with:
  - visualStyle: One word (modern/minimal/vibrant/elegant)
  - elements: 3 objects (type: text/shape/icon, description, placement: top-left/top-right/center/bottom-left/bottom-right)
- moodBoard: 3 objects (type: color/icon/image, description, color for colors, imageUrl for images)
- trends: 3 objects (hashtag, description, popularity: 0-100)
- quickFixes: 3 objects (issue, suggestion, action: applyLayout/applyColor/applyText)
- accessibilitySuggestions: 2 objects (issue, suggestion for WCAG compliance)
- templateSuggestions: 2 objects (name, description)
- analyticsSuggestions: 2 objects (platform, postingTime, tip)
- freshIdeas: 2 objects (type: text/shape/icon, description, content for text)
- exportSuggestions: 2 objects (format, useCase, tip)
- keywordSuggestions: 3 objects (keyword, relevance: 0-100, suggestion)
- multilingualContent: 3 objects (language: English/Spanish/French/Hindi, caption, cta)

Brand context: ${brandInfo || 'General brand'}

Example:
{
  "caption": "Boost your brand!",
  "cta": "Shop Now!",
  "hashtags": ["#Brand", "#Social", "#Creative"],
  "tone": "bold",
  "colorPalette": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"],
  "fonts": ["Montserrat", "Lora", "Roboto"],
  "layoutTips": ["Center text", "Add white space", "Bold typography"],
  "designSuggestions": {
    "visualStyle": "modern",
    "elements": [
      {"type": "text", "description": "Bold headline", "placement": "center"},
      {"type": "shape", "description": "Circle", "placement": "top-right"},
      {"type": "icon", "description": "Brand icon", "placement": "bottom-left"}
    ]
  },
  "moodBoard": [
    {"type": "color", "description": "Primary color", "color": "#FF0000"},
    {"type": "icon", "description": "Minimalist icon"},
    {"type": "image", "description": "Product image", "imageUrl": "https://images.unsplash.com/photo-123456"}
  ],
  "trends": [
    {"hashtag": "#SocialMedia", "description": "Trending for engagement", "popularity": 80},
    {"hashtag": "#Brand", "description": "Popular for promotions", "popularity": 70},
    {"hashtag": "#Creative", "description": "Rising in design", "popularity": 60}
  ],
  "quickFixes": [
    {"issue": "Cluttered layout", "suggestion": "Remove 2-3 elements", "action": "applyLayout"},
    {"issue": "Low contrast", "suggestion": "Use darker text", "action": "applyColor"},
    {"issue": "Weak CTA", "suggestion": "Add urgent CTA", "action": "applyText"}
  ],
  "accessibilitySuggestions": [
    {"issue": "Low contrast", "suggestion": "Ensure text-background contrast meets WCAG 4.5:1"},
    {"issue": "Small font", "suggestion": "Use font size ≥14px for readability"}
  ],
  "templateSuggestions": [
    {"name": "Bold Promo", "description": "Vibrant layout for ads"},
    {"name": "Minimal Flyer", "description": "Clean design for events"}
  ],
  "analyticsSuggestions": [
    {"platform": "Instagram", "postingTime": "6 PM", "tip": "Post in evening for max engagement"},
    {"platform": "Twitter", "postingTime": "12 PM", "tip": "Tweet at noon for visibility"}
  ],
  "freshIdeas": [
    {"type": "text", "description": "Headline", "content": "Welcome to our brand!"},
    {"type": "shape", "description": "Background shape"}
  ],
  "exportSuggestions": [
    {"format": "PNG", "useCase": "Social Media", "tip": "Use PNG for transparent backgrounds"},
    {"format": "PDF", "useCase": "Print", "tip": "Use PDF for high-quality prints"}
  ],
  "keywordSuggestions": [
    {"keyword": "brand", "relevance": 90, "suggestion": "Use in headline for SEO"},
    {"keyword": "creative", "relevance": 80, "suggestion": "Add to caption for engagement"}
  ],
  "multilingualContent": [
    {"language": "English", "caption": "Engage your audience!", "cta": "Shop Now!"},
    {"language": "Spanish", "caption": "¡Conecta con tu audiencia!", "cta": "¡Compra ahora!"},
    {"language": "French", "caption": "Engagez votre public !", "cta": "Achetez maintenant !"}
  ]
}`;

    const trends = await this.fetchTrends(prompt);
    const images = await this.fetchUnsplashImages(prompt);
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Generating content...`);
        
        const completion = await this.groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from API');
        }

        const cleanContent = this.extractJSONFromResponse(content);
        let parsedContent;
        try {
          parsedContent = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Invalid JSON format: ${cleanContent.substring(0, 100)}...`);
        }

        const multilingualContent = [
          { language: "English", caption: parsedContent.caption || "Engage your audience!", cta: parsedContent.cta || "Shop Now!" },
          { language: "Spanish", caption: await this.fetchTranslation(parsedContent.caption || "Engage your audience!", "ES"), cta: await this.fetchTranslation(parsedContent.cta || "Shop Now!", "ES") },
          { language: "French", caption: await this.fetchTranslation(parsedContent.caption || "Engage your audience!", "FR"), cta: await this.fetchTranslation(parsedContent.cta || "Shop Now!", "FR") },
          { language: "Hindi", caption: await this.fetchTranslation(parsedContent.caption || "Engage your audience!", "HI"), cta: await this.fetchTranslation(parsedContent.cta || "Shop Now!", "HI") }
        ];

        const validatedContent = this.validateGeneratedContent(parsedContent, trends, images);
        validatedContent.multilingualContent = multilingualContent;
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
          console.warn('All attempts failed, returning fallback content');
          return this.getFallbackContent(prompt);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return this.getFallbackContent(prompt);
  }

  private getFallbackContent(prompt: string): GeneratedContent {
    return {
      caption: `Check out our ${prompt.split(' ').slice(0, 3).join(' ')}! ✨`,
      cta: "Learn More!",
      hashtags: ["#brand", "#content", "#social", "#marketing", "#creative"],
      tone: "professional",
      colorPalette: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"],
      fonts: ["Montserrat", "Lora", "Roboto"],
      layoutTips: [
        "Center focal text for impact",
        "Add white space for clarity",
        "Use bold typography for emphasis"
      ],
      designSuggestions: {
        visualStyle: "modern",
        elements: [
          { type: "text", description: "Bold headline", placement: "center" },
          { type: "shape", description: "Decorative circle", placement: "top-right" },
          { type: "icon", description: "Brand icon", placement: "bottom-left" }
        ]
      },
      moodBoard: [
        { type: "color", description: "Primary color", color: "#3B82F6" },
        { type: "color", description: "Accent color", color: "#EF4444" },
        { type: "image", description: "Inspirational image", imageUrl: "https://images.unsplash.com/photo-123456" }
      ],
      trends: [
        { hashtag: "#SocialMedia", description: "Trending for engagement", popularity: 80 },
        { hashtag: "#Brand", description: "Popular for promotions", popularity: 70 },
        { hashtag: "#Creative", description: "Rising in design", popularity: 60 }
      ],
      quickFixes: [
        { issue: "Cluttered layout", suggestion: "Remove 2-3 elements", action: "applyLayout" },
        { issue: "Low contrast", suggestion: "Use darker text", action: "applyColor" }
      ],
      accessibilitySuggestions: [
        { issue: "Low contrast", suggestion: "Ensure text-background contrast meets WCAG 4.5:1" },
        { issue: "Small font", suggestion: "Use font size ≥14px for readability" }
      ],
      templateSuggestions: [
        { name: "Bold Promo", description: "Vibrant layout for ads" },
        { name: "Minimal Flyer", description: "Clean design for events" }
      ],
      analyticsSuggestions: [
        { platform: "Instagram", postingTime: "6 PM", tip: "Post in evening for max engagement" },
        { platform: "Twitter", postingTime: "12 PM", tip: "Tweet at noon for visibility" }
      ],
      freshIdeas: [
        { type: "text", description: "Headline", content: "Welcome to our brand!" },
        { type: "shape", description: "Background shape" }
      ],
      exportSuggestions: [
        { format: "PNG", useCase: "Social Media", tip: "Use PNG for transparent backgrounds" },
        { format: "PDF", useCase: "Print", tip: "Use PDF for high-quality prints" }
      ],
      keywordSuggestions: [
        { keyword: "brand", relevance: 90, suggestion: "Use in headline for SEO" },
        { keyword: "creative", relevance: 80, suggestion: "Add to caption for engagement" }
      ],
      multilingualContent: [
        { language: "English", caption: "Engage your audience!", cta: "Shop Now!" },
        { language: "Spanish", caption: "¡Conecta con tu audiencia!", cta: "¡Compra ahora!" },
        { language: "French", caption: "Engagez votre public !", cta: "Achetez maintenant !" }
      ]
    };
  }
}