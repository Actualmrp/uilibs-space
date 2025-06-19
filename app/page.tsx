"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, X, SortAsc } from "lucide-react"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/client"
import { LibraryCard } from "@/components/app/libraryCard"
import { useDebounce } from "@/hooks/use-debounce"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 6

type SortOption = "newest" | "oldest" | "name" | "author"

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
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || "")
  const [tagSearch, setTagSearch] = useState("")
  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedTagSearch = useDebounce(tagSearch, 300)
  const [sortOption, setSortOption] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || "newest"
  )
  const { favorites } = useFavorites()

  const filters = useMemo(() => ({
    showPaid: searchParams.get('paid') !== 'false',
    showFree: searchParams.get('free') !== 'false',
    mobileFriendly: searchParams.get('mobile') === 'true',
    onlyFavorites: searchParams.get('favorites') === 'true',
    selectedTags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
  }), [searchParams])

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
  const allTags = useMemo(() => 
    Array.from(new Set(libraries.flatMap(lib => lib.tags || []))),
    [libraries]
  )

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!debouncedTagSearch) return allTags
    return allTags.filter(tag => 
      tag.toLowerCase().includes(debouncedTagSearch.toLowerCase())
    )
  }, [allTags, debouncedTagSearch])

  const filteredAndSortedLibraries = useMemo(() => {
    let result = libraries.filter((library) => {
      const searchTerms = debouncedSearch.toLowerCase().split(' ')
      const matchesSearch = searchTerms.every(term => 
        library.name.toLowerCase().includes(term) ||
        library.description.toLowerCase().includes(term) ||
        library.author.toLowerCase().includes(term) ||
        library.tags?.some(tag => tag.toLowerCase().includes(term))
      )

      const matchesPaidFilter = 
        (library.is_paid && filters.showPaid) || 
        (!library.is_paid && filters.showFree)

      const matchesMobileFilter = 
        !filters.mobileFriendly || 
        library.is_mobile_friendly

      const matchesTags = 
        filters.selectedTags.length === 0 || 
        filters.selectedTags.every(tag => library.tags?.includes(tag))

      const matchesFavorites =
        !filters.onlyFavorites ||
        favorites.includes(library.id)

      return matchesSearch && matchesPaidFilter && matchesMobileFilter && matchesTags && matchesFavorites
    })

    // Apply sorting
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        case "author":
          return a.author.localeCompare(b.author)
        default: // "newest"
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [libraries, debouncedSearch, filters, favorites, sortOption])

  const totalPages = Math.ceil(filteredAndSortedLibraries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedLibraries = filteredAndSortedLibraries.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
    } else {
        params.set(key, value)
      }
    })
    
    // Reset to first page when filters change
    if (Object.keys(updates).some(key => key !== 'page')) {
    params.set('page', '1')
    }
    
    router.push(`/?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    setSearchInput(value)
    updateSearchParams({ search: value || null })
  }

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag]
    
    updateSearchParams({ 
      tags: newTags.length > 0 ? newTags.join(',') : null 
    })
  }

  const handleFilterChange = (key: string, value: boolean) => {
    updateSearchParams({ [key]: value ? 'true' : 'false' })
  }

  const handleSortChange = (value: SortOption) => {
    setSortOption(value)
    updateSearchParams({ sort: value })
  }

  const clearAllFilters = () => {
    updateSearchParams({
      search: null,
      paid: null,
      free: null,
      mobile: null,
      tags: null,
      sort: null,
      page: '1'
    })
    setSearchInput("")
    setSortOption("newest")
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(true)
      } else if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <svg width="100%" height="100%" viewBox="0 0 108 109" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2 flex-wrap">
                  UI Libraries Explorer 
                  <Badge className="rounded-sm">Beta</Badge>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Discover component libraries for your scripts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button onClick={() => router.push('/admin/new')} className="mr-2">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">New Library</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
                placeholder="Search libraries... (⌘/Ctrl + F)"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none items-center gap-2">
                    <SortAsc className="w-4 h-4" />
                    <span className="hidden sm:inline">Sort</span>
                    <Badge variant="secondary" className="ml-2">
                      {sortOption}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleSortChange("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("name")}>
                    Name A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("author")}>
                    Author A-Z
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {(filters.showPaid !== true || filters.showFree !== true || 
                      filters.mobileFriendly || filters.selectedTags.length > 0 || filters.onlyFavorites) && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.selectedTags.length +
                          (filters.showPaid !== filters.showFree ? 1 : 0) +
                          (filters.mobileFriendly ? 1 : 0) +
                          (filters.onlyFavorites ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Pricing Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Pricing</h4>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between space-x-2">
                          <label className="text-sm">Free Libraries</label>
                          <Switch
                            checked={filters.showFree}
                            onCheckedChange={(checked) => handleFilterChange('free', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <label className="text-sm">Paid Libraries</label>
                          <Switch
                            checked={filters.showPaid}
                            onCheckedChange={(checked) => handleFilterChange('paid', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Features</h4>
                      <div className="flex items-center justify-between space-x-2">
                        <label className="text-sm">Mobile Friendly</label>
                        <Switch
                          checked={filters.mobileFriendly}
                          onCheckedChange={(checked) => handleFilterChange('mobile', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <label className="text-sm">Favorites Only</label>
                        <Switch
                          checked={filters.onlyFavorites}
                          onCheckedChange={(checked) => handleFilterChange('favorites', checked)}
                        />
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Tags</h4>
                        {filters.selectedTags.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSearchParams({ tags: null })}
                            className="h-7 text-xs"
                          >
                            Clear ({filters.selectedTags.length})
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Search tags..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
                        {filteredTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={filters.selectedTags.includes(tag) ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer hover:opacity-80 transition-opacity text-xs py-0.5",
                              filters.selectedTags.includes(tag) ? "bg-primary" : "bg-background"
                            )}
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {filteredTags.length === 0 && (
                          <p className="text-sm text-muted-foreground p-2">
                            No tags found
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {(debouncedSearch || filters.showPaid !== true || filters.showFree !== true || 
                filters.mobileFriendly || filters.selectedTags.length > 0 || filters.onlyFavorites || sortOption !== "newest") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearAllFilters}
                  className="shrink-0"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 mt-8 sm:mt-12">
        {filteredAndSortedLibraries.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground text-base sm:text-lg">No libraries found</p>
            <Button variant="outline" onClick={clearAllFilters} className="mt-4">
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedLibraries.map((library) => (
                <LibraryCard key={library.id} library={library} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem className="hidden sm:inline-block">
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

                    <PaginationItem className="hidden sm:inline-block">
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
            <div className="mt-6 sm:mt-8 text-center text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedLibraries.length)} of{" "}
              {filteredAndSortedLibraries.length} libraries
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
