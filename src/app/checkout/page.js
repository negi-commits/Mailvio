'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [method, setMethod] = useState('upi')

  async function handlePay() {
    setProcessing(true)
    // Simulate gateway processing time for realism
    await new Promise((r) => setTimeout(r, 1800))

    const res = await fetch('/api/pay', { method: 'POST' })
    const data = await res.json()

    setProcessing(false)
    if (data.error) {
      alert('Payment error: ' + data.error)
    } else {
      setDone(true)
      setTimeout(() => router.push('/compose'), 1500)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>

        {/* Header bar */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '20px 24px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 18 }}>Mailvio</strong>
            <span style={{ fontSize: 13, opacity: 0.9 }}>Secure Checkout</span>
          </div>
        </div>

        {done ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <h2 style={{ margin: '12px 0 4px' }}>Payment successful</h2>
            <p style={{ color: '#666', margin: 0 }}>+1 email credit added. Redirecting...</p>
          </div>
        ) : (
          <div style={{ padding: 24 }}>
            {/* Amount */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ color: '#888', fontSize: 13, margin: 0 }}>Amount payable</p>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#111' }}>₹10</div>
              <p style={{ color: '#888', fontSize: 13, margin: 0 }}>1 additional email credit</p>
            </div>

            {/* Payment method tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[
                { id: 'upi', label: 'UPI' },
                { id: 'card', label: 'Card' },
                { id: 'netbanking', label: 'Net Banking' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                    border: method === m.id ? '2px solid #6366f1' : '1px solid #ddd',
                    background: method === m.id ? '#f5f3ff' : '#fff',
                    color: method === m.id ? '#6366f1' : '#555', fontWeight: method === m.id ? 600 : 400,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Method-specific fields (demo only — not wired) */}
            {method === 'upi' && (
              <input placeholder="yourname@upi" style={inputStyle} />
            )}
            {method === 'card' && (
              <>
                <input placeholder="Card number" style={inputStyle} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="MM / YY" style={{ ...inputStyle, flex: 1 }} />
                  <input placeholder="CVV" style={{ ...inputStyle, flex: 1 }} />
                </div>
              </>
            )}
            {method === 'netbanking' && (
              <select style={inputStyle}>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India</option>
                <option>Axis Bank</option>
              </select>
            )}

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={processing}
              style={{
                width: '100%', marginTop: 16, padding: 14, borderRadius: 10, border: 'none',
                background: processing ? '#a5a5a5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 16, fontWeight: 600, cursor: processing ? 'default' : 'pointer',
              }}
            >
              {processing ? 'Processing...' : 'Pay ₹10'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 14 }}>
              🔒 Demo mode — no real payment is processed
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: 12, marginBottom: 10, border: '1px solid #ddd',
  borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
}