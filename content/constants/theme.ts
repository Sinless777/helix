// content/constants/theme.ts
// Centralized glassmorphism-friendly palettes with multiple color formats.

export type ColorFormats = {
  /** Hex string, includes alpha channel when alpha < 1. */
  hex: string
  /** RGB string without alpha channel (e.g., `rgb(255, 255, 255)`). */
  rgb: string
  /** RGBA string with the configured alpha (e.g., `rgba(255, 255, 255, 0.7)`). */
  rgba: string
}

export type ThemePalette = {
  primary: ColorFormats
  primaryForeground: ColorFormats
  background: ColorFormats
  backgroundTransparent: ColorFormats
  surface: ColorFormats
  surfaceTransparent: ColorFormats
  border: ColorFormats
  text: ColorFormats
  textSecondary: ColorFormats
  accent: ColorFormats
  accentForeground: ColorFormats
}

const normalizeHex = (hex: string): string => {
  const stripped = hex.replace('#', '')
  if (stripped.length === 3) {
    return stripped
      .split('')
      .map((char) => char + char)
      .join('')
  }
  if (stripped.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}"`)
  }
  return stripped.toUpperCase()
}

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = normalizeHex(hex)
  const value = Number.parseInt(normalized, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return [r, g, b]
}

const alphaToHex = (alpha: number): string => {
  const clamped = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
  return clamped.toString(16).padStart(2, '0').toUpperCase()
}

const createColor = (hex: string, alpha = 1): ColorFormats => {
  const [r, g, b] = hexToRgb(hex)
  const hexBase = `#${normalizeHex(hex)}`
  const rgba = `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`
  const hexWithAlpha = alpha >= 1 ? hexBase : `${hexBase}${alphaToHex(alpha)}`
  return {
    hex: hexWithAlpha,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba,
  }
}

export const lightTheme: ThemePalette = {
  primary: createColor('#6200EE'),
  primaryForeground: createColor('#FFFFFF'),
  background: createColor('#F5F7FC'),
  backgroundTransparent: createColor('#F5F7FC', 0.72),
  surface: createColor('#FFFFFF'),
  surfaceTransparent: createColor('#FFFFFF', 0.78),
  border: createColor('#D6DBE6'),
  text: createColor('#121826'),
  textSecondary: createColor('#5C6982'),
  accent: createColor('#00BCD4'),
  accentForeground: createColor('#082B38'),
}

export const darkTheme: ThemePalette = {
  primary: createColor('#8C52FF'),
  primaryForeground: createColor('#130D29'),
  background: createColor('#070A11'),
  backgroundTransparent: createColor('#070A11', 0.72),
  surface: createColor('#181A22'),
  surfaceTransparent: createColor('#181A22', 0.7),
  border: createColor('#383D4F'),
  text: createColor('#E5E8F0'),
  textSecondary: createColor('#A4AABE'),
  accent: createColor('#00BFA6'),
  accentForeground: createColor('#052421'),
}

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const

export type ThemeMode = keyof typeof themes
export type Mode = ThemeMode

export const HELIX_COLORS = {
  light: {
    primary: lightTheme.primary.hex,
    secondary: lightTheme.accent.hex,
    background: lightTheme.background.hex,
    surface: lightTheme.surface.hex,
    textPrimary: lightTheme.text.hex,
    textSecondary: lightTheme.textSecondary.hex,
  },
  dark: {
    primary: darkTheme.primary.hex,
    secondary: darkTheme.accent.hex,
    background: darkTheme.background.hex,
    surface: darkTheme.surface.hex,
    textPrimary: darkTheme.text.hex,
    textSecondary: darkTheme.textSecondary.hex,
  },
} as const

export const HelixFonts = {
  LORA: 'var(--font-lora, "Lora", serif)',
  PINYON: 'var(--font-pinyon, "Pinyon Script", cursive)',
  INTER: 'var(--font-inter, "Inter", sans-serif)',
} as const
