import { HSV } from './types';

export const hexToHsv = (hex: string): HSV => {
  let r = 0, g = 0, b = 0;
  // Strip hash
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  
  r /= 255; g /= 255; b /= 255;
  
  let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
  let h = 0, s = 0, v = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  v = cmax;
  s = cmax === 0 ? 0 : delta / cmax;

  return { h, s: s * 100, v: v * 100 };
};

export const hsvToHex = (h: number, s: number, v: number): string => {
  s /= 100;
  v /= 100;
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const extractColorsFromImage = (imageSrc: string, colorCount: number = 16): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No context');

      // Resize to speed up processing (max 100px dim)
      const scale = Math.min(100 / img.width, 100 / img.height, 1);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      const colorMap = new Map<string, number>();
      
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        
        if (a < 128) continue; // Skip transparent
        
        // Quantize to reduce noise (grouping similar colors)
        const qr = Math.round(r / 20) * 20;
        const qg = Math.round(g / 20) * 20;
        const qb = Math.round(b / 20) * 20;
        
        // Ensure values are 0-255
        const fr = Math.min(255, Math.max(0, qr));
        const fg = Math.min(255, Math.max(0, qg));
        const fb = Math.min(255, Math.max(0, qb));

        // Use helper logic or standard way to hex
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        const hex = `#${toHex(fr)}${toHex(fg)}${toHex(fb)}`;
        
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
      
      // Sort by frequency
      const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
      const topColors = sorted.slice(0, colorCount).map(k => k[0]);
      resolve(topColors);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};