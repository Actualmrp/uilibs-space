import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"

interface LibraryBadgesProps {
  tags: string[]
  isPaid: boolean
  isMobileFriendly: boolean
}

export function LibraryBadges({ tags, isPaid, isMobileFriendly }: LibraryBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {isPaid ? (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Icons.Paid className="w-3 h-3" />
          Paid
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1">
          <Icons.OpenSource className="w-3 h-3" />
          Open Source
        </Badge>
      )}
      
      {isMobileFriendly && (
        <Badge variant="secondary">
          Mobile Friendly
        </Badge>
      )}
      
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  )
} 