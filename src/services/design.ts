import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

export interface GeneratedContent {
  brandInfo?: string[];
  caption: string;
  colorPalette: string[];
  fonts: string[];
  layoutSuggestions: string[];
}

export class DesignService {
  private addOnUISdk: AddOnSDKAPI;

  constructor(addOnUISdk: AddOnSDKAPI) {
    this.addOnUISdk = addOnUISdk;
  }

  async createDesign(content: GeneratedContent, layoutIndex: number = 0): Promise<void> {
    const { caption, colorPalette, fonts, layoutSuggestions } = content;
    const doc = this.addOnUISdk.app.document as any;

    try {
      // Apply a template based on layout suggestion
      await this.applyTemplate(layoutSuggestions[layoutIndex] || 'minimal');

      // Add text element with caption
      await doc.addText({
        text: caption,
        fontSize: 24,
        fontFamily: fonts[0] || 'Arial',
        color: { hex: colorPalette[0] || '#000000' },
        position: { x: 50, y: 100 },
        textAlign: 'center'
      });

      // Add background with gradient from color palette
      await doc.addRectangle({
        width: 1080, // Standard Instagram post size
        height: 1080,
        fill: {
          type: 'gradient',
          gradientType: 'linear',
          colors: [
            { color: { hex: colorPalette[1] || '#f0f0f0' }, offset: 0 },
            { color: { hex: colorPalette[2] || '#ffffff' }, offset: 1 }
          ]
        },
        position: { x: 0, y: 0 }
      });

      // Add layout-specific elements
      await this.createLayoutElements(content, layoutIndex);

      // Add brand logo or image (if available in brandInfo)
      if (content.brandInfo?.includes('logo')) {
        await doc.addImage({
          url: 'https://example.com/brand-logo.png', // Replace with dynamic logo URL
          width: 100,
          height: 100,
          position: { x: 50, y: 50 }
        });
      }
    } catch (error) {
      console.error('Design creation error:', error);
      throw new Error('Failed to create design');
    }
  }

  private async applyTemplate(layout: string): Promise<void> {
    const doc = this.addOnUISdk.app.document as any;
    const templates = {
      minimal: { id: 'minimal-template-id' },
      bold: { id: 'bold-template-id' },
      elegant: { id: 'elegant-template-id' }
    };

    const templateId = templates[layout.toLowerCase()]?.id || templates.minimal.id;
    try {
      await doc.applyTemplate({ templateId }); // Assumes Adobe Express SDK supports templates
    } catch (error) {
      console.warn('Template application failed, using default canvas:', error);
    }
  }

  private async createLayoutElements(content: GeneratedContent, layoutIndex: number): Promise<void> {
    const doc = this.addOnUISdk.app.document as any;
    const layouts = [
      () => this.createMinimalLayout(content),
      () => this.createBoldLayout(content),
      () => this.createElegantLayout(content)
    ];

    if (layouts[layoutIndex]) {
      await layouts[layoutIndex]();
    }
  }

  private async createMinimalLayout(content: GeneratedContent): Promise<void> {
    const doc = this.addOnUISdk.app.document as any;

    // Minimal design with clean lines
    await doc.addRectangle({
      width: 200,
      height: 4,
      color: { hex: content.colorPalette[2] || '#3498db' },
      position: { x: 440, y: 180 } // Centered for 1080x1080 canvas
    });
  }

  private async createBoldLayout(content: GeneratedContent): Promise<void> {
    const doc = this.addOnUISdk.app.document as any;

    // Bold design with shapes
    await doc.addEllipse({
      width: 80,
      height: 80,
      color: { hex: content.colorPalette[3] || '#e74c3c' },
      position: { x: 980, y: 50 } // Adjusted for 1080x1080 canvas
    });
  }

  private async createElegantLayout(content: GeneratedContent): Promise<void> {
    const doc = this.addOnUISdk.app.document as any;

    // Elegant design with gradients
    await doc.addRectangle({
      width: 100,
      height: 150,
      color: { hex: content.colorPalette[4] || '#9b59b6' },
      position: { x: 955, y: 75 }, // Adjusted for 1080x1080 canvas
      opacity: 0.7
    });
  }
}