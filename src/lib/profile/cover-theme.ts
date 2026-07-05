export type ProfileCoverTheme = {
  primary: string;
  accent: string;
};

const DEFAULT_THEME: ProfileCoverTheme = {
  primary: "#4338ca",
  accent: "#0891b2",
};

export function parseCoverThemeFromSocialLinks(
  links?: Record<string, string> | null
): ProfileCoverTheme | null {
  const primary = links?.profile_cover_primary;
  const accent = links?.profile_cover_accent;
  if (primary && accent && isHex(primary) && isHex(accent)) {
    return { primary, accent };
  }
  return null;
}

export function coverThemeStyle(theme: ProfileCoverTheme): Record<string, string> {
  const mid = blendHex(theme.primary, theme.accent, 0.5);
  return {
    background: [
      `radial-gradient(circle at 20% 50%, ${hexToRgba(theme.primary, 0.55)}, transparent 50%)`,
      `radial-gradient(circle at 80% 20%, ${hexToRgba(theme.accent, 0.45)}, transparent 45%)`,
      `linear-gradient(135deg, ${theme.primary} 0%, ${mid} 45%, ${theme.accent} 100%)`,
    ].join(", "),
  };
}

export async function extractCoverThemeFromImage(src: string): Promise<ProfileCoverTheme | null> {
  if (typeof window === "undefined" || !src) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 56;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const bright = (r + g + b) / 3;
          if (sat < 0.12 || bright < 28 || bright > 245) continue;

          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }

        if (count === 0) {
          resolve(null);
          return;
        }

        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);

        resolve({
          primary: rgbToHex(...darkenRgb(r, g, b, 0.38)),
          accent: rgbToHex(...brightenRgb(r, g, b, 0.22)),
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function getDefaultCoverTheme(): ProfileCoverTheme {
  return DEFAULT_THEME;
}

function isHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function blendHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => parseInt(hex.slice(1), 16);
  const na = parse(a);
  const nb = parse(b);
  const r = Math.round(((na >> 16) & 255) * (1 - t) + ((nb >> 16) & 255) * t);
  const g = Math.round(((na >> 8) & 255) * (1 - t) + ((nb >> 8) & 255) * t);
  const bl = Math.round((na & 255) * (1 - t) + (nb & 255) * t);
  return rgbToHex(r, g, bl);
}

function darkenRgb(r: number, g: number, b: number, amount: number) {
  return [
    Math.max(0, Math.round(r * (1 - amount))),
    Math.max(0, Math.round(g * (1 - amount))),
    Math.max(0, Math.round(b * (1 - amount))),
  ] as const;
}

function brightenRgb(r: number, g: number, b: number, amount: number) {
  return [
    Math.min(255, Math.round(r + (255 - r) * amount)),
    Math.min(255, Math.round(g + (255 - g) * amount)),
    Math.min(255, Math.round(b + (255 - b) * amount)),
  ] as const;
}
