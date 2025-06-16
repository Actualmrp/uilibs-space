"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImageViewer } from "@/components/image-viewer";
import { MarkdownExample } from "@/components/markdown-example";
import { createClient } from "@/lib/client";
import { Skeleton } from "@/components/ui/skeleton";

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
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LibraryPage({ params }: PageProps) {
  const { id } = use(params);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    return `https://pamgxjfckwyvefsnbtfp.supabase.co/storage/v1/object/public/libraries/${path}`;
  };

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('libraries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLibrary(data);
      } catch (error) {
        console.error('Error fetching library:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Header Skeleton */}
        <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-40">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-20" /> {/* Back button */}
                <div>
                  <Skeleton className="h-6 w-48 mb-2" /> {/* Title */}
                  <Skeleton className="h-4 w-32" /> {/* Author */}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" /> {/* Website button */}
                <Skeleton className="h-9 w-24" /> {/* GitHub button */}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8">
          {/* Hero Image Skeleton */}
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-lg" />

            {/* Description Skeleton */}
            <div>
              <Skeleton className="h-7 w-20 mb-3" /> {/* About heading */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Gallery Skeleton */}
            <div>
              <Skeleton className="h-7 w-20 mb-4" /> {/* Gallery heading */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!library) {
    notFound();
  }

  const allImages = [library.preview, ...library.gallery].filter(Boolean);

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{library.name}</h1>
                <p className="text-sm text-muted-foreground">
                  by {library.author}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {library.website && (
                <Link
                  href={library.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="sm:hidden">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="hidden sm:flex">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                </Link>
              )}
              {library.github && (
                <Link
                  href={library.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="sm:hidden">
                    <svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.6,5,2.5,9.3,6.9,10.7v-2.3c0,0-0.4,0.1-0.9,0.1c-1.4,0-2-1.2-2.1-1.9 c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1c0.4,0,0.7-0.1,0.9-0.2 c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6c0,0,1.4,0,2.8,1.3 C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4c0.7,0.8,1.2,1.8,1.2,3 c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v3.3c4.1-1.3,7-5.1,7-9.5C22,6.1,16.9,1.4,10.9,2.1z"></path>
                    </svg>
                  </Button>
                  <Button size="sm" variant="outline" className="hidden sm:flex">
                    <svg 
                      className="w-5 h-5 mr-1" 
                      fill="currentColor" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.6,5,2.5,9.3,6.9,10.7v-2.3c0,0-0.4,0.1-0.9,0.1c-1.4,0-2-1.2-2.1-1.9 c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1c0.4,0,0.7-0.1,0.9-0.2 c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6c0,0,1.4,0,2.8,1.3 C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4c0.7,0.8,1.2,1.8,1.2,3 c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v3.3c4.1-1.3,7-5.1,7-9.5C22,6.1,16.9,1.4,10.9,2.1z"></path>
                    </svg>
                    GitHub
                  </Button>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image */}
          {library.preview && (
          <div
            className="relative h-64 bg-muted rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openImageViewer(0)}
          >
            <Image
                src={getImageUrl(library.preview)}
              alt={`${library.name} preview`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
              <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Click to view
              </div>
            </div>
          </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <div className="text-muted-foreground leading-relaxed">
              <MarkdownExample content={library.about} />
            </div>
          </div>

          {/* Gallery */}
          {library.gallery.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {library.gallery.map((image, index) => (
                <div
                  key={index}
                  className="relative h-32 bg-muted rounded overflow-hidden cursor-pointer group"
                  onClick={() => openImageViewer(index + 1)}
                >
                  <Image
                      src={getImageUrl(image)}
                    alt={`${library.name} example ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </main>

      {/* Image Viewer */}
      {allImages.length > 0 && (
      <ImageViewer
        images={allImages}
        initialIndex={selectedImageIndex}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />
      )}
    </div>
  );
}
