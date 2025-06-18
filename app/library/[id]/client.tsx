"use client";
import Image from "next/image";
import Link from "next/link";

import { use } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Github, Trash2 } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImageViewer } from "@/components/image-viewer";
import { MarkdownExample } from "@/components/markdown-example";
import { Skeleton } from "@/components/ui/skeleton";
import { LibraryBadges } from "@/components/ui/library-badges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { createClient } from "@/lib/client";

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

interface PageProps {
  id: string;
}

export default function LibraryPageClient({ id }: PageProps) {
  const router = useRouter();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    return `https://pamgxjfckwyvefsnbtfp.supabase.co/storage/v1/object/public/libraries/${path}`;
  };

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const supabase = createClient();
        
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          setIsAdmin(profile?.role === "admin");
        }

        const { data, error } = await supabase
          .from("libraries")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setLibrary(data);
      } catch (error) {
        console.error("Error fetching library:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [id]);

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("libraries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      router.push("/");
    } catch (error) {
      console.error("Error deleting library:", error);
    }
  };

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
                  <Button
                    size="sm"
                    variant="outline"
                    className="hidden sm:flex"
                  >
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
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hidden sm:flex"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link href={`/admin/${library.id}`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Library</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this library? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image with Badges */}
          {library.preview && (
            <div
              className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openImageViewer(0)}
            >
              <Image
                src={getImageUrl(library.preview)}
                alt={`${library.name} preview`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 z-10">
                <LibraryBadges
                  tags={library.tags || []}
                  isPaid={library.is_paid}
                  isMobileFriendly={library.is_mobile_friendly}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm">
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
                    className="relative aspect-video bg-muted rounded overflow-hidden cursor-pointer group"
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