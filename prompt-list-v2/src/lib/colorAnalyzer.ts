export interface ColorProfile {
  dominantHex: string;
  paletteHexes: string[];
  colorNames: string[];
  colorPercentages?: Record<string, number>;
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

// Classify an HSL pixel into high-precision, human-curated color spectrum categories
function classifyHslToName(h: number, s: number, l: number): string | null {
  // 1. Extreme luminosity and achromatic (grayscale/neutral) checks first
  if (l <= 14 || (l <= 20 && s <= 22)) return 'Dark & Noir';
  if (l >= 88 && s <= 25) return 'Clean White & Light';
  if (s <= 18 && l > 14 && l < 88) return 'Monochrome & Gray';
  
  // Extra filter against dull atmospheric haze / gray shadows in cool tints (prevents dull grey mountain haze from counting as saturated Blue)
  if (h >= 170 && h <= 270 && s <= 25) {
    return l >= 75 ? 'Clean White & Light' : 'Monochrome & Gray';
  }

  // 2. Brown & Earth vs Orange/Yellow
  if (h >= 12 && h < 46 && l > 14 && l <= 46) return 'Brown & Earth';

  // 3. Pink & Rose vs Red & Crimson / Purple (CRITICAL: Magenta, pastel tints of red/salmon, and pinks starting around hue 288 are PINK & ROSE!)
  if (h >= 288 && h <= 345) return 'Pink & Rose';
  if (h > 345 || h < 20) {
    // If it's a bright/soft pastel tint (e.g. blush rose, peach, baby pink flowers), it is PINK & ROSE!
    if (l >= 62 || (l >= 50 && s <= 65)) {
      return 'Pink & Rose';
    }
    // CRITICAL: Muted brick, warm stone towers, and shadow reflections (s < 45) must NEVER be classified as Red!
    if (s < 45) {
      return l <= 45 ? 'Brown & Earth' : 'Monochrome & Gray';
    }
    if (h < 14) return 'Red & Crimson';
    if (h >= 345) return 'Red & Crimson';
  }

  // 4. Standard chromatic spectrum with precision boundaries
  if (h >= 14 && h < 42) return 'Orange & Sunset';
  if (h >= 42 && h < 68) return 'Yellow & Gold';
  if (h >= 68 && h < 165) return 'Green & Emerald';
  if (h >= 165 && h < 188) return 'Cyan & Teal';
  if (h >= 188 && h < 252) return 'Blue & Azure';
  if (h >= 252 && h < 288) return 'Purple & Violet';

  return null;
}

// Extract rich color palette, exact concentration percentages, and classification via HTML5 Canvas with robust CORS failovers
export async function extractImagePalette(imageSrc: string): Promise<ColorProfile | null> {
  const processImage = (imgEl: HTMLImageElement): ColorProfile => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 80;
    canvas.height = 80;
    ctx?.drawImage(imgEl, 0, 0, 80, 80);

    const imgData = ctx?.getImageData(0, 0, 80, 80).data;
    if (!imgData) {
      throw new Error("Empty image data from canvas");
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
      if (hsl.s <= 18 && hsl.l > 18 && hsl.l < 85) monoCount++;

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

    if (totalPixels === 0) throw new Error("No visible pixels on canvas");

    // Compute integer percentages and keep only dominant colors representing at least 20% of the artwork
    const colorPercentages: Record<string, number> = {};
    let dominantCategoryNames = Object.entries(categoryCounts)
      .filter(([name, count]) => {
        const perc = Math.round((count / totalPixels) * 100);
        if (perc >= 20) {
          colorPercentages[name] = perc;
          return true;
        }
        return false;
      })
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // If an image has varied soft hues and none hit 10%, take the #1 most abundant category
    if (dominantCategoryNames.length === 0 && Object.keys(categoryCounts).length > 0) {
      const topEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
      if (topEntry) {
        dominantCategoryNames = [topEntry[0]];
        colorPercentages[topEntry[0]] = Math.max(10, Math.round((topEntry[1] / totalPixels) * 100));
      }
    }

    // Sort buckets by frequency and take only top 3 dominant color swatches
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
      colorPercentages,
      spectrumHues,
      isDark: darkCount / totalPixels > 0.45,
      isLight: lightCount / totalPixels > 0.45,
      isMonochrome: monoCount / totalPixels > 0.5,
    };
  };

  return new Promise((resolve) => {
    const getUrlsToAttempt = (): string[] => {
      if (!imageSrc || imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')) {
        return [imageSrc];
      }
      const encoded = encodeURIComponent(imageSrc);
      // Prioritize high-performance image CDNs (wsrv.nl and weserv.nl) to guarantee instant CORS access during batch rescanning
      return [
        `https://wsrv.nl/?url=${encoded}&w=200`,
        `https://images.weserv.nl/?url=${encoded}&w=200`,
        `https://api.allorigins.win/raw?url=${encoded}`,
        `https://corsproxy.io/?url=${encoded}`,
        `https://api.codetabs.com/v1/proxy?quest=${encoded}`,
        imageSrc
      ];
    };

    const urls = getUrlsToAttempt();
    let attemptIndex = 0;
    let isResolved = false;

    // Global maximum timeout for offline color palette extraction: 6 seconds total!
    const globalTimer = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.warn("Global timeout reached for extractImagePalette fallback on:", imageSrc);
        resolve(null);
      }
    }, 6000);

    const tryNextUrl = () => {
      if (isResolved) return;
      if (attemptIndex >= urls.length) {
        isResolved = true;
        clearTimeout(globalTimer);
        console.warn("All proxy failovers exhausted or blocked by CORS for:", imageSrc);
        resolve(null);
        return;
      }

      const currentUrl = urls[attemptIndex++];
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      // Strict 3.5s per-proxy timeout in case proxy hangs without triggering onload/onerror
      const proxyTimer = setTimeout(() => {
        if (!isResolved) {
          img.src = ""; // Cancel pending image loading
          tryNextUrl();
        }
      }, 3500);

      img.onload = () => {
        if (isResolved) return;
        clearTimeout(proxyTimer);
        try {
          const profile = processImage(img);
          isResolved = true;
          clearTimeout(globalTimer);
          resolve(profile);
        } catch (e) {
          tryNextUrl();
        }
      };

      img.onerror = () => {
        if (isResolved) return;
        clearTimeout(proxyTimer);
        tryNextUrl();
      };

      img.src = currentUrl;
    };

    tryNextUrl();
  });
}

// Precise preset dominant color matching algorithm (Pinterest-level strictness)
export function matchesColorFilter(filterValue: string, profile?: ColorProfile, fallbackText?: string, filterKeywords: string[] = []): boolean {
  if (!filterValue || filterValue === 'All' || filterValue === 'Any Color') return true;

  if (profile?.colorNames && profile.colorNames.length > 0) {
    const primaryColor = profile.colorNames[0];
    const idx = profile.colorNames.indexOf(filterValue);
    let matchedIndex = idx;
    let matchedPerc = profile.colorPercentages?.[filterValue];

    // Check backward compatibility names
    if (filterValue === 'Blue & Azure' && matchedIndex === -1) {
      matchedIndex = profile.colorNames.indexOf('Blue & Cyan');
      if (matchedIndex !== -1) matchedPerc = profile.colorPercentages?.['Blue & Cyan'];
    }
    if (filterValue === 'Cyan & Teal' && matchedIndex === -1) {
      matchedIndex = profile.colorNames.indexOf('Blue & Cyan');
      if (matchedIndex !== -1) matchedPerc = profile.colorPercentages?.['Blue & Cyan'];
    }
    if (filterValue === 'Monochrome & Gray' && matchedIndex === -1) {
      matchedIndex = profile.colorNames.indexOf('Monochrome & Grayscale');
      if (matchedIndex !== -1) matchedPerc = profile.colorPercentages?.['Monochrome & Grayscale'];
    }

    // PINTEREST-QUALITY ABSOLUTE CONTRAST REJECTION RULES:
    // 1) If user selects Blue/Cyan, and #1 primary dominant color is warm (Red, Pink, Orange, Yellow), reject unconditionally!
    const isWarmPrimary = ['Red & Crimson', 'Orange & Sunset', 'Pink & Rose', 'Yellow & Gold', 'Orange & Amber'].includes(primaryColor);
    const isCoolFilter = ['Blue & Azure', 'Cyan & Teal', 'Blue & Cyan'].includes(filterValue);
    if (isCoolFilter && isWarmPrimary) {
      return false;
    }

    // 2) If user selects Red/Orange/Yellow/Pink, and #1 primary dominant color is cool (Blue, Cyan, Green), reject unconditionally!
    // (This guarantees sunny blue-sky photos like Tower of Pisa will NEVER appear under Red or Yellow!)
    const isCoolPrimary = ['Blue & Azure', 'Cyan & Teal', 'Blue & Cyan', 'Green & Emerald'].includes(primaryColor);
    const isWarmFilter = ['Red & Crimson', 'Orange & Sunset', 'Pink & Rose', 'Yellow & Gold', 'Orange & Amber'].includes(filterValue);
    if (isWarmFilter && isCoolPrimary) {
      return false;
    }

    // STRICT DOMINANCE RULE: For vibrant primary colors (Red, Blue, Green, Yellow, etc.), the artwork MUST feature it as:
    // 1) The #1 primary dominant color (matchedIndex === 0)
    // 2) A major secondary color representing at least >= 45% visual concentration
    if (matchedIndex === 0) return true;
    if (matchedIndex === 1 && matchedPerc !== undefined && matchedPerc >= 45) return true;

    // Specialized lighting / tone fallbacks only if primary color is neutral/monochrome
    if (filterValue === 'Dark & Noir' && profile.isDark && matchedIndex === 0) return true;
    if (filterValue === 'Clean White & Light' && profile.isLight && matchedIndex === 0) return true;
    if (filterValue === 'Monochrome & Gray' && profile.isMonochrome && matchedIndex === 0) return true;
    
    return false;
  }

  // Fallback ONLY if post hasn't been visually scanned yet
  if (fallbackText && filterKeywords.length > 0) {
    const lower = fallbackText.toLowerCase();
    if (filterKeywords.some(kw => lower.includes(kw.toLowerCase()))) return true;
  }
  return false;
}
