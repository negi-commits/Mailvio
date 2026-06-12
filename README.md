# Mailvio

AI-powered job outreach tool. Stop copy-pasting recruiter emails — Mailvio writes personalized outreach with AI and sends it with your resume attached, in one click.

## The problem

Every job seeker faces the same grind: find a recruiter, copy their email, open your mailbox, write a professional message, attach your resume, send. Then repeat for the next recruiter, and the next. It's repetitive, slow, and most people either give up or send lazy copy-paste emails that get ignored. Mailvio eliminates this entire manual process.

## How it works

1. Set up your profile once — name, email, and resume (PDF)
2. Enter a recruiter's email, add a note for context, and pick one of 5 templates
3. AI generates a tailored, professional email
4. Send — it queues and goes out via email, with your resume attached
5. 5 free emails, then ₹10 per additional email

## Tech stack

- **Frontend & backend:** Next.js (App Router)
- **Database, auth & storage:** Supabase (Postgres, Row Level Security, file storage)
- **AI:** Google Gemini (email generation)
- **Email delivery:** Brevo
- **Payments:** Razorpay (₹10 per credit)

## Key features

- Email/password authentication with persistent sessions
- Resume upload to private, per-user storage
- 5 AI templates stored in the database (editable without redeploys)
- A credit system enforced at the database level — the "5 free, then pay" rule can't be bypassed from the browser
- An email queue with status tracking (queued → sending → sent / failed)
- A paywall flow with a checkout screen

## Architecture highlights

- **Database-level credit gate:** all sends pass through a single `enqueue_email` Postgres function (`security definer`) that atomically checks credits, spends one, and queues the email. The browser has no direct write access to the emails table, so the rule is unbreakable.
- **Row Level Security** ensures every user can only access their own data.
- **A queue table** doubles as both the counter (how many sent) and the queue (oldest queued email is next), keeping a single source of truth.

## Running locally

1. Clone the repo and run `npm install`
2. Create a `.env.local` with your keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   GEMINI_API_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   BREVO_API_KEY=
   BREVO_SENDER_EMAIL=
   ```
3. Run the database schema (in `mailvio_schema.sql`) in your Supabase SQL editor
4. Start the dev server: `npm run dev`
5. Open `http://localhost:3000`

## Status

Built as a working MVP. Roadmap: automated queue worker (30-second cron), live payments via Razorpay, and email confirmation for production.