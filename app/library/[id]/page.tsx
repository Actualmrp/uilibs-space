import { createClient } from "@/lib/client";
import { Metadata } from "next";
import LibraryPageClient from "./client";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: library } = await supabase
    .from("libraries")
    .select("*")
    .eq("id", params.id)
    .single();

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://libs.xrer.space';
  
  if (!library) {
    const notFoundImageUrl = `${baseUrl}/404notfoundlibrary.png`;
    
    return {
      title: "Library Not Found",
      description: "The requested library does not exist.",
      openGraph: {
        title: "Library Not Found",
        description: "The requested library does not exist.",
        images: [
          {
            url: notFoundImageUrl,
            width: 1200,
            height: 630,
            alt: "Library not found",
          },
        ],
        type: "website",
        siteName: "Roblox UI Library",
        url: `${baseUrl}/library/${params.id}`,
      },
      twitter: {
        card: "summary_large_image",
        title: "Library Not Found",
        description: "The requested library does not exist.",
        images: [notFoundImageUrl],
      },
      robots: {
        index: false, // Don't index 404 pages
        follow: false,
      },
      alternates: {
        canonical: `${baseUrl}/library/${params.id}`,
      },
    };
  }

  const imageUrl = library.preview
    ? `https://pamgxjfckwyvefsnbtfp.supabase.co/storage/v1/object/public/libraries/${library.preview}`
    : `${baseUrl}/404notfoundlibrary.png`; // Fallback to 404 image if no preview

  return {
    title: `${library.name} – Roblox Library`,
    description: library.description || "A Roblox library available in the community collection.",
    openGraph: {
      title: library.name,
      description: library.description || "Explore this Roblox library.",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: library.preview ? `${library.name} preview` : "Library preview not available",
        },
      ],
      type: "website",
      siteName: "Roblox UI Library",
      url: `${baseUrl}/library/${params.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: library.name,
      description: library.description || "",
      images: [imageUrl],
    },
    // Add robots meta to ensure this page is indexed separately
    robots: {
      index: true,
      follow: true,
    },
    // Add canonical URL
    alternates: {
      canonical: `${baseUrl}/library/${params.id}`,
    },
  };
}

export default async function LibraryPage({ params }: { params: { id: string } }) {
  return <LibraryPageClient id={params.id} />;
}