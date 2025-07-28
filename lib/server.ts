import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies() // NO await here

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // Remove or leave empty setAll, since cookie setting isn't supported here
        setAll(_cookiesToSet) {
          // no-op or log warning
          // Cookies should be set in middleware or API routes if needed
        },
      },
    }
  )
}