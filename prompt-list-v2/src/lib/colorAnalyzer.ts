export interface ColorProfile {
  dominantHex: string;
  paletteHexes: string[];
  colorNames: string[];
  spectrumHues: number[];
  isDark: boolean;
  isLight: boolean;
  isMonochrome: boolean;
}

// Convert RGB to HSL (Hue: 0-360, Saturation: 0-100, Lightness: 0-100)
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert Hex string to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.min(255, Math.max(0, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

// Classify an HSL pixel into standard spectrum labels
function classifyHslToName(h: number, s: number, l: number): string | null {
  if (l <= 18 || (l <= 25 && s <= 25)) return 'Dark & Noir';
  if (l >= 85) return 'Clean White & Light';
  if (s <= 15) return 'Monochrome & Grayscale';

  if (h >= 345 || h < 15) return 'Red & Crimson';
  if (h >= 15 && h < 42) return 'Orange & Sunset';
  if (h >= 42 && h < 68) return 'Yellow & Gold';
  if (h >= 68 && h < 172) return 'Green & Emerald';
  if (h >= 172 && h < 262) return 'Blue & Cyan';
  if (h >= 262 && h < 315) return 'Purple & Violet';
  if (h >= 315 && h < 345) return 'Pink & Rose';
  return null;
}

// Extract rich color palette and spectrum classification from any image URL or Blob URL via HTML5 Canvas
export async function extractImagePalette(imageSrc: string): Promise<ColorProfile> {
  return new Promise((resolve) => {
    const defaultProfile: ColorProfile = {
      dominantHex: '#3b82f6',
      paletteHexes: ['#3b82f6', '#1e293b', '#f8fafc'],
      colorNames: ['Blue & Cyan', 'Dark & Noir', 'Clean White & Light'],
      spectrumHues: [210],
      isDark: false,
      isLight: false,
      isMonochrome: false,
    };

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Scale down to 80x80 for lightning speed computation ($0 cost, <30ms) while preserving color statistical distribution
        canvas.width = 80;
        canvas.height = 80;
        ctx?.drawImage(img, 0, 0, 80, 80);

        const imgData = ctx?.getImageData(0, 0, 80, 80).data;
        if (!imgData) return resolve(defaultProfile);

        const categoryCounts: Record<string, number> = {};
        const colorBuckets: Record<string, { r: number; g: number; b: number; count: number; h: number }> = {};
        const allHues: number[] = [];
        let darkCount = 0;
        let lightCount = 0;
        let monoCount = 0;
        let totalPixels = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Skip transparency
          totalPixels++;

          const hsl = rgbToHsl(r, g, b);
          allHues.push(hsl.h);

          // Track luminosity & neutrality
          if (hsl.l <= 20) darkCount++;
          if (hsl.l >= 82) lightCount++;
          if (hsl.s <= 15) monoCount++;

          // Classify color name
          const catName = classifyHslToName(hsl.h, hsl.s, hsl.l);
          if (catName) {
            categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
          }

          // Quantize to color swatches (round color values by grid of 32 to find dominant palette swatches)
          const bucketKey = `${Math.round(r / 32) * 32}_${Math.round(g / 32) * 32}_${Math.round(b / 32) * 32}`;
          if (!colorBuckets[bucketKey]) {
            colorBuckets[bucketKey] = { r, g, b, count: 0, h: hsl.h };
          }
          colorBuckets[bucketKey].count++;
        }

        // Filter color categories present in at least 3.5% of total pixels
        const validColorNames = Object.entries(categoryCounts)
          .filter(([_, count]) => count / totalPixels >= 0.035)
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name);

        // Get top 6 distinct dominant hex colors
        const sortedBuckets = Object.values(colorBuckets)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const paletteHexes = sortedBuckets.map(b => rgbToHex(b.r, b.g, b.b));
        const dominantHex = paletteHexes[0] || '#3b82f6';
        const spectrumHues = sortedBuckets.map(b => b.h);

        resolve({
          dominantHex,
          paletteHexes,
          colorNames: validColorNames.length > 0 ? validColorNames : ['Blue & Cyan', 'Dark & Noir'],
          spectrumHues,
          isDark: darkCount / totalPixels > 0.5,
          isLight: lightCount / totalPixels > 0.4,
          isMonochrome: monoCount / totalPixels > 0.6,
        });
      } catch (e) {
        // Fallback if CORS prevents pixel inspection on specific servers without proxy
        console.warn("Canvas analysis CORS warning, resorting to clean fallback palette:", e);
        resolve(defaultProfile);
      }
    };

    img.onerror = () => {
      resolve(defaultProfile);
    };

    img.src = imageSrc;
  });
}

// Calculate if an image profile matches a search color (either preset category name or exact hex from color picker)
export function matchesColorFilter(filterValue: string, profile?: ColorProfile, fallbackText?: string, filterKeywords: string[] = []): boolean {
  if (!filterValue || filterValue === 'All') return true;

  // 1. If filterValue is a standard Category Name (e.g., "Red & Crimson", "Blue & Cyan", "Dark & Noir")
  if (!filterValue.startsWith('#')) {
    if (profile?.colorNames && profile.colorNames.includes(filterValue)) {
      return true;
    }
    // Check fallback text keywords if older post lacks profile
    if (fallbackText && filterKeywords.length > 0) {
      const lower = fallbackText.toLowerCase();
      if (filterKeywords.some(kw => lower.includes(kw.toLowerCase()))) return true;
    }
    // Secondary matching: if filtering for Dark/Light
    if (filterValue === 'Dark & Noir' && profile?.isDark) return true;
    if (filterValue === 'Clean White & Light' && profile?.isLight) return true;
    if (filterValue === 'Monochrome & Grayscale' && profile?.isMonochrome) return true;

    return false;
  }

  // 2. If filterValue is a Hex code from our Full-Spectrum Custom Color Picker (e.g. #ff007f)
  const targetRgb = hexToRgb(filterValue);
  if (!targetRgb) return true;
  const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);

  if (!profile || !profile.paletteHexes || profile.paletteHexes.length === 0) {
    // If post has no color profile yet, permit or match text fallback
    return true;
  }

  // Compare Target HSL against each extracted color in the image's palette
  for (const hex of profile.paletteHexes) {
    const pRgb = hexToRgb(hex);
    if (!pRgb) continue;
    const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);

    // Calculate Hue distance (accounting for circular 360 degree spectrum)
    let hueDelta = Math.abs(targetHsl.h - pHsl.h);
    if (hueDelta > 180) hueDelta = 360 - hueDelta;

    // If both colors are neutral dark/light/monochrome, compare lightness and saturation
    if (targetHsl.s < 20 || pHsl.s < 20 || targetHsl.l < 20 || targetHsl.l > 82 || pHsl.l < 20 || pHsl.l > 82) {
      const lightnessDelta = Math.abs(targetHsl.l - pHsl.l);
      const satDelta = Math.abs(targetHsl.s - pHsl.s);
      if (lightnessDelta <= 25 && satDelta <= 25) return true;
    }

    // Standard spectrum hue matching (within a 32-degree hue radius across the color circle)
    if (hueDelta <= 32 && Math.abs(targetHsl.l - pHsl.l) <= 45) {
      return true;
    }
  }

  // Check general category alignment for custom hex
  const targetCategory = classifyHslToName(targetHsl.h, targetHsl.s, targetHsl.l);
  if (targetCategory && profile.colorNames?.includes(targetCategory)) {
    return true;
  }

  return false;
}
