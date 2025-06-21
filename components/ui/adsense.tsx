"use client"

import { useEffect, useState } from "react"

// Declare AdSense types
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdSenseProps {
  adSlot: string
  adFormat?: "auto" | "fluid"
  style?: React.CSSProperties
  className?: string
}

export function AdSense({ adSlot, adFormat = "auto", style, className }: AdSenseProps) {
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    const loadAd = () => {
      try {
        // Check if AdSense is available
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({})
          setAdLoaded(true)
        } else {
          // Retry after a short delay
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.adsbygoogle) {
              window.adsbygoogle.push({})
              setAdLoaded(true)
            } else {
              setAdError(true)
            }
          }, 1000)
        }
      } catch (error) {
        console.error("AdSense error:", error)
        setAdError(true)
      }
    }

    // Load ad after component mounts
    const timer = setTimeout(loadAd, 100)
    return () => clearTimeout(timer)
  }, [])

  // Don't render anything if there's an error (ad blocker detected)
  if (adError) {
    return null
  }

  return (
    <div className={`ad-container ${className || ""}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5314941457054624"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      {!adLoaded && (
        <div 
          className="flex items-center justify-center bg-muted rounded"
          style={{ minHeight: "90px" }}
        >
          <div className="text-sm text-muted-foreground">Loading ad...</div>
        </div>
      )}
    </div>
  )
} 