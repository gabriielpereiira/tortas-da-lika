'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../app/context/AuthContext'
import { storeConfig } from '@/config/store'
import { useRouter, usePathname } from 'next/navigation'
import { useCarrinho } from '../app/context/CarrinhoContext'

const SANS = '"Plus Jakarta Sans", sans-serif'
const SERIF = '"Playfair Display", Georgia, serif'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { totalItens, setAberto } = useCarrinho()
  const { usuario, logout } = useAuth()
  const emailsAdmin = storeConfig.admin.adminEmails
  const isAdmin = usuario && emailsAdmin.includes(usuario.email)

  const [scrolled, setScrolled] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [logoHover, setLogoHover] = useState(false)

  useEffect(() => {
    setLoaded(true)
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const userInitial = usuario?.email?.charAt(0)?.toUpperCase() || '?'

  const navLinks = [
    { href: '/cardapio', label: 'Cardápio', icon: 'c' },
    ...(usuario ? [{ href: '/pedidos', label: 'Meus Pedidos', icon: 'p' }] : []),
    ...(isAdmin ? [{ href: '/admin/pedidos', label: 'Admin', icon: 'a' }] : []),
  ]

  const styles = {
    wrapper: {
      opacity: loaded ? 1 : 0,
      transition: 'opacity 0.4s ease, box-shadow 0.3s ease',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      height: isMobile ? '60px' : '72px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid rgba(196,151,90,0.15)',
      boxShadow: scrolled ? '0 2px 12px rgba(45,27,14,0.08)' : 'none',
    },
    inner: {
      maxWidth: '1200px',
      margin: '0 auto',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flexShrink: 0,
    },
    centerNav: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      justifyContent: 'center',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    logoText: {
      fontFamily: SERIF,
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: 700,
      color: '#2D1B0E',
      textDecoration: 'none',
      letterSpacing: '-0.3px',
      lineHeight: 1.2,
    },
    logoSublime: {
      fontFamily: SANS,
      fontSize: isMobile ? '9px' : '10px',
      fontWeight: 500,
      color: '#A0522D',
      textDecoration: 'none',
      letterSpacing: '2.5px',
      textTransform: 'uppercase',
      lineHeight: 1,
      marginTop: 1,
    },
    link: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      borderRadius: 999,
      background: active ? 'rgba(196,151,90,0.12)' : 'transparent',
      color: active ? '#2D1B0E' : '#7A6A5A',
      fontSize: 14,
      fontWeight: active ? 600 : 500,
      fontFamily: SANS,
      textDecoration: 'none',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
    }),
    sacolaBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 999,
      border: '1.5px solid #C4975A',
      background: 'transparent',
      color: '#2D1B0E',
      fontSize: 14,
      fontWeight: 600,
      fontFamily: SANS,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2D1B0E, #4A2F1A)',
      color: '#C4975A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: SANS,
      cursor: 'pointer',
      border: 'none',
    },
    logoutBtn: {
      padding: '6px 12px',
      borderRadius: 999,
      border: '1px solid #E8DDD0',
      background: 'transparent',
      color: '#7A6A5A',
      fontSize: 13,
      fontFamily: SANS,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
  }

  return (
    <header style={styles.wrapper}>
      <div style={styles.inner}>
        {/* ESQUERDA - Logo + Texto */}
        <div style={styles.leftSection}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            textDecoration: 'none',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: logoHover ? 0.85 : 1,
            transform: logoHover ? 'scale(1.02)' : 'scale(1)',
          }}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            {/* Logo circular */}
            <img
              src="/images/logo-header.png"
              alt="Tortas da Lika"
              style={{
                height: isMobile ? 42 : 50,
                width: 'auto',
                display: 'block',
                borderRadius: '50%',
                transition: 'transform 0.3s ease',
                transform: logoHover ? 'rotate(-3deg)' : 'rotate(0deg)',
                boxShadow: '0 2px 8px rgba(45,27,14,0.1)',
              }}
            />

            {/* Texto ao lado */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={styles.logoText}>Tortas da Lika</span>
              <span style={styles.logoSublime}>Confeitaria Artesanal</span>
            </div>
          </Link>
        </div>

        {/* CENTRO - Nav */}
        <nav style={isMobile ? { display: 'none' } : styles.centerNav}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={styles.link(pathname === link.href || pathname.startsWith(link.href + '/'))}
              onMouseEnter={e => { if (pathname !== link.href) e.currentTarget.style.background = 'rgba(196,151,90,0.08)' }}
              onMouseLeave={e => { if (pathname !== link.href) e.currentTarget.style.background = 'transparent' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* DIREITA - Acoes */}
        <div style={styles.rightSection}>
          <button
            onClick={() => setAberto(true)}
            style={styles.sacolaBtn}
            onMouseEnter={e => { e.currentTarget.style.background = '#C4975A'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2D1B0E' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Sacola{totalItens > 0 && ` (${totalItens})`}
          </button>

          {usuario ? (
            <>
              <button style={styles.avatar} onClick={() => router.push('/perfil')} title={usuario.email}>
                {userInitial}
              </button>
              <button
                onClick={logout}
                style={styles.logoutBtn}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4975A'; e.currentTarget.style.color = '#2D1B0E' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8DDD0'; e.currentTarget.style.color = '#7A6A5A' }}
              >
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              style={{
                ...styles.sacolaBtn,
                background: '#2D1B0E',
                color: '#fff',
                border: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4A2F1A' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2D1B0E' }}
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
