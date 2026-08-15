// Web版のMUIテーマ（frontend/src/app/theme.ts）と同じデザイン思想を
// React Native標準コンポーネント向けのプレーンな値として持たせたもの。
export const theme = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#60A5FA',
    secondary: '#06B6D4',

    background: '#F5F9FF',
    card: '#FFFFFF',
    border: '#E2E8F0',

    textPrimary: '#172033',
    textSecondary: '#64748B',
    placeholder: '#94A3B8',

    danger: '#DC2626',
    dangerBackground: '#FEF2F2',
    dangerBorder: '#FECACA',

    success: '#0F766E',
    successBackground: '#ECFDF5',
    successBorder: '#99F6E4',

    disabled: '#93C5FD',
  },
  radius: {
    sm: 8,
    md: 10,
    lg: 14,
    xl: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
} as const
