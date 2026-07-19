'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const SANS = '"Plus Jakarta Sans", sans-serif'

export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/admin/pedidos')
    })
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 400,
        width: '100%',
        textAlign: 'center',
        border: '1px solid #334155'
      }}>
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 24,
          color: '#f59e0b',
          margin: '0 0 8px'
        }}>
          Admin Tortas da Lika
        </h1>
        <p style={{
          fontFamily: SANS,
          fontSize: 14,
          color: '#94a3b8',
          margin: '0 0 32px',
          lineHeight: 1.6
        }}>
          Faca login com sua conta de administrador para acessar o painel.
        </p>
        <Link href="/login" style={{
          display: 'inline-block',
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 600,
          padding: '12px 32px',
          background: '#f59e0b',
          color: '#0f172a',
          borderRadius: 8,
          textDecoration: 'none',
          transition: 'opacity 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Ir para Login
        </Link>
      </div>
    </div>
  )
}