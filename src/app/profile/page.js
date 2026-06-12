'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const supabase = createClient()

  const [userId, setUserId] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('name, email, resume_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setName(data.name || '')
        setEmail(data.email || '')
        setResumeUrl(data.resume_url || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setMessage('Uploading resume...')
    const filePath = `${userId}/resume.pdf`
    const { error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true })
    if (error) setMessage('Upload error: ' + error.message)
    else { setResumeUrl(filePath); setMessage('Resume uploaded! Remember to save.') }
  }

  async function handleSave() {
    setMessage('Saving...')
    const { error } = await supabase
      .from('profiles')
      .update({ name, email, resume_url: resumeUrl })
      .eq('id', userId)
    if (error) setMessage('Save error: ' + error.message)
    else setMessage('Profile saved! ✅')
  }

  const label = { display: 'block', marginBottom: 6, color: '#fff', fontSize: 14 }
  const field = {
    width: '100%', padding: 11, borderRadius: 8,
    background: 'var(--surface-2)', color: '#fff', border: '1px solid var(--border)',
  }

  if (loading) return <p style={{ padding: 40, color: 'var(--text-muted)' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 500, marginBottom: 28 }}>My profile</h1>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
        <label style={label}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={field} />

        <label style={{ ...label, marginTop: 18 }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={field} />

        <label style={{ ...label, marginTop: 18 }}>Resume (PDF)</label>
        <input type="file" accept="application/pdf" onChange={handleResumeUpload} style={{ color: 'var(--text-muted)' }} />
        {resumeUrl && <p style={{ color: '#5dcaa5', fontSize: 14, marginTop: 8 }}>✓ Resume on file</p>}

        <button
          onClick={handleSave}
          style={{ marginTop: 24, width: '100%', padding: 13, background: 'var(--gradient)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}
        >
          Save profile
        </button>

        {message && <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>}
      </div>
    </div>
  )
}