import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.json()
    const { pedido_id, payment_id, status_pagamento, metodo_pagamento } = body

    if (!pedido_id) {
      return Response.json({ success: false, erro: 'ID do pedido obrigatorio' }, { status: 400 })
    }

    let orderStatus = 'pendente'
    if (status_pagamento === 'approved') orderStatus = 'confirmado'
    else if (status_pagamento === 'rejected' || status_pagamento === 'refused') orderStatus = 'cancelado'
    else if (status_pagamento === 'cancelled') orderStatus = 'cancelado'
    else if (status_pagamento === 'refunded') orderStatus = 'cancelado'
    else if (status_pagamento === 'pending' || status_pagamento === 'in_process') orderStatus = 'pendente'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase
      .from('pedidos')
      .update({
        status: orderStatus,
        pagamento_status: status_pagamento,
        metodo_pagamento: metodo_pagamento || null,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', pedido_id)

    if (payment_id) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('mercado_pago_id', String(payment_id))
        .single()

      if (existingPayment) {
        await supabase
          .from('payments')
          .update({
            status: status_pagamento,
            mercado_pago_status: status_pagamento,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', existingPayment.id)
      } else {
        await supabase
          .from('payments')
          .insert({
            order_id: pedido_id,
            metodo: metodo_pagamento || 'mercadopago',
            status: status_pagamento,
            valor: null,
            mercado_pago_id: String(payment_id),
            mercado_pago_status: status_pagamento,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          })
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, erro: error.message }, { status: 500 })
  }
}