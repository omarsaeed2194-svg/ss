export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        chrome: 'readonly', document: 'readonly', window: 'readonly', location: 'readonly', navigator: 'readonly',
        localStorage: 'readonly', fetch: 'readonly', URL: 'readonly', URLSearchParams: 'readonly', Blob: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', console: 'readonly', CSS: 'readonly',
        CustomEvent: 'readonly', Event: 'readonly', Intl: 'readonly', structuredClone: 'readonly', globalThis: 'readonly',
        confirm: 'readonly', module: 'readonly', self: 'readonly', HTMLInputElement: 'readonly', MouseEvent: 'readonly', KeyboardEvent: 'readonly', Response: 'readonly', MessageChannel: 'readonly', AbortSignal: 'readonly', performance: 'readonly', Request: 'readonly', Promise: 'readonly',
      },
    },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { args: 'none' }] },
  },
  { files: ['**/parser.js', '**/content.js'], languageOptions: { sourceType: 'script' } },
  { ignores: ['tests/**'] },
];
