import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { GeneratedContent } from './api';

export class DesignService {
  private addOnUISdk: AddOnSDKAPI;

  constructor(addOnUISdk: AddOnSDKAPI) {
    this.addOnUISdk = addOnUISdk;
  }

  async createDesign(content: GeneratedContent, layoutIndex: number = 0): Promise<void> {
    const { caption, colorPalette, fonts } = content;
    const doc = this.addOnUISdk.app.document as any;

    try {
      // Create text element with caption
      await doc.addText({
        text: caption,
        fontSize: 24,
        fontFamily: fonts[0] || 'Arial',
        color: { hex: colorPalette[0] || '#000000' },
        position: { x: 50, y: 100 }
      });

      // Add background rectangle with brand color
      await doc.addRectangle({
        width: 300,
        height: 200,
        color: { hex: colorPalette[1] || '#f0f0f0' },
        position: { x: 25, y: 25 }
      });

      // Add accent elements based on layout
      await this.createLayoutElements(content, layoutIndex);

    } catch (error) {
      console.error('Design creation error:', error);
      throw new Error('Failed to create design');
    }
  }

  private async createLayoutElements(content: GeneratedContent, layoutIndex: number): Promise<void> {
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
      color: { hex: content.colorPalette[2] },
      position: { x: 75, y: 180 }
    });
  }

  private async createBoldLayout(content: GeneratedContent): Promise<void> {
    const doc = this.addOnUISdk.app.document as any;

    // Bold design with shapes
    await doc.addEllipse({
      width: 80,
      height: 80,
      color: { hex: content.colorPalette[3] },
      position: { x: 250, y: 50 }
    });
  }

  private async createElegantLayout(content: GeneratedContent): Promise<void> {
    const doc = this.addOnUISdk.app.document as any;

    // Elegant design with gradients
    await doc.addRectangle({
      width: 100,
      height: 150,
      color: { hex: content.colorPalette[4] },
      position: { x: 225, y: 75 },
      opacity: 0.7
    });
  }
}
