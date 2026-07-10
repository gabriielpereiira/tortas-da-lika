'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCarrinho } from '../app/context/CarrinhoContext'
import { useAuth } from '../app/context/AuthContext'
import { storeConfig } from '@/config/store'

export default function Header({ onCartClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const { totalItens, setAberto } = useCarrinho()
  const { usuario, logout } = useAuth()

  const emailsAdmin = storeConfig.admin.adminEmails
  const isAdmin = usuario && emailsAdmin.includes(usuario.email)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isMobile) setMenuAberto(false)
  }, [isMobile])

  useEffect(() => {
    if (menuAberto) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuAberto])

  const handleCarrinho = () => {
    if (onCartClick) onCartClick()
    else setAberto(true)
    setMenuAberto(false)
  }

  const handleSair = () => {
    logout()
    router.push('/')
    setMenuAberto(false)
  }

  const handleNavClick = () => {
    setMenuAberto(false)
  }

  const isActive = (path) => pathname === path

  const getInitial = () => {
    if (usuario && usuario.email)
      return usuario.email.charAt(0).toUpperCase()
    return '?'
  }

  const navLinks = [
    {
      href: '/cardapio',
      label: 'Cardapio',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
          <path d="M7 13v8" />
          <path d="M19 3c-1.5 1-2 3-2 5s0.5 4 2 5v8" />
        </svg>
      )
    },
    {
      href: '/pedidos',
      label: 'Meus Pedidos',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96 12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      )
    }
  ]

  if (isAdmin) {
    navLinks.push({
      href: '/admin/pedidos',
      label: 'Admin',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    })
  }

  const iconeHamburguer = (
    <button
      onClick={() => setMenuAberto(!menuAberto)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        height: 36,
        gap: 5,
        padding: 6,
        boxSizing: 'border-box'
      }}
      aria-label="Abrir menu"
    >
      <span style={{
        display: 'block',
        width: 22,
        height: 2,
        background: '#2D1B0E',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        transform: menuAberto ? 'rotate(45deg) translate(5px, 5px)' : 'none'
      }} />
      <span style={{
        display: 'block',
        width: 22,
        height: 2,
        background: '#2D1B0E',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        opacity: menuAberto ? 0 : 1
      }} />
      <span style={{
        display: 'block',
        width: 22,
        height: 2,
        background: '#2D1B0E',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        transform: menuAberto ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
      }} />
    </button>
  )

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 999,
    opacity: menuAberto ? 1 : 0,
    visibility: menuAberto ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease'
  }

  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '280px',
    background: '#FFFFFF',
    zIndex: 1000,
    transform: menuAberto ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 20px',
    boxSizing: 'border-box'
  }

  const drawerLinkBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    textDecoration: 'none',
    color: '#4A3B2F',
    transition: 'all 0.2s ease'
  }

  const drawerLinkActive = {
    ...drawerLinkBase,
    background: '#F5EDE0',
    color: '#2D1B0E',
    fontWeight: 600
  }

  const drawerCarrinhoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#C4975A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 999,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    position: 'relative',
    marginTop: 16
  }

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
      boxShadow: scrolled ? '0 6px 20px rgba(45,27,14,0.12)' : '0 2px 8px rgba(45,27,14,0.04)'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      height: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '0 16px' : '0 40px',
      boxSizing: 'border-box'
    },
    brand: {
      fontFamily: 'Georgia, serif',
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: 700,
      color: '#2D1B0E',
      textDecoration: 'none',
      letterSpacing: '-0.5px',
      whiteSpace: 'nowrap'
    },
    nav: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      gap: '24px',
      flex: 1,
      justifyContent: 'center'
    },
    actionsDesktop: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    avatarCircle: {
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      background: '#C4975A',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 700,
      cursor: 'pointer',
      position: 'relative',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      border: '2px solid transparent'
    },
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      borderRadius: '999px',
      border: '1.5px solid #C4975A',
      color: '#C4975A',
      background: 'transparent',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    cartButton: {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      background: '#C4975A',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '999px',
      padding: isMobile ? '8px 14px' : '9px 18px',
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'background 0.2s ease'
    },
    badge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      minWidth: '20px',
      height: '20px',
      borderRadius: '999px',
      background: '#2D1B0E',
      color: '#FFFFFF',
      fontSize: '11px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
      boxSizing: 'border-box'
    }
  }

  const renderDesktopIcon = (icon, active) => {
    if (!icon) return null
    const stroke = active ? '#C4975A' : '#4A3B2F'
    return (
      <svg
        width="16"
        height="16"
        viewBox={icon.props.viewBox}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon.props.children}
      </svg>
    )
  }

  return (
    <>
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <Link href="/" style={styles.brand}>
            {storeConfig.identidade.name}
          </Link>

          {!isMobile && (
            <nav style={styles.nav}>
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      color: active ? '#C4975A' : '#4A3B2F',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      borderBottom: active ? '2px solid #C4975A' : '2px solid transparent',
                      paddingBottom: '4px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {renderDesktopIcon(link.icon, active)} {link.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {!isMobile ? (
            <div style={styles.actionsDesktop}>
              {usuario ? (
                <>
                  <Link
                    href="/perfil"
                    style={styles.avatarCircle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2D1B0E'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {getInitial()}
                  </Link>

                  <button
                    onClick={handleSair}
                    style={styles.pill}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#C4975A'
                      e.currentTarget.style.color = '#FFFFFF'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#C4975A'
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  style={styles.pill}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#C4975A'
                    e.currentTarget.style.color = '#FFFFFF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#C4975A'
                  }}
                >
                  Entrar
                </Link>
              )}

              <button onClick={handleCarrinho} style={styles.cartButton}>
                Sua Sacolinha
                {totalItens > 0 && <span style={styles.badge}>{totalItens}</span>}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={handleCarrinho} style={styles.cartButton}>
                {totalItens > 0 && <span style={styles.badge}>{totalItens}</span>}
                Pedido
              </button>
              {iconeHamburguer}
            </div>
          )}
        </div>
      </div>

      {/* Overlay escuro */}
      <div style={overlayStyle} onClick={() => setMenuAberto(false)} />

      {/* Drawer lateral */}
      <div style={drawerStyle}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            onClick={() => setMenuAberto(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#4A3B2F',
              padding: 4
            }}
            aria-label="Fechar menu"
          >
            &times;
          </button>
        </div>

        {/* Avatar / info do usuario no drawer */}
        {usuario ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            marginBottom: 16,
            background: '#F5EDE0',
            borderRadius: 8
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#C4975A',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16
            }}>
              {getInitial()}
            </div>
            <div style={{ fontSize: 13, color: '#4A3B2F', wordBreak: 'break-all', lineHeight: 1.3 }}>
              {usuario.email}
            </div>
          </div>
        ) : null}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                style={active ? drawerLinkActive : drawerLinkBase}
              >
                <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            )
          })}

          {usuario && (
            <Link
              href="/perfil"
              onClick={handleNavClick}
              style={isActive('/perfil') ? drawerLinkActive : drawerLinkBase}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Meu Perfil
            </Link>
          )}
        </nav>

        <div style={{ borderTop: '1px solid #E8D9C8', paddingTop: 16, marginTop: 'auto' }}>
          <button onClick={handleCarrinho} style={drawerCarrinhoStyle}>
            Sua Sacolinha
            {totalItens > 0 && (
              <span style={{
                background: '#2D1B0E',
                color: '#FFF',
                borderRadius: '50%',
                width: 22,
                height: 22,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalItens}
              </span>
            )}
          </button>

          {usuario ? (
            <button
              onClick={handleSair}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 16px',
                marginTop: 12,
                borderRadius: 8,
                border: '1.5px solid #C4975A',
                background: 'transparent',
                color: '#C4975A',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Sair da conta
            </button>
          ) : (
            <Link
              href="/login"
              onClick={handleNavClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 16px',
                marginTop: 12,
                borderRadius: 8,
                border: '1.5px solid #C4975A',
                background: 'transparent',
                color: '#C4975A',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </>
  )
}