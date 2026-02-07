/**
 * Content Security Policy (CSP) Generator
 * 
 * Generates environment-aware CSP policies:
 * - DEV: Permissive for Vite dev server (allows unsafe-eval, unsafe-inline)
 * - PROD: Strict security (removes unsafe-eval, unsafe-inline)
 * - Supports report-only mode via VITE_CSP_REPORT_ONLY
 */

/**
 * Generate CSP policy string based on environment
 * @param {Object} options - Configuration options
 * @param {boolean} options.isDev - Whether in development mode
 * @param {boolean} options.reportOnly - Whether to use report-only mode
 * @returns {string} CSP policy string
 */
export function generateCSP({ isDev = false, reportOnly = false } = {}) {
  const isDevMode = isDev || import.meta.env.DEV;
  const isReportOnly = reportOnly || import.meta.env.VITE_CSP_REPORT_ONLY === 'true';

  // Base directives that apply to both dev and prod
  const baseDirectives = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
  };

  // Script source: permissive in dev, strict in prod
  if (isDevMode) {
    // Dev: Allow unsafe-eval and unsafe-inline for Vite HMR
    baseDirectives['script-src'] = [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Needed for Vite dev server
    ];
  } else {
    // Prod: Strict - only self, no unsafe-eval or unsafe-inline
    // Vite builds bundle all scripts, so we don't need unsafe-inline
    baseDirectives['script-src'] = [
      "'self'",
      // Note: If you see CSP violations for inline scripts in production,
      // you may need to add nonces or hashes. Check browser console.
    ];
  }

  // Style source: allow unsafe-inline for both (React inline styles)
  // In production, Vite extracts most styles, but React components may use inline styles
  baseDirectives['style-src'] = [
    "'self'",
    "'unsafe-inline'", // Needed for React inline styles
    'https://fonts.googleapis.com',
  ];

  // Font source
  baseDirectives['font-src'] = [
    "'self'",
    'https://fonts.gstatic.com',
    'data:', // For data URIs in fonts
  ];

  // Image source
  baseDirectives['img-src'] = [
    "'self'",
    'data:',
    'https:', // Allow all HTTPS images (for extension icons, etc.)
  ];

  // Connect source: API endpoints
  const connectSrc = [
    "'self'",
    'https://*.supabase.co',
    'https://*.supabase.io',
  ];

  // Add localhost for dev only
  if (isDevMode) {
    connectSrc.push(
      'http://localhost:*',
      'ws://localhost:*',
      'wss://localhost:*'
    );
  }

  baseDirectives['connect-src'] = connectSrc;

  // Frame source: for Supabase auth iframes
  baseDirectives['frame-src'] = [
    "'self'",
    'https://*.supabase.co',
  ];

  // Worker source (for service workers if used)
  baseDirectives['worker-src'] = ["'self'"];

  // Manifest source
  baseDirectives['manifest-src'] = ["'self'"];

  // Convert directives object to CSP string
  const cspString = Object.entries(baseDirectives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');

  return cspString;
}

/**
 * Get CSP header name based on report-only mode
 * @param {boolean} reportOnly - Whether to use report-only mode
 * @returns {string} Header name ('Content-Security-Policy' or 'Content-Security-Policy-Report-Only')
 */
export function getCSPHeaderName(reportOnly = false) {
  const isReportOnly = reportOnly || import.meta.env.VITE_CSP_REPORT_ONLY === 'true';
  return isReportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';
}

/**
 * Generate CSP meta tag content
 * @param {Object} options - Configuration options
 * @returns {string} Meta tag content attribute value
 */
export function getCSPMetaContent(options = {}) {
  return generateCSP(options);
}

/**
 * Get CSP for development
 * @returns {string} Development CSP string
 */
export function getDevCSP() {
  return generateCSP({ isDev: true, reportOnly: false });
}

/**
 * Get CSP for production
 * @param {boolean} reportOnly - Whether to use report-only mode
 * @returns {string} Production CSP string
 */
export function getProdCSP(reportOnly = false) {
  return generateCSP({ isDev: false, reportOnly });
}

// Export default for convenience
export default {
  generateCSP,
  getCSPHeaderName,
  getCSPMetaContent,
  getDevCSP,
  getProdCSP,
};

