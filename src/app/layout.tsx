import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  ThemeStyleProvider,
} from "@/components/layouts/theme-provider";
import { Toaster } from "ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { IOSCompatibilityFix } from "@/components/ios-compatibility-fix";
import { IOSErrorBoundary } from "@/components/ios-error-boundary";
import { IOSLoadingFallback } from "@/components/ios-loading-fallback";
// Import Safari polyfills early
import "@/lib/safari-polyfill";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "better-chatbot",
  description:
    "Better Chatbot is a chatbot that uses the Tools to answer questions.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "better-chatbot",
  },
  formatDetection: {
    telephone: false,
  },
};

// const themes = BASE_THEMES.flatMap((t) => [t, `${t}-dark`]);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Early iOS compatibility fix
              (function() {
                if (typeof window !== "undefined") {
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                  
                  if (isIOS) {
                    // Prevent Eruda from loading
                    Object.defineProperty(window, 'eruda', {
                      get: () => undefined,
                      set: () => {},
                      configurable: false
                    });
                    
                    // Override problematic console methods early
                    const originalError = console.error;
                    console.error = function(...args) {
                      const message = args.join(' ');
                      if (message.includes('eruda') || message.includes('Script error')) {
                        return;
                      }
                      originalError.apply(console, args);
                    };
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IOSCompatibilityFix />
        <IOSLoadingFallback />
        <IOSErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={["light", "dark"]}
            storageKey="app-theme-v2"
            disableTransitionOnChange
          >
            <ThemeStyleProvider>
              <NextIntlClientProvider>
                <div id="root">
                  {children}
                  <Toaster richColors />
                </div>
              </NextIntlClientProvider>
            </ThemeStyleProvider>
          </ThemeProvider>
        </IOSErrorBoundary>
      </body>
    </html>
  );
}
