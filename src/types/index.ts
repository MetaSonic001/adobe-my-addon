export interface BrandSettings {
  apiKey: string;
  brandInfo: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface DesignElement {
  type: 'text' | 'rectangle' | 'ellipse' | 'image';
  content?: string;
  style: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    width?: number;
    height?: number;
    opacity?: number;
  };
  position: {
    x: number;
    y: number;
  };
}