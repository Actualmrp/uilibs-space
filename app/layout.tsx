import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UI Libraries [Beta]",
  description: "Discover component libraries for your scripts",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
  },
  // openGraph: {
  //   title: "UI Libraries [Beta]",
  //   description: "Discover component libraries for your scripts",
  //   url: process.env.NEXT_PUBLIC_URL,
  //   siteName: "UI Libraries",
  //   images: [
  //     {
  //       url: "/og-image.png",
  //       width: 1200,
  //       height: 630,
  //       alt: "UI Libraries Preview",
  //     },
  //   ],
  //   locale: "en_US",
  //   type: "website",
  // },
}

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
        </ThemeProvider>
      </body>
    </html>
  )
}
