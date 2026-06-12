import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Models to try in order — if one is busy (503), fall through to the next
const MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash']

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function POST(request) {
  try {
    const { recruiterEmail, note, templateGuidance, senderName } = await request.json()

    const prompt = `You are helping a job seeker write a professional outreach email to a recruiter.

Sender's name: ${senderName || 'the candidate'}
Context/note from sender: ${note || 'No extra context provided.'}

Template style to follow: ${templateGuidance}

Write a complete email. Return ONLY valid JSON in this exact shape, nothing else:
{"subject": "the subject line", "body": "the full email body"}

Keep it concise, professional, and human. Do not invent fake achievements. Sign off with the sender's name.`

    let lastError = null

    // Try each model, with 2 attempts each
    for (const model of MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({ model, contents: prompt })
          let text = response.text.trim()
          text = text.replace(/```json/g, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(text)
          return NextResponse.json({ subject: parsed.subject, body: parsed.body })
        } catch (err) {
          lastError = err
          // If it's a "busy" error, wait a moment and retry
          if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('overloaded')) {
            await sleep(1500)
            continue
          }
          // Other errors: don't retry this model, move to next
          break
        }
      }
    }

    // All attempts failed
    return NextResponse.json(
      { error: lastError?.message || 'All models busy, please try again.' },
      { status: 503 }
    )
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}