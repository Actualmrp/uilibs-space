"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LibraryBadges } from "@/components/ui/library-badges";

interface Library {
  id: string;
  name: string;
  description: string;
  about: string;
  author: string;
  author_bio: string;
  website: string | null;
  github: string | null;
  preview: string | null;
  gallery: string[];
  created_at: string;
  updated_at: string;
  tags: string[];
  is_paid: boolean;
  is_mobile_friendly: boolean;
}

export function LibraryCard({ library }: { library: Library }) {
  const router = useRouter();

  // Function to get the full URL for Supabase storage images
  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    return `https://pamgxjfckwyvefsnbtfp.supabase.co/storage/v1/object/public/libraries/${path}`;
  };

  return (
    <Card
      onClick={() => router.push(`/library/${library.id}`)}
      className="group hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
      <div className="relative h-40 bg-muted overflow-hidden">
        <Image
          src={getImageUrl(library.preview)}
          alt={`${library.name} preview`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 z-10">
          <LibraryBadges
            tags={library.tags || []}
            isPaid={library.is_paid}
            isMobileFriendly={library.is_mobile_friendly}
          />
        </div>
      </div>
      <CardHeader className="p-4">
        <div className="flex items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium truncate">
              {library.name}
            </CardTitle>
            <CardDescription className="mt-1 text-sm line-clamp-2">
              {library.description}
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-2">
              by {library.author}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
