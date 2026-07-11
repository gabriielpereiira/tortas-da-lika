'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  async function carregarPerfil(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (data) {
        setPerfil(data)
        localStorage.setItem('user', JSON.stringify({ id: data.id, nome: data.nome, email: data.email }))
      } else {
        const session = (await supabase.auth.getSession()).data.session
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify({ id: session.user.id, email: session.user.email }))
        }
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setUsuario(user)
      if (user) {
        carregarPerfil(user.id)
      } else {
        setCarregando(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null
      setUsuario(user)
      if (user) {
        carregarPerfil(user.id)
      } else {
        setPerfil(null)
        localStorage.removeItem('user')
        setCarregando(false)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  async function atualizarPerfil(dados) {
    if (!usuario) return { error: 'Usuario nao logado' }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: usuario.id, ...dados, updated_at: new Date().toISOString() })
        .select()
        .single()

      if (error) return { error: error.message }
      if (data) setPerfil(data)
      return { data }
    } catch (err) {
      return { error: err.message }
    }
  }

  async function cadastrar(email, senha) {
    const url = 'https://nqjkcqloenliiftcgvro.supabase.co/auth/v1/signup'
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xamtjcWxvZW5saWlmdGNndnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4Nzk0ODUsImV4cCI6MjA5NzQ1NTQ4NX0.lnqoY32fPB9eQP0xKlDeetw4iOUblsoy_mDQk4UpJPg'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        body: JSON.stringify({
          email: email,
          password: senha,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: { message: data.msg || data.error || 'Erro ao criar conta' } }
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Erro ao criar conta' } }
    }
  }

  async function login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return { data, error }
  }

  async function logout() {
    setPerfil(null)
    setUsuario(null)
    localStorage.removeItem('user')
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ usuario, perfil, carregando, cadastrar, login, logout, atualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}