// components/theme.ts
import { createTheme, type ThemeOptions } from '@mui/material/styles'
import * as clerkThemes from '@clerk/themes'
import { HELIX_COLORS, HelixFonts, type Mode } from '@/content/constants/theme'





/**
 * Clerk appearance styled to match our MUI theme.
 * Keep this fully-serializable (no functions) to avoid server/client issues.
 */
export function getClerkAppearance(mode: Mode) {
  const c = HELIX_COLORS[mode]

  return {
    baseTheme: mode === 'dark' ? clerkThemes.dark : (clerkThemes as any).light,
    variables: {
      // Clerk has a single font token; we use Lora for UI text
      fontFamily: HelixFonts.LORA,
      colorPrimary: c.primary,
      colorText: c.textPrimary,
      colorBackground: c.background,
      borderRadius: '8px',
    },
    elements: {
      formButtonPrimary: {
        backgroundColor: c.primary,
        color: '#fff',
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'uppercase',
        transition: 'all 0.2s ease',
        '&:hover': { backgroundColor: c.secondary, boxShadow: `0 0 12px ${c.secondary}80` },
      },
      link: {
        color: c.primary,
        fontWeight: 500,
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
      },
      // be explicit for both pages
      signIn: { formButtonPrimary: { backgroundColor: c.primary, '&:hover': { backgroundColor: c.secondary } } },
      signUp: { formButtonPrimary: { backgroundColor: c.primary, '&:hover': { backgroundColor: c.secondary } } },
    },
    cssLayerName: 'clerk',
  }
}

/**
 * MUI theme with Pinyon for h1–h2 and Lora for h3–h6 + body.
 */
export function getMuiTheme(mode: Mode) {
  const c = HELIX_COLORS[mode]

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: { main: c.primary },
      secondary: { main: c.secondary },
      background: { default: c.background, paper: c.surface },
      text: { primary: c.textPrimary, secondary: c.textSecondary },
    },
    // Default UI font: Lora
    typography: {
      fontFamily: HelixFonts.LORA,
      // Headings
      h1: { fontFamily: HelixFonts.PINYON, fontWeight: 600 },
      h2: { fontFamily: HelixFonts.PINYON, fontWeight: 600 },
      h3: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      h4: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      h5: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      h6: { fontFamily: HelixFonts.LORA, fontWeight: 600 },
      // Others
      subtitle1: { fontFamily: HelixFonts.LORA },
      subtitle2: { fontFamily: HelixFonts.LORA },
      body1: { fontFamily: HelixFonts.LORA },
      body2: { fontFamily: HelixFonts.LORA },
      button: { fontFamily: HelixFonts.LORA, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' },
      overline: { fontFamily: HelixFonts.LORA, letterSpacing: '0.08em' },
      caption: { fontFamily: HelixFonts.LORA },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: `0 0 12px ${c.primary}80` },
          },
          containedPrimary: {
            backgroundColor: c.primary,
            color: '#fff',
            '&:hover': { backgroundColor: c.secondary },
          },
          outlinedPrimary: {
            color: c.primary,
            borderColor: c.primary,
            '&:hover': { borderColor: c.secondary, color: c.secondary },
          },
        },
      },
    },
  }

  return createTheme(themeOptions)
}
