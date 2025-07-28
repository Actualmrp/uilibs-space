"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSupabaseUpload } from "@/hooks/use-supabase-upload"
import { ArrowLeft, Trash2, X } from "lucide-react"
import Link from "next/link"
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
} from "@/components/ui/alert-dialog"
import { v4 as uuidv4 } from 'uuid'
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { ImageManager } from "@/components/ui/image-manager"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditLibraryPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const supabase = createClient()

  // ✅ Automatically link Discord ID to Admin row if found
  useEffect(() => {
    const linkDiscordToAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub
      if (!discordId) return

      const { error } = await supabase
        .from("admins")
        .update({ id: user.id })
        .eq("discord_id", discordId)

      if (error) {
        console.error("Error linking admin:", error)
      }
    }

    linkDiscordToAdmin()
  }, [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    about: "",
    author: "",
    author_bio: "",
    website: "",
    github: "",
    is_paid: false,
    is_mobile_friendly: false,
    tags: [] as string[],
  })
  const [existingImages, setExistingImages] = useState<{ preview: string | null; gallery: string[] }>({
    preview: null,
    gallery: [],
  })
  const [newTag, setNewTag] = useState("")

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

  useEffect(() => {
    const fetchLibrary = async () => {
      const { data, error } = await supabase
        .from("libraries")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (error) {
        console.error("Error fetching library:", error)
        router.push("/admin")
        return
      }

      setFormData({
        name: data.name,
        description: data.description,
        about: data.about,
        author: data.author,
        author_bio: data.author_bio,
        website: data.website,
        github: data.github,
        is_paid: data.is_paid || false,
        is_mobile_friendly: data.is_mobile_friendly || false,
        tags: data.tags || [],
      })

      setExistingImages({
        preview: data.preview,
        gallery: data.gallery || [],
      })

      setLoading(false)
    }

    fetchLibrary()
  }, [resolvedParams.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (uploadProps.files.length > 0) {
        await uploadProps.onUpload()
        if (uploadProps.errors.length > 0) {
          throw new Error("Failed to upload images: " + uploadProps.errors.map(e => e.message).join(", "))
        }
      }

      const { error } = await supabase
        .from("libraries")
        .update({
          ...formData,
          preview: uploadProps.files[0] ? `libs/${folderName}/${uploadProps.files[0].name}` : existingImages.preview,
          gallery: [
            ...(uploadProps.files.slice(1).map(f => `libs/${folderName}/${f.name}`) || []),
            ...existingImages.gallery,
          ],
        })
        .eq("id", resolvedParams.id)

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      router.push("/admin")
    } catch (error) {
      console.error("Error updating library:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("libraries")
        .delete()
        .eq("id", resolvedParams.id)

      if (error) throw error

      router.push("/admin")
    } catch (error) {
      console.error("Error deleting library:", error)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(newTag.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag.trim()]
        })
      }
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleRemoveImage = (path: string) => {
    if (path === existingImages.preview) {
      setExistingImages(prev => ({ ...prev, preview: null }))
    } else {
      setExistingImages(prev => ({
        ...prev,
        gallery: prev.gallery.filter(img => img !== path)
      }))
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    // 👇 same as before
    <div className="min-h-screen p-8">
      {/* Your existing UI */}
    </div>
  )
}