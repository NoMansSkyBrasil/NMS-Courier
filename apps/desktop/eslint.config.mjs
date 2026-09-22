import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules
    }
  },
  {
    files: [
      'src/renderer/src/components/ui/**/*.{ts,tsx}',
      'src/renderer/src/components/chart-area-interactive.tsx',
      'src/renderer/src/components/data-table.tsx',
      'src/renderer/src/components/nav-documents.tsx',
      'src/renderer/src/components/nav-main.tsx',
      'src/renderer/src/components/nav-projects.tsx',
      'src/renderer/src/components/nav-secondary.tsx',
      'src/renderer/src/components/nav-user.tsx',
      'src/renderer/src/components/team-switcher.tsx',
      'src/renderer/src/hooks/use-mobile.ts',
      'src/renderer/src/components/app-sidebar.tsx',
      'src/renderer/src/components/section-cards.tsx',
      'src/renderer/src/components/site-header.tsx',
      'src/renderer/src/i18n/locale-provider.tsx'
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'prettier/prettier': 'off'
    }
  },
  eslintConfigPrettier,
  {
    files: [
      'src/renderer/src/components/ui/**/*.{ts,tsx}',
      'src/renderer/src/components/chart-area-interactive.tsx',
      'src/renderer/src/components/data-table.tsx',
      'src/renderer/src/components/nav-documents.tsx',
      'src/renderer/src/components/nav-main.tsx',
      'src/renderer/src/components/nav-projects.tsx',
      'src/renderer/src/components/nav-secondary.tsx',
      'src/renderer/src/components/nav-user.tsx',
      'src/renderer/src/components/team-switcher.tsx',
      'src/renderer/src/hooks/use-mobile.ts',
      'src/renderer/src/components/app-sidebar.tsx',
      'src/renderer/src/components/section-cards.tsx',
      'src/renderer/src/components/site-header.tsx'
    ],
    rules: {
      'prettier/prettier': 'off'
    }
  }
)
