import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST() {
  try {
    // Confirm who is logged in
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    // ===== SIMULATED PAYMENT =====
    // Real Razorpay verification will go HERE later.

    // Record the payment
    await admin.from('payments').insert({
      user_id: user.id,
      amount_paise: 1000,
      razorpay_order_id: 'SIMULATED_' + Date.now(),
      status: 'paid',
    })

    // Grant 1 paid credit using your Slice 0 function
    const { error } = await admin.rpc('grant_paid_credit', { p_user: user.id })
    if (error) throw error

    return NextResponse.json({ message: 'Payment successful! +1 credit added.' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}