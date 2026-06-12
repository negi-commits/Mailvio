'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [stats, setStats] = useState({ sent: 0, credits: 0, queued: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email)

      const { data: profile } = await supabase
        .from('profiles')
        .select('free_credits, paid_credits')
        .eq('id', user.id)
        .single()

      const { data: emails } = await supabase
        .from('emails')
        .select('status')
        .eq('user_id', user.id)

      const sent = emails?.filter((e) => e.status === 'sent').length || 0
      const queued = emails?.filter((e) => e.status === 'queued').length || 0
      const credits = (profile?.free_credits || 0) + (profile?.paid_credits || 0)
      setStats({ sent, credits, queued })
    }
    load()
  }, [])

  const card = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 28,
  }

  return (
    <div style={{ maxWidth: 980, margin: '56px auto', padding: '0 24px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, margin: '0 0 6px' }}>Welcome back</p>
      <h1 style={{ color: '#fff', fontSize: 34, margin: '0 0 36px', fontWeight: 500 }}>{email}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={card}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: '0 0 10px' }}>Emails sent</p>
          <p style={{ color: '#fff', fontSize: 40, margin: 0, fontWeight: 500 }}>{stats.sent}</p>
        </div>
        <div style={card}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: '0 0 10px' }}>Credits left</p>
          <p style={{ color: 'var(--accent)', fontSize: 40, margin: 0, fontWeight: 500 }}>{stats.credits}</p>
        </div>
        <div style={card}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: '0 0 10px' }}>In queue</p>
          <p style={{ color: '#fff', fontSize: 40, margin: 0, fontWeight: 500 }}>{stats.queued}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        <a href="/compose" style={{ background: 'var(--gradient)', borderRadius: 16, padding: 32, color: '#fff', textDecoration: 'none', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 34, marginBottom: 14 }}>✎</div>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 22 }}>New outreach</p>
          <p style={{ margin: '6px 0 0', fontSize: 15, opacity: 0.85 }}>Write &amp; send to a recruiter</p>
        </a>
        <a href="/profile" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, color: '#fff', textDecoration: 'none', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 34, marginBottom: 14, color: 'var(--accent)' }}>☺</div>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 22 }}>My profile</p>
          <p style={{ margin: '6px 0 0', fontSize: 15, color: 'var(--text-muted)' }}>Name, email, resume</p>
        </a>
      </div>
    </div>
  )
}