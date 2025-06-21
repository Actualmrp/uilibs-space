import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // Remove or make these more generic so they don't override page-specific metadata
  title: {
    template: '%s | UI Libraries',
    default: 'UI Libraries [Beta]',
  },
  description: "Discover component libraries for your scripts",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
  },
  // Only include global OpenGraph data that should apply to all pages
  openGraph: {
    siteName: "UI Libraries",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: `Banner preview`,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5314941457054624"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onError={() => {
            // Silently handle ad blocker - don't show errors in console
            console.log("AdSense script blocked by ad blocker")
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Analytics/>
          {/* Footer */}
          <footer className="border-t mt-16">
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="flex flex-row items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground flex-1">
                  Made with ❤️ for developers
                </p>
                <Link 
                  href="https://discord.gg/fHP8T9jNJW" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="default" size="sm">
                    Join our Discord community
                  </Button>
                </Link>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}