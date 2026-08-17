import { createTheme } from '@mui/material/styles'

// Trip系ページ（一覧・作成・編集）で共通の背景グラデーション。
// theme.palette（primary #2563EB系）とは別の演出色のため、paletteには含めずページ用トークンとして定義する。
// 元々は各ページのsxに直書きされていたが、3ページとも同一の値だったためここに集約した。
export const pageBackgroundGradient =
  'radial-gradient(circle at 15% 0%, rgba(20,184,166,0.16), transparent 45%), radial-gradient(circle at 100% 20%, rgba(249,115,22,0.12), transparent 40%), #F4F7F6'

// 見出しのアイコンバッジ（56x56の丸角ボックス）に使うグラデーション。pageBackgroundGradientと同様に
// 元は各ページに直書きされていたもの。
export const iconBadgeGradient = 'linear-gradient(135deg, #14B8A6, #0F766E)'

// アプリ全体で使うMUIテーマ
const fontFamily = [
  '"Inter"',
  '"Hiragino Sans"',
  '"Hiragino Kaku Gothic ProN"',
  '"Yu Gothic"',
  'system-ui',
  '-apple-system',
  'sans-serif',
].join(',')

export const theme = createTheme({
  palette: {
    mode: 'light',

    // メインカラー：空・旅行・信頼感
    primary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },

    // アクセント：海・爽やかさ
    secondary: {
      main: '#06B6D4',
      light: '#67E8F9',
      dark: '#0891B2',
      contrastText: '#FFFFFF',
    },

    background: {
      default: '#F5F9FF',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#172033',
      secondary: '#64748B',
    },

    divider: '#E2E8F0',
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily,

    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },

    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 20,
          paddingBlock: 10,
        },

        contained: {
          boxShadow: 'none',

          '&:hover': {
            boxShadow:
              '0 8px 20px -8px rgba(37, 99, 235, 0.55)',
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#93C5FD',
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563EB',
            borderWidth: 2,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})