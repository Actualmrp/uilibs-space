'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/client' // your Supabase client import

const supabase = createClient()

export function AdminLinker() {
  useEffect(() => {
    const linkDiscordToAdmin = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('Error fetching user:', userError)
        return
      }

      if (!user) return

      // Try to get Discord ID from metadata
      const discordId =
        user.user_metadata?.provider_id ||
        user.user_metadata?.provider?.id ||
        user.user_metadata?.sub

      console.log('User metadata:', user.user_metadata)
      console.log('Resolved Discord ID:', discordId)

      if (!discordId) return

      // Check if row with that Discord ID exists in `admins` table
      const { data: existing, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .eq('discord_id', discordId)
        .maybeSingle()

      if (fetchError) {
        console.error('Error checking admin row:', fetchError)
        return
      }

      if (existing && !existing.id) {
        // Update row to assign user.id
        const { error: updateError } = await supabase
          .from('admins')
          .update({ id: user.id })
          .eq('discord_id', discordId)

        if (updateError) {
          console.error('Error updating existing admin:', updateError)
        } else {
          console.log('Linked Supabase user ID to existing admin row.')
        }
      } else if (!existing) {
        // Insert a new admin row
        const { error: insertError } = await supabase
          .from('admins')
          .insert({ id: user.id, discord_id: discordId })

        if (insertError) {
          console.error('Error inserting new admin row:', insertError)
        } else {
          console.log('Inserted new admin row.')
        }
      } else {
        console.log('Admin already linked.')
      }
    }

    linkDiscordToAdmin()
  }, [])

  return null
}