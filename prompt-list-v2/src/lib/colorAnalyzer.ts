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
  if (l <= 15 || (l <= 22 && s <= 20)) return 'Dark & Noir';
  if (l >= 88 && s <= 20) return 'Clean White & Light';
  if (s <= 12 && l > 15 && l < 88) return 'Monochrome & Grayscale';

  if (h >= 345 || h < 14) return 'Red & Crimson';
  if (h >= 14 && h < 42) return 'Orange & Sunset';
  if (h >= 42 && h < 68) return 'Yellow & Gold';
  if (h >= 68 && h < 168) return 'Green & Emerald';
  if (h >= 168 && h < 260) return 'Blue & Cyan';
  if (h >= 260 && h < 312) return 'Purple & Violet';
  if (h >= 312 && h < 345) return 'Pink & Rose';
  return null;
}

// Extract rich color palette and spectrum classification via HTML5 Canvas with CORS fallback
export async function extractImagePalette(imageSrc: string): Promise<ColorProfile> {
  // Helper function to process an image element once loaded onto canvas
  const processImage = (imgEl: HTMLImageElement): ColorProfile => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 80;
    canvas.height = 80;
    ctx?.drawImage(imgEl, 0, 0, 80, 80);

    const imgData = ctx?.getImageData(0, 0, 80, 80).data;
    if (!imgData) {
      throw new Error("Empty image data");
    }

    const categoryCounts: Record<string, number> = {};
    const colorBuckets: Record<string, { r: number; g: number; b: number; count: number; h: number; s: number; l: number }> = {};
    let darkCount = 0;
    let lightCount = 0;
    let monoCount = 0;
    let totalPixels = 0;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 128) continue; // Skip transparent pixels
      totalPixels++;

      const hsl = rgbToHsl(r, g, b);
      if (hsl.l <= 18) darkCount++;
      if (hsl.l >= 85) lightCount++;
      if (hsl.s <= 15 && hsl.l > 18 && hsl.l < 85) monoCount++;

      const catName = classifyHslToName(hsl.h, hsl.s, hsl.l);
      if (catName) {
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      }

      // Quantize RGB values by grid of 24 for clean grouping
      const qr = Math.round(r / 24) * 24;
      const qg = Math.round(g / 24) * 24;
      const qb = Math.round(b / 24) * 24;
      const bucketKey = `${qr}_${qg}_${qb}`;
      if (!colorBuckets[bucketKey]) {
        colorBuckets[bucketKey] = { r, g, b, count: 0, h: hsl.h, s: hsl.s, l: hsl.l };
      }
      colorBuckets[bucketKey].count++;
    }

    if (totalPixels === 0) throw new Error("No visible pixels");

    // REQUIRE HIGH PREDOMINANCE: A color category must represent at least 15% of the artwork to be tagged!
    let dominantCategoryNames = Object.entries(categoryCounts)
      .filter(([_, count]) => count / totalPixels >= 0.15)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // If an image has extremely varied soft hues and none hit 15%, take the #1 most abundant category
    if (dominantCategoryNames.length === 0 && Object.keys(categoryCounts).length > 0) {
      const topEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
      if (topEntry) dominantCategoryNames = [topEntry[0]];
    }

    // Sort buckets by frequency and take only top 3 dominant color swatches (predominant colors only)
    const sortedBuckets = Object.values(colorBuckets)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const paletteHexes = sortedBuckets.map(b => rgbToHex(b.r, b.g, b.b));
    const dominantHex = paletteHexes[0] || '#71717a';
    const spectrumHues = sortedBuckets.map(b => b.h);

    return {
      dominantHex,
      paletteHexes,
      colorNames: dominantCategoryNames,
      spectrumHues,
      isDark: darkCount / totalPixels > 0.45,
      isLight: lightCount / totalPixels > 0.45,
      isMonochrome: monoCount / totalPixels > 0.5,
    };
  };

  return new Promise((resolve) => {
    // Attempt 1: Load direct image with CORS Anonymous
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    const tryProxy = () => {
      // Attempt 2: If direct CORS canvas reading fails, route through public zero-config CORS proxy
      if (imageSrc.startsWith('data:') || imageSrc.includes('images.weserv.nl')) {
        // Already local or proxy failed, return generic dark neutral instead of false blue
        resolve({
          dominantHex: '#27272a',
          paletteHexes: ['#27272a', '#3f3f46', '#71717a'],
          colorNames: ['Monochrome & Grayscale'],
          spectrumHues: [0],
          isDark: true,
          isLight: false,
          isMonochrome: true,
        });
        return;
      }
      const proxyImg = new Image();
      proxyImg.crossOrigin = "Anonymous";
      proxyImg.onload = () => {
        try {
          resolve(processImage(proxyImg));
        } catch (e) {
          resolve({
            dominantHex: '#27272a',
            paletteHexes: ['#27272a'],
            colorNames: ['Monochrome & Grayscale'],
            spectrumHues: [0],
            isDark: true,
            isLight: false,
            isMonochrome: true,
          });
        }
      };
      proxyImg.onerror = () => {
        resolve({
          dominantHex: '#27272a',
          paletteHexes: ['#27272a'],
          colorNames: ['Monochrome & Grayscale'],
          spectrumHues: [0],
          isDark: true,
          isLight: false,
          isMonochrome: true,
        });
      };
      proxyImg.src = `https://images.weserv.nl/?url=${encodeURIComponent(imageSrc)}&w=120&h=120`;
    };

    img.onload = () => {
      try {
        resolve(processImage(img));
      } catch (e) {
        tryProxy();
      }
    };
    img.onerror = tryProxy;
    img.src = imageSrc;
  });
}

// Strict high-precision color matching algorithm
export function matchesColorFilter(filterValue: string, profile?: ColorProfile, fallbackText?: string, filterKeywords: string[] = []): boolean {
  if (!filterValue || filterValue === 'All') return true;

  // 1. Preset Category Matching (e.g., "Yellow & Gold", "Blue & Cyan")
  if (!filterValue.startsWith('#')) {
    // Primary match: analyzed predominant color profile
    if (profile?.colorNames && profile.colorNames.length > 0) {
      if (profile.colorNames.includes(filterValue)) {
        return true;
      }
      // If post HAS a verified color profile and the color is NOT in dominant category names, REJECT IT.
      // Do not fall back to loose text words if visual analysis verified the actual colors!
      if (profile.colorNames.length > 0 && profile.paletteHexes && profile.paletteHexes.length > 0) {
        // Special luminosity checks
        if (filterValue === 'Dark & Noir' && profile.isDark) return true;
        if (filterValue === 'Clean White & Light' && profile.isLight) return true;
        if (filterValue === 'Monochrome & Grayscale' && profile.isMonochrome) return true;
        return false;
      }
    }

    // Fallback: only if post has never been scanned by the visual analyzer
    if (fallbackText && filterKeywords.length > 0) {
      const lower = fallbackText.toLowerCase();
      if (filterKeywords.some(kw => lower.includes(kw.toLowerCase()))) return true;
    }
    return false;
  }

  // 2. Custom Hex / Spectrum Picker Matching (e.g., #EEFF00 or #0062FF)
  const targetRgb = hexToRgb(filterValue);
  if (!targetRgb) return false; // Invalid hex should not show all posts!
  const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);

  // If no profile exists yet for this post, do NOT return true for everything!
  if (!profile || !profile.paletteHexes || profile.paletteHexes.length === 0) {
    return false;
  }

  const isTargetNeutral = targetHsl.s < 12 || targetHsl.l <= 15 || targetHsl.l >= 88;

  // Check each dominant swatch extracted from the image
  for (const hex of profile.paletteHexes) {
    const pRgb = hexToRgb(hex);
    if (!pRgb) continue;
    const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);

    const isSwatchNeutral = pHsl.s < 12 || pHsl.l <= 15 || pHsl.l >= 88;

    // Case A: User searched for a neutral shade (Black, White, Gray)
    if (isTargetNeutral) {
      if (isSwatchNeutral && Math.abs(targetHsl.l - pHsl.l) <= 22) {
        return true;
      }
      continue;
    }

    // Case B: User searched for a chromatic color (Yellow, Blue, Green, Pink, etc.)
    // Ignore neutral background swatches (like pure white or pitch black) when matching saturated spectrum colors!
    if (isSwatchNeutral) {
      continue;
    }

    // Calculate Hue distance around the 360-degree color circle
    let hueDelta = Math.abs(targetHsl.h - pHsl.h);
    if (hueDelta > 180) hueDelta = 360 - hueDelta;

    // REQUIRE STRICT HSL SIMILARITY: Hue within 22 degrees and reasonable lightness similarity
    if (hueDelta <= 22 && Math.abs(targetHsl.l - pHsl.l) <= 45) {
      return true;
    }
  }

  return false;
}
