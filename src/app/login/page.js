'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSignUp() {
    setMessage('Creating your account...')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage('Error: ' + error.message)
    else setMessage('Account created! Now click Log in.')
  }

  async function handleLogin() {
    setMessage('Logging in...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage('Error: ' + error.message)
    else router.push('/')
  }

  const field = {
    width: '100%', padding: 12, marginBottom: 12, borderRadius: 8,
    background: 'var(--surface-2)', color: '#fff', border: '1px solid var(--border)',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, justifyContent: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>✉</div>
          <span style={{ color: '#fff', fontWeight: 500, fontSize: 24 }}>Mailvio</span>
        </div>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 14, margin: '0 0 28px' }}>
          Reach recruiters, effortlessly.
        </p>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={field} />

        <button
          onClick={handleLogin}
          style={{ width: '100%', padding: 13, marginTop: 4, background: 'var(--gradient)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}
        >
          Log in
        </button>
        <button
          onClick={handleSignUp}
          style={{ width: '100%', padding: 13, marginTop: 10, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 15 }}
        >
          Create account
        </button>

        {message && <p style={{ marginTop: 18, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>{message}</p>}
      </div>
    </div>
  )
}