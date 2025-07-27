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
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

export default AdminPage