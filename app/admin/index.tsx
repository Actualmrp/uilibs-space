// pages/admin/index.tsx
import { createServerClient } from '@supabase/ssr'
import type { GetServerSidePropsContext, NextPage } from 'next'

type Props = {}

const AdminPage: NextPage<Props> = () => {
  return <div>Welcome Admin!</div>
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { req: ctx.req, res: ctx.res }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }

  // No admin table check, all authenticated users allowed
  return {
    props: {},
  }
}

export default AdminPage