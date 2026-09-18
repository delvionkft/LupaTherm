/**
 * ESLint konfiguráció.
 *
 * Két, eltérő futtatókörnyezet van a projektben:
 *   api/**           — Vercel serverless (Node), ESM
 *   assets/js/**     — böngésző, ES5-kompatibilis IIFE
 *
 * Futtatás:  npx eslint api assets/js      (vagy: npm run lint)
 * A projekt szándékosan nem tartalmaz telepített függőséget, ezért az
 * eslint nincs a package.json-ben — ad hoc, npx-szel futtatjuk.
 */

const nodeGlobals = {
  process: 'readonly',
  console: 'readonly',
  Buffer: 'readonly',
  URLSearchParams: 'readonly',
  URL: 'readonly',
  fetch: 'readonly',
  TextEncoder: 'readonly',
  TextDecoder: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly'
};

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  history: 'readonly',
  localStorage: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  FormData: 'readonly',
  Date: 'readonly',
  Math: 'readonly',
  JSON: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  requestAnimationFrame: 'readonly',
  IntersectionObserver: 'readonly',
  matchMedia: 'readonly',
  innerWidth: 'readonly',
  innerHeight: 'readonly',
  scrollY: 'readonly',
  addEventListener: 'readonly'
};

const rules = {
  'no-undef': 'error',
  /* A catch-paraméter szándékosan kihasználatlan több helyen: a hibát
     elnyeljük (localStorage tiltás, turnstile.reset). Az elhagyása
     ES2019 opcionális catch binding lenne, amit a böngészőoldali
     ES2018-as célszint miatt nem használunk. */
  'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
  'no-redeclare': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-duplicate-case': 'error',
  'no-unreachable': 'error',
  'no-cond-assign': 'error',
  'no-constant-condition': 'error',
  'no-fallthrough': 'error',
  'no-self-assign': 'error',
  'no-sparse-arrays': 'error',
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-script-url': 'error',
  'no-empty': ['warn', { allowEmptyCatch: true }],
  eqeqeq: ['warn', 'smart']
};

export default [
  {
    files: ['api/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: nodeGlobals
    },
    rules
  },
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'script',
      globals: browserGlobals
    },
    rules
  }
];
