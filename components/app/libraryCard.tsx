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

type YourLibraryType = {
  id: string;
  name: string;
  description: string;
  author: string;
  image?: string;
};

export function LibraryCard({ library }: { library: YourLibraryType }) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/library/${library.id}`)}
      className="group hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
      <div className="relative h-40 bg-muted overflow-hidden">
        <Image
          src={library.image || "/placeholder.svg"}
          alt={`${library.name} preview`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
