/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Design tokens for the E-Sertifikat app (admin & peserta), derived from `design.md`.
 * Theme: Navy — Gold — Off-White. Additive to the tokens above; does not replace them.
 */
export const DesignColors = {
  navyDeep: '#0F1B2D',
  navyBase: '#16273F',
  navySoft: '#233A5C',
  gold: '#C9A24B',
  goldSoft: '#E4CE8F',
  offWhite: '#F5F3EE',
  ivoryCard: '#FBFAF6',
  charcoal: '#232323',
  slateGray: '#5C6470',
  statusRed: '#B3413A',
  statusGreen: '#3E7A5D',
  borderLight: '#DCD7CB',
  borderDark: '#2A3A54',
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const AppFonts = {
  ui: Platform.select({ ios: 'System', android: 'sans-serif', web: 'system-ui' }),
  certificate: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});