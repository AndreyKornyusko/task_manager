'use client'

import { createTheme } from '@mui/material/styles'

// Color values from variables (light theme defaults)
// MUI doesn't support CSS variables directly, so we use actual color values
const colors = {
  primary: '#0070f3',
  primaryHover: '#0051cc',
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  borderColor: '#e0e0e0',
  error: '#ef4444',
}

// Create a theme that matches the app's design
export const datePickerTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
    },
    error: {
      main: colors.error,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.bgPrimary,
            color: colors.textPrimary,
            '& fieldset': {
              borderColor: colors.borderColor,
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.textSecondary,
            '&.Mui-focused': {
              color: colors.primary,
            },
          },
          '& .MuiInputAdornment-root': {
            '& .MuiIconButton-root': {
              color: colors.textSecondary,
              '&:hover': {
                color: colors.primary,
                backgroundColor: colors.bgSecondary,
              },
              '& .MuiSvgIcon-root': {
                color: colors.textSecondary,
              },
            },
          },
        },
      },
    },
  },
})

