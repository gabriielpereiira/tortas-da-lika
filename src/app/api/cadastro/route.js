import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req) {
try {
const { email, senha } = await req.json()

if (!email || !senha) {
  return Response.json({ error: 'Email e senha sao obrigatorios' }, { status: 400 })
}

const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
  },
  body: JSON.stringify({
    email: email,
    password: senha,
  }),
})

const data = await response.json()

if (!response.ok) {
  return Response.json({ error: data.msg || data.error || 'Erro ao criar conta' }, { status: 400 })
}

return Response.json({ user: data })
} catch (err) {
return Response.json({ error: 'Erro interno do servidor' }, { status: 500 })
}
}