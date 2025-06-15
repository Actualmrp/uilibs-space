"use client";

import { use } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImageViewer } from "@/components/image-viewer";
import { MarkdownExample } from "@/components/markdown-example";

import { libraryData } from "@/lib/libraryData";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LibraryPage({ params }: PageProps) {
  const { id } = use(params);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const library = libraryData[id as keyof typeof libraryData];

  if (!library) {
    notFound();
  }

  const allImages = [library.preview, ...library.gallery];

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
                  <Button size="sm" variant="outline">
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
                  <Button size="sm" variant="outline">
                    <Github className="w-4 h-4 mr-2" />
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
          <div
            className="relative h-64 bg-muted rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openImageViewer(0)}
          >
            <Image
              src={library.preview || "/placeholder.svg"}
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

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              <MarkdownExample title="Example" content={library.about} />
            </p>
          </div>

          {/* Gallery */}
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
                    src={image || "/placeholder.svg"}
                    alt={`${library.name} example ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Image Viewer */}
      <ImageViewer
        images={allImages}
        initialIndex={selectedImageIndex}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />
    </div>
  );
}
