'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ComposePage() {
  const supabase = createClient()

  const [recruiterEmail, setRecruiterEmail] = useState('')
  const [note, setNote] = useState('')
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [message, setMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [needsPayment, setNeedsPayment] = useState(false)

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    async function loadTemplates() {
      const { data } = await supabase.from('templates').select('*')
      if (data) setTemplates(data)
    }
    loadTemplates()
  }, [])

  async function handleGenerate() {
    if (!recruiterEmail) return setMessage('Please enter the recruiter\'s email.')
    if (!selectedTemplate) return setMessage('Please pick a template.')

    setMessage('')
    setGenerating(true)
    setSubject('')
    setBody('')

    const template = templates.find((t) => t.id === selectedTemplate)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterEmail,
          note,
          templateGuidance: template.prompt_guidance,
          senderName: profile?.name,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setMessage('Generation failed: ' + data.error)
      } else {
        setSubject(data.subject)
        setBody(data.body)
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSend() {
    setSending(true)
    setMessage('')

    const { data, error } = await supabase.rpc('enqueue_email', {
      p_recruiter_email: recruiterEmail,
      p_template_id: selectedTemplate,
      p_subject: subject,
      p_body: body,
    })

    setSending(false)

    if (error) {
      if (error.message.includes('payment_required')) {
        setNeedsPayment(true)
      } else {
        setMessage('Send error: ' + error.message)
      }
    } else {
      setMessage('Email queued! ✅ It will send shortly.')
      setSubject('')
      setBody('')
      setRecruiterEmail('')
      setNote('')
    }
  }

  function handlePay() {
    window.location.href = '/checkout'
  }

  const label = { display: 'block', marginBottom: 6, color: '#fff', fontSize: 14 }
  const field = {
    width: '100%', padding: 11, borderRadius: 8,
    background: 'var(--surface-2)', color: '#fff', border: '1px solid var(--border)',
  }

  return (
    <div style={{ maxWidth: 620, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 500, marginBottom: 24 }}>New outreach</h1>

      <label style={label}>Recruiter's email</label>
      <input
        type="email"
        value={recruiterEmail}
        onChange={(e) => setRecruiterEmail(e.target.value)}
        placeholder="recruiter@company.com"
        style={field}
      />

      <label style={{ ...label, marginTop: 18 }}>
        Note <span style={{ color: 'var(--text-muted)' }}>(context — role, company, anything specific)</span>
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Saw your LinkedIn post about the frontend role at Acme..."
        rows={4}
        style={{ ...field, fontFamily: 'inherit' }}
      />

      <label style={{ ...label, marginTop: 18, marginBottom: 10 }}>Pick a template</label>
      <div style={{ display: 'grid', gap: 10 }}>
        {templates.map((t) => {
          const active = selectedTemplate === t.id
          return (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: active ? 'rgba(157,141,241,0.12)' : 'var(--surface)',
                border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              <strong style={{ color: '#fff', fontSize: 15 }}>{t.name}</strong>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{t.description}</p>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        style={{
          marginTop: 24, width: '100%', padding: 13, borderRadius: 10, border: 'none',
          background: 'var(--gradient)', color: '#fff', fontSize: 15, fontWeight: 500,
          cursor: generating ? 'default' : 'pointer',
        }}
      >
        {generating ? 'Generating...' : 'Generate email'}
      </button>

      {needsPayment && (
        <div style={{ marginTop: 20, padding: 20, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--accent)', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px', color: '#fff' }}>You're out of free emails</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--text-muted)' }}>Pay ₹10 to send one more email.</p>
          <button onClick={handlePay} style={{ padding: '12px 24px', background: 'var(--gradient)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>
            Pay ₹10
          </button>
        </div>
      )}

      {message && <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>{message}</p>}

      {subject && (
        <div style={{ marginTop: 28, padding: 18, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <label style={label}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} style={{ ...field, marginBottom: 14 }} />
          <label style={label}>Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} style={{ ...field, fontFamily: 'inherit' }} />
          <button
            onClick={handleSend}
            disabled={sending}
            style={{ marginTop: 14, width: '100%', padding: 12, background: 'var(--gradient)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}
          >
            {sending ? 'Sending...' : 'Send email'}
          </button>
        </div>
      )}
    </div>
  )
}