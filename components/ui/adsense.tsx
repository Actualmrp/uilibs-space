"use client"

import { useEffect } from "react"

interface AdSenseProps {
  adSlot: string
  adFormat?: "auto" | "fluid"
  style?: React.CSSProperties
  className?: string
}

export function AdSense({ adSlot, adFormat = "auto", style, className }: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore - Google AdSense types
      if (window.adsbygoogle) {
        // @ts-ignore
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error("AdSense error:", error)
    }
  }, [])

  return (
    <div className={`ad-container ${className || ""}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5314941457054624" // Replace with your actual publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
} 