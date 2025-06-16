import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

import { Analytics } from "@vercel/analytics/next"

import Link from "next/link"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
