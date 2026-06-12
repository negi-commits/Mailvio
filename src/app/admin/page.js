'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const supabase = createClient()
  const [emails, setEmails] = useState([])
  const [message, setMessage] = useState('')
  const [working, setWorking] = useState(false)

  async function loadEmails() {
    const { data } = await supabase
      .from('emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setEmails(data)
  }

  useEffect(() => { loadEmails() }, [])

  async function sendNext() {
    setWorking(true)
    setMessage('Sending the next queued email...')
    const res = await fetch('/api/send-next', { method: 'POST' })
    const data = await res.json()
    setMessage(data.message || data.error || 'Done')
    await loadEmails()
    setWorking(false)
  }

  const queued = emails.filter((e) => e.status === 'queued').length
  const sent = emails.filter((e) => e.status === 'sent').length
  const failed = emails.filter((e) => e.status === 'failed').length

  const badge = (status) => {
    const map = {
      queued: { bg: 'rgba(157,141,241,0.15)', color: '#b9a8f5', label: 'Queued' },
      sending: { bg: 'rgba(111,125,240,0.15)', color: '#8b9bf5', label: 'Sending' },
      sent: { bg: 'rgba(93,202,165,0.15)', color: '#5dcaa5', label: 'Sent' },
      failed: { bg: 'rgba(226,75,74,0.15)', color: '#e24b4a', label: 'Failed' },
    }
    const s = map[status] || map.queued
    return (
      <span style={{ background: s.bg, color: s.color, fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 500 }}>
        {s.label}
      </span>
    )
  }

  const statCard = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: 20, textAlign: 'center', flex: 1,
  }

  return (
    <div style={{ maxWidth: 820, margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 500, margin: '0 0 6px' }}>Email queue</h1>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 28px' }}>Process and monitor your outgoing emails.</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={statCard}>
          <p style={{ color: 'var(--accent)', fontSize: 34, margin: 0, fontWeight: 500 }}>{queued}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Waiting</p>
        </div>
        <div style={statCard}>
          <p style={{ color: '#5dcaa5', fontSize: 34, margin: 0, fontWeight: 500 }}>{sent}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Sent</p>
        </div>
        <div style={statCard}>
          <p style={{ color: '#e24b4a', fontSize: 34, margin: 0, fontWeight: 500 }}>{failed}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Failed</p>
        </div>
      </div>

      <button
        onClick={sendNext}
        disabled={working || queued === 0}
        style={{
          width: '100%', padding: 15, borderRadius: 12, border: 'none', marginBottom: 12,
          background: queued === 0 ? 'var(--surface)' : 'var(--gradient)',
          color: queued === 0 ? 'var(--text-muted)' : '#fff',
          fontSize: 16, fontWeight: 500, cursor: working || queued === 0 ? 'default' : 'pointer',
        }}
      >
        {working ? 'Sending...' : queued === 0 ? 'No emails waiting' : `Send next email (${queued} waiting)`}
      </button>

      {message && <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>{message}</p>}

      <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 500, margin: '24px 0 14px' }}>Recent emails</h2>

      <div style={{ display: 'grid', gap: 10 }}>
        {emails.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No emails yet. Go compose one!</p>
        )}
        {emails.map((e) => (
          <div key={e.id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#fff', fontSize: 15, margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.subject || '(no subject)'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '3px 0 0' }}>
                → {e.recruiter_email}
              </p>
            </div>
            {badge(e.status)}
          </div>
        ))}
      </div>
    </div>
  )
}