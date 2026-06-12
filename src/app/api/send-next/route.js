import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin client — uses the service_role key, bypasses RLS (server-only!)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST() {
  try {
    // 1. Grab the oldest queued email
    const { data: emails, error: fetchError } = await admin
      .from('emails')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1)

    if (fetchError) throw fetchError

    if (!emails || emails.length === 0) {
      return NextResponse.json({ message: 'No queued emails.' })
    }

    const email = emails[0]

    // 2. Mark it 'sending' so it isn't picked up twice
    await admin.from('emails').update({ status: 'sending' }).eq('id', email.id)

   // 3. Get the sender's profile (name, email, resume path)
    const { data: profile } = await admin
      .from('profiles')
      .select('name, email, resume_url')
      .eq('id', email.user_id)
      .single()

    // 3b. Download the resume from Storage and convert to base64 (for attaching)
    let attachment = null
    if (profile?.resume_url) {
      const { data: fileData, error: fileError } = await admin.storage
        .from('resumes')
        .download(profile.resume_url)

      if (!fileError && fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer())
        attachment = [
          {
            content: buffer.toString('base64'),
            name: 'resume.pdf',
          },
        ]
      }
    }

    // 4. Send via Brevo
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: profile?.name || 'Mailvio User' },
        replyTo: { email: profile?.email || process.env.BREVO_SENDER_EMAIL },
       to: [{ email: email.recruiter_email }],
        subject: email.subject,
        textContent: email.body,
        ...(attachment && { attachment }),
      }),
    })

    // 5. Update status based on the result
    if (brevoRes.ok) {
      await admin
        .from('emails')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', email.id)
      return NextResponse.json({ message: `Sent to ${email.recruiter_email} ✅` })
    } else {
      const errText = await brevoRes.text()
      await admin
        .from('emails')
        .update({ status: 'failed', error: errText })
        .eq('id', email.id)
      return NextResponse.json({ message: 'Send failed', error: errText }, { status: 500 })
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}