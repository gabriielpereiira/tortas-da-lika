import { createClient } from '@supabase/supabase-js'
import { emailSaiuEntrega } from '@/lib/emailSaiuEntrega'

async function enviarEmailBrevo({ para, assunto, html }) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Tortas da Lika', email: 'tortasdalika@outlook.com' },
        to: [{ email: para }],
        subject: assunto,
        htmlContent: html
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro no Brevo:', response.status, errorText)
      return false
    }

    console.log('Email enviado com sucesso via Brevo')
    return true
  } catch (err) {
    console.error('Erro ao enviar email via Brevo:', err)
    return false
  }
}

export async function POST(request) {
  try {
    const { pedidoId, novoStatus } = await request.json()
    if (!pedidoId || !novoStatus) {
      return Response.json({ error: 'pedidoId e novoStatus obrigatorios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: pedido } = await supabase
      .from('pedidos')
      .select('nome_cliente, email_cliente')
      .eq('id', pedidoId)
      .single()

    await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', pedidoId)

    if (novoStatus === 'saiu_entrega') {
      if (pedido?.email_cliente) {
        const html = emailSaiuEntrega({
          nomeCliente: pedido.nome_cliente || pedido.email_cliente.split('@')[0],
          pedidoId
        })

        await enviarEmailBrevo({
          para: pedido.email_cliente,
          assunto: 'Seu pedido saiu para entrega - Tortas da Lika',
          html
        })
      }
    }

    return Response.json({ success: true, status: novoStatus })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}