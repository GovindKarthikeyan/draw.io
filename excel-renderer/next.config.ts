import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Enable compression for better performance on IIS
  compress: true,
  // Configure trailing slashes for IIS compatibility
  trailingSlash: false,
  // Add empty turbopack config to silence warnings
  turbopack: {},

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Default source
              "default-src 'self'",
              // Scripts - allow inline for Next.js and Application Insights
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.monitor.azure.com",
              // Styles - allow inline for Tailwind and styled-jsx
              "style-src 'self' 'unsafe-inline'",
              // Images - allow data URLs for html2canvas
              "img-src 'self' data: blob:",
              // Fonts
              "font-src 'self' data:",
              // Connect - allow Application Insights
              "connect-src 'self' https://*.applicationinsights.azure.com https://*.in.applicationinsights.azure.com",
              // Workers - allow blob for html2canvas
              "worker-src 'self' blob:",
              // Objects and embeds
              "object-src 'none'",
              "embed-src 'none'",
              // Base URI restriction
              "base-uri 'self'",
              // Form actions
              "form-action 'self'",
              // Frame ancestors (same as X-Frame-Options)
              "frame-ancestors 'self'",
              // Block mixed content
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Image optimization security
  images: {
    remotePatterns: [], // No remote images allowed by default
    dangerouslyAllowSVG: false, // Disable SVG for security
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
