"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSupabaseUpload } from "@/hooks/use-supabase-upload"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/dropzone"
import { v4 as uuidv4 } from 'uuid'

export default function NewLibraryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    about: "",
    author: "",
    author_bio: "",
    website: "",
    github: "",
  })

  // Generate a unique folder name for this library
  const folderName = formData.name 
    ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${uuidv4().slice(0, 8)}`
    : ''

  const uploadProps = useSupabaseUpload({
    bucketName: "libraries",
    maxFiles: 5,
    allowedMimeTypes: ["image/*"],
    path: folderName ? `libs/${folderName}` : undefined,
    upsert: true,
    onError: (error) => {
      console.error("Upload error:", error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // First upload images
      if (uploadProps.files.length > 0) {
        // Delete any existing files in the folder first
        if (folderName) {
          const { data: existingFiles } = await supabase.storage
            .from("libraries")
            .list(`libs/${folderName}`)
          
          if (existingFiles) {
            await Promise.all(
              existingFiles.map(file => 
                supabase.storage
                  .from("libraries")
                  .remove([`libs/${folderName}/${file.name}`])
              )
            )
          }
        }

        await uploadProps.onUpload()
        // Check if there are any errors after upload
        if (uploadProps.errors.length > 0) {
          throw new Error("Failed to upload images: " + uploadProps.errors.map(e => e.message).join(", "))
        }
      }
      
      // Then create library entry
      const { error } = await supabase.from("libraries").insert({
        ...formData,
        preview: uploadProps.files[0] ? `libs/${folderName}/${uploadProps.files[0].name}` : null,
        gallery: uploadProps.files.slice(1).map(f => `libs/${folderName}/${f.name}`),
      })

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      router.push("/admin")
    } catch (error) {
      console.error("Error creating library:", error)
      // You might want to show an error message to the user here
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Add New Library</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">About</label>
            <Textarea
              required
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="min-h-[200px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Author</label>
            <Input
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Author Bio</label>
            <Textarea
              value={formData.author_bio}
              onChange={(e) => setFormData({ ...formData, author_bio: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub</label>
            <Input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <Dropzone {...uploadProps}>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </div>

          <Button type="submit" disabled={loading || uploadProps.loading || !formData.name}>
            {loading ? "Creating..." : "Create Library"}
          </Button>
        </form>
      </div>
    </div>
  )
} 