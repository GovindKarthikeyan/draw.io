import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppInsightsProvider from "./components/AppInsightsProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: "Excel File Renderer - View & Print Excel Files Online | Pixel-Perfect Formatting",
  description: "Free online Excel file renderer with pixel-perfect formatting. Upload and view .xlsx, .xls, and .xlsm files with preserved styles, colors, and borders. Print Excel sheets exactly as they appear.",
  keywords: [
    "excel viewer",
    "excel file renderer",
    "view excel online",
    "excel to image",
    "print excel",
    "xlsx viewer",
    "spreadsheet viewer",
    "excel formatter",
    "online excel reader"
  ],
  authors: [{ name: "Excel File Renderer" }],
  creator: "Excel File Renderer",
  publisher: "Excel File Renderer",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    title: "Excel File Renderer - View & Print Excel Files Online",
    description: "Upload and view Excel files with pixel-perfect formatting. Supports .xlsx, .xls, and .xlsm formats with preserved styles and colors.",
    siteName: "Excel File Renderer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Excel File Renderer - View Excel Files Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Excel File Renderer - View & Print Excel Files Online",
    description: "Upload and view Excel files with pixel-perfect formatting. Supports .xlsx, .xls, and .xlsm formats.",
    images: ["/twitter-image.png"],
    creator: "@excelrenderer",
  },
  category: "productivity",
  alternates: {
    canonical: "https://yourdomain.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* Schema.org markup for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Excel File Renderer",
              "description": "Free online Excel file renderer with pixel-perfect formatting",
              "url": "https://yourdomain.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Upload Excel files (.xlsx, .xls, .xlsm)",
                "Pixel-perfect rendering",
                "Multi-sheet support",
                "Print with exact formatting",
                "No registration required"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        
        <AppInsightsProvider>
          {children}
        </AppInsightsProvider>
      </body>
    </html>
  );
}
