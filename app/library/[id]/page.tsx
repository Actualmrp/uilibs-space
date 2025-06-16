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

  if (!library) {
    return {
      title: "Library Not Found",
      description: "The requested library does not exist.",
    };
  }

  const imageUrl = library.preview
    ? `https://pamgxjfckwyvefsnbtfp.supabase.co/storage/v1/object/public/libraries/${library.preview}`
    : "";

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
          alt: `${library.name} preview`,
        },
      ],
      type: "website",
      siteName: "Roblox UI Library",
    },
    twitter: {
      card: "summary_large_image",
      title: library.name,
      description: library.description || "",
      images: [imageUrl],
    },
  };
}

export default async function LibraryPage({ params }: { params: { id: string } }) {
  return <LibraryPageClient id={params.id} />;
}