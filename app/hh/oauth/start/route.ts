import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { HH_AUTH_URL } from '@/lib/hh'

export async function GET() {
  const session = await auth()
  if (!session) redirect('/login')

  const clientId    = process.env.HH_CLIENT_ID!
  const redirectUri = process.env.HH_REDIRECT_URI!

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
  })

  redirect(`${HH_AUTH_URL}?${params}`)
}
