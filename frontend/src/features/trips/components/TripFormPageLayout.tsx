import type { ReactNode } from 'react'
import { Alert, Box, Container, Paper, Snackbar, Stack, Typography } from '@mui/material'
import { iconBadgeGradient, pageBackgroundGradient } from '../../../app/theme'

interface TripFormPageLayoutProps {
  icon: ReactNode
  title: string
  subtitle: string
  // 送信エラーの通知。nullなら非表示。
  error: string | null
  onDismissError: () => void
  children: ReactNode
}

// Trip作成・編集ページで共通のシェル（背景・アイコンバッジ・見出し・Paper・エラー通知）。
// 元々TripCreatePage/TripEditPageにそれぞれ直書きされていた、見た目に差のないレイアウト部分を集約したもの。
export function TripFormPageLayout({
  icon,
  title,
  subtitle,
  error,
  onDismissError,
  children,
}: TripFormPageLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: pageBackgroundGradient,
        py: { xs: 6, sm: 10 },
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              display: 'grid',
              placeItems: 'center',
              background: iconBadgeGradient,
              boxShadow: '0 12px 24px -10px rgba(15, 118, 110, 0.55)',
              mb: 1,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h5" component="h1" sx={{ color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4.5 },
            border: '1px solid',
            borderColor: 'rgba(15, 23, 42, 0.06)',
            boxShadow: '0 24px 48px -24px rgba(15, 23, 42, 0.18)',
          }}
        >
          {children}
        </Paper>
      </Container>

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={onDismissError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={onDismissError} sx={{ borderRadius: 2.5 }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}
