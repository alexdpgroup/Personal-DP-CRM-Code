import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import CRM from './CRM.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        background: '#f5f4f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid #ede0fa', 
            borderTop: '3px solid #7F4DDA',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#7a8295' }}>Loading Decisive Point CRM...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f4f0',
        fontFamily: 'DM Sans, system-ui, sans-serif'
      }}>
        <div style={{
          background: '#ffffff',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(13,17,23,0.08)',
          width: '100%',
          maxWidth: '420px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: 'DM Serif Display, Georgia, serif',
              fontSize: '28px',
              color: '#7F4DDA',
              marginBottom: '8px'
            }}>Decisive Point</h1>
            <p style={{ color: '#7a8295', fontSize: '14px' }}>CRM Platform</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#3a3f4a',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e4e2db',
                  borderRadius: '7px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7F4DDA'}
                onBlur={(e) => e.target.style.borderColor = '#e4e2db'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#3a3f4a',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e4e2db',
                  borderRadius: '7px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7F4DDA'}
                onBlur={(e) => e.target.style.borderColor = '#e4e2db'}
              />
            </div>

            {error && (
              <div style={{
                background: '#fdf0ee',
                border: '1px solid #c0392b',
                borderRadius: '7px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#c0392b',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#0d1117',
                color: '#ffffff',
                border: 'none',
                borderRadius: '7px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'DM Sans, system-ui, sans-serif'
              }}
              onMouseOver={(e) => e.target.style.background = '#1a1f29'}
              onMouseOut={(e) => e.target.style.background = '#0d1117'}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // User is logged in - show the CRM
  return <CRM session={session} onLogout={handleLogout} />
}
