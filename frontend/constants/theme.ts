/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#C05528'; // O TEU LARANJA
const tintColorDark = '#C05528';

export const Colors = {
  light: {
    text: '#333333',         
    background: '#FFFFFF',  
    tint: tintColorLight,      
    icon: '#687076',          
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    //ui colors
    primary: '#C05528',
    primaryDark: '#A04520',
    cardBackground: '#FFFFFF',
    cardShadow: '#000',
    border: '#E0E0E0',
  
  },
  dark: {
    text: '#ffff',
    background: '#000814',
    tint: tintColorDark,
    icon: '#fff',
    tabIconDefault: '#fff',
    tabIconSelected: tintColorDark,
    //ui colors
    primary: '#C05528', 
    primaryDark: '#A04520',
    cardBackground: 'rgba(29, 37, 49, 0.61)', 
    cardShadow: '#fff',
    border: '#333333',
  },
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
