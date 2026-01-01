import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' |'medium' | 'small' | 'mini' | 'heading';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'medium' ? styles.medium : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'mini' ? styles.mini : undefined,
        type === 'heading' ? styles.heading : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  medium: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
  mini: {
    fontSize: 10,
    lineHeight: 12,
  }
});
