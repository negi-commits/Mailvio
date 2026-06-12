'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [credits, setCredits] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoggedIn(false); return }
      setLoggedIn(true)
      const { data } = await supabase
        .from('profiles')
        .select('free_credits, paid_credits')
        .eq('id', user.id)
        .single()
      if (data) setCredits((data.free_credits || 0) + (data.paid_credits || 0))
    }
    load()
  }, [pathname])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Don't show navbar on the login page
  if (pathname === '/login') return null

  const links = [
    { href: '/', label: 'Home' },
    { href: '/compose', label: 'Compose' },
    { href: '/profile', label: 'Profile' },
    { href: '/admin', label: 'Queue' },
  ]

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 22px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>✉</div>
        <span style={{ color: '#fff', fontWeight: 500, fontSize: 17 }}>Mailvio</span>
      </a>

      {loggedIn && (
        <>
          <div style={{ display: 'flex', gap: 4 }}>
            {links.map((l) => (
              <a key={l.href} href={l.href} style={{
                color: pathname === l.href ? '#e0dcf2' : 'var(--text-muted)',
                fontSize: 14, padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
                background: pathname === l.href ? 'var(--border)' : 'transparent',
              }}>
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {credits !== null && (
              <span style={{ color: '#e0dcf2', fontSize: 13, background: 'var(--border)', padding: '5px 12px', borderRadius: 20 }}>
                ⚡ {credits} credits
              </span>
            )}
            <button onClick={logout} style={{
              background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)',
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
            }}>
              Log out
            </button>
          </div>
        </>
      )}
    </nav>
  )
}