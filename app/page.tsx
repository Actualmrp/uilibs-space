"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Command, MessageSquare } from "lucide-react"
import { CommandDialog } from "@/components/command-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/client"
import { LibraryCard } from "@/components/app/libraryCard"

const ITEMS_PER_PAGE = 6

interface Library {
  id: string
  name: string
  description: string
  about: string
  author: string
  author_bio: string
  website: string | null
  github: string | null
  preview: string | null
  gallery: string[]
  created_at: string
  updated_at: string
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [commandOpen, setCommandOpen] = useState(false)
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false)
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(true)

  // Get current search and page from URL
  const currentSearch = searchParams.get('search') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('libraries')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setLibraries(data || [])
      } catch (error) {
        console.error('Error fetching libraries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLibraries()
  }, [])

  useEffect(() => {
    // Check if we should show the Discord modal
    const checkDiscordModal = () => {
      const lastShown = localStorage.getItem('discordModalLastShown')
      const now = new Date().getTime()
      
      if (!lastShown) {
        // First time visitor
        setDiscordDialogOpen(true)
        localStorage.setItem('discordModalLastShown', now.toString())
        return
      }

      const oneDay = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      const timeSinceLastShown = now - parseInt(lastShown)

      if (timeSinceLastShown >= oneDay) {
        setDiscordDialogOpen(true)
        localStorage.setItem('discordModalLastShown', now.toString())
      }
    }

    checkDiscordModal()
  }, [])

  const filteredLibraries = libraries.filter(
    (library) =>
      library.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
      library.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
      library.author.toLowerCase().includes(currentSearch.toLowerCase())
  )

  const totalPages = Math.ceil(filteredLibraries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedLibraries = filteredLibraries.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/?${params.toString()}`)
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading libraries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              
              <div className="w-10 h-10">
                <svg width="40" height="40" viewBox="0 0 108 109" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10H42V99H10V10Z" fill="currentColor" fillOpacity="0.4"/>
                  <path d="M42 10H99V42H42V10Z" fill="currentColor" fillOpacity="0.4"/>
                  <path d="M12 87V107M97 2V107M2 97H22M40 87V107M30 97H40M49 97H106M12 73V78M12 59V64M40 73V78M40 59V64M12 30V50M40 50V40H30M2 40H22M12 2V22M2 12H22M30 12H40M49 12H106M49 40H106" stroke="url(#paint0_linear_16_50)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="paint0_linear_16_50" x1="102" y1="14" x2="2" y2="82" gradientUnits="userSpaceOnUse">
                      <stop stopColor="currentColor"/>
                      <stop offset="1" stopColor="currentColor" stopOpacity="0.7"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div>
                <h1 className="text-3xl font-semibold">UI Libraries Explorer <Badge className="rounded-sm">Beta</Badge></h1>
                <p className="text-muted-foreground mt-2">Discover component libraries for your scripts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={discordDialogOpen} onOpenChange={setDiscordDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Join Our Discord Community</DialogTitle>
                    <DialogDescription>
                      Join our Discord server to share your UI libraries and connect with other developers!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div>
                      <h3 className="font-semibold mb-2">Forum Name: uilibs</h3>
                      <p className="text-sm text-muted-foreground">Share your UI libraries and get them featured on our platform!</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Publishing Rules:</h3>
                      <ul className="list-disc pl-6 space-y-2 text-sm">
                        <li>Only UI-libraries for Roblox are allowed. Off-topic posts are not permitted.</li>
                        <li>When posting a UI-library, please include:</li>
                        <ul className="list-disc pl-6 space-y-1 mt-1">
                          <li>Library name</li>
                          <li>Author's name (if known)</li>
                          <li>1 main preview image</li>
                          <li>Additional screenshots (preview)</li>
                          <li>Brief description (info)</li>
                          <li>Link to GitHub (if available)</li>
                          <li>Link to official website (if available)</li>
                        </ul>
                      </ul>
                    </div>

                    <div className="pt-4">
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          window.open('https://discord.gg/fHP8T9jNJW', '_blank')
                          setDiscordDialogOpen(false)
                        }}
                      >
                        Join Discord Server
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search libraries..."
              value={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setCommandOpen(true)} className="flex items-center gap-2">
            <Command className="w-4 h-4" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
        </div>
      </section>

      {/* Libraries */}
      <main className="max-w-6xl mx-auto px-6 pb-16">
        {filteredLibraries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No libraries found</p>
            <Button variant="outline" onClick={() => handleSearch('')} className="mt-4">
              Clear search
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedLibraries.map((library) => (
                <LibraryCard key={library.id} library={library} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) handlePageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Results info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredLibraries.length)} of{" "}
              {filteredLibraries.length} libraries
            </div>
          </>
        )}
      </main>

      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        libraries={libraries}
        onSelect={(library) => {
          setCommandOpen(false)
          router.push(`/library/${library.id}`)
        }}
      />
    </div>
  )
}
