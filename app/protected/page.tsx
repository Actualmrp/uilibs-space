import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const user = data.user
  const initials = user.email?.slice(0, 2).toUpperCase() || 'U'
  const displayName = user.user_metadata?.full_name || user.email

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-none shadow-none">
        <CardContent className="space-y-8 text-center">
          <Avatar className="mx-auto h-20 w-20">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Welcome to UILibs</h1>
            <p className="text-lg text-muted-foreground">
              {displayName}
            </p>
          </div>
          <Link href="/">
            <Button className="w-full">Go to Main Page</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
