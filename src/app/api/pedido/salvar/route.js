import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      user_id, nome_cliente, email_cliente, telefone_cliente,
      itens, subtotal, cupom_aplicado, desconto, total,
      forma_entrega, endereco_entrega, valor_frete, observacoes
    } = body

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return Response.json({ success: false, erro: 'Itens obrigatorios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        user_id,
        nome_cliente,
        email_cliente,
        telefone_cliente,
        itens,
        subtotal: Number(subtotal),
        cupom_aplicado: cupom_aplicado || null,
        desconto: Number(desconto || 0),
        total: Number(total),
        forma_entrega: forma_entrega || 'retirada',
        endereco_entrega: endereco_entrega || null,
        valor_frete: Number(valor_frete || 0),
        status: 'pendente',
        observacoes: observacoes || null,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      return Response.json({ success: false, erro: error.message }, { status: 500 })
    }

    return Response.json({ success: true, data: { pedido_id: data.id } })
  } catch (error) {
    return Response.json({ success: false, erro: error.message }, { status: 500 })
  }
}