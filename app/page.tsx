"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
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
  tags: string[]
  is_paid: boolean
  is_mobile_friendly: boolean
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    showPaid: true,
    showFree: true,
    mobileFriendly: false,
    selectedTags: [] as string[],
  })

  const currentSearch = searchParams.get('search') || ""
  const currentPage = Number(searchParams.get('page')) || 1

  useEffect(() => {
    const fetchLibraries = async () => {
      const supabase = createClient()
      
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        setIsAdmin(profile?.role === "admin")
      }

      // Fetch libraries
      const { data } = await supabase
        .from("libraries")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) {
        setLibraries(data)
      }
      setLoading(false)
    }

    fetchLibraries()
  }, [])

  // Get all unique tags from libraries
  const allTags = Array.from(new Set(libraries.flatMap(lib => lib.tags || [])))

  const filteredLibraries = libraries.filter(
    (library) => {
      const matchesSearch = 
        library.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        library.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        library.author.toLowerCase().includes(currentSearch.toLowerCase())

      const matchesPaidFilter = 
        (library.is_paid && filters.showPaid) || 
        (!library.is_paid && filters.showFree)

      const matchesMobileFilter = 
        !filters.mobileFriendly || 
        library.is_mobile_friendly

      const matchesTags = 
        filters.selectedTags.length === 0 || 
        filters.selectedTags.some(tag => library.tags?.includes(tag))

      return matchesSearch && matchesPaidFilter && matchesMobileFilter && matchesTags
    }
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

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }))
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
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button onClick={() => router.push('/admin/new')} className="mr-2">
                  <Plus className="w-4 h-4 mr-2" />
                  New Library
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={currentSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
                placeholder="Search libraries..."
              />
            </div>
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                  {(filters.showPaid !== filters.showFree || filters.mobileFriendly || filters.selectedTags.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.selectedTags.length +
                        (filters.showPaid !== filters.showFree ? 1 : 0) +
                        (filters.mobileFriendly ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Libraries</DialogTitle>
                  <DialogDescription>
                    Select filters to narrow down the libraries
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Price</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Show Paid Libraries</label>
                        <Switch
                          checked={filters.showPaid}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showPaid: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Show Free Libraries</label>
                        <Switch
                          checked={filters.showFree}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showFree: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Features</h4>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Mobile Friendly Only</label>
                      <Switch
                        checked={filters.mobileFriendly}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, mobileFriendly: checked }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={filters.selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16 mt-12">
        {filteredLibraries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No libraries found</p>
            <Button variant="outline" onClick={() => {
              handleSearch('')
              setFilters({
                showPaid: true,
                showFree: true,
                mobileFriendly: false,
                selectedTags: [],
              })
            }} className="mt-4">
              Clear all filters
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
