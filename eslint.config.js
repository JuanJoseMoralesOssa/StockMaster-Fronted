import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Design-system guard: keep Tailwind classes on the shared type scale and
      // color tokens. Bans arbitrary `text-[…px]` sizes and raw color escapes
      // (`text-[#…]`, `bg-[#…]`, …) in both string and template-literal classNames.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/text-\\[[\\d.]+px\\]/]',
          message:
            'Use a Tailwind type-scale token (text-xs/sm/base/lg/xl/2xl…) instead of an arbitrary text-[…px] size.',
        },
        {
          selector: 'TemplateElement[value.raw=/text-\\[[\\d.]+px\\]/]',
          message:
            'Use a Tailwind type-scale token (text-xs/sm/base/lg/xl/2xl…) instead of an arbitrary text-[…px] size.',
        },
        {
          selector:
            'Literal[value=/(?:text|bg|border|ring|fill|stroke|from|via|to)-\\[#/]',
          message:
            'Use a design-system color token (e.g. text-(--color-…) or a palette class) instead of a raw color escape.',
        },
        {
          selector:
            'TemplateElement[value.raw=/(?:text|bg|border|ring|fill|stroke|from|via|to)-\\[#/]',
          message:
            'Use a design-system color token (e.g. text-(--color-…) or a palette class) instead of a raw color escape.',
        },
      ],
    },
  },
)
