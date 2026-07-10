import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return Response.json({ error: 'Token nao configurado' }, { status: 500 })
    }

    const body = await request.json()
    const { type, data } = body

    if (type === 'payment' && data?.id) {
      const paymentId = data.id

      const client = new MercadoPagoConfig({ accessToken })
      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })

      const pedidoId = paymentData.external_reference
      if (!pedidoId) {
        return Response.json({ error: 'external_reference not found' }, { status: 400 })
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const mpStatus = paymentData.status
      let orderStatus = 'pendente'
      if (mpStatus === 'approved') orderStatus = 'confirmado'
      else if (mpStatus === 'rejected' || mpStatus === 'refused') orderStatus = 'cancelado'
      else if (mpStatus === 'cancelled') orderStatus = 'cancelado'
      else if (mpStatus === 'refunded') orderStatus = 'cancelado'

      await supabase
        .from('pedidos')
        .update({
          status: orderStatus,
          pagamento_status: mpStatus,
          metodo_pagamento: paymentData.payment_method?.id || null,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', pedidoId)

      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('mercado_pago_id', String(paymentId))
        .single()

      const paymentRecord = {
        order_id: pedidoId,
        metodo: paymentData.payment_method?.id || 'mercadopago',
        status: mpStatus,
        valor: paymentData.transaction_amount,
        mercado_pago_id: String(paymentId),
        mercado_pago_status: mpStatus,
        atualizado_em: new Date().toISOString()
      }

      if (existingPayment) {
        await supabase.from('payments').update(paymentRecord).eq('id', existingPayment.id)
      } else {
        await supabase.from('payments').insert({
          ...paymentRecord,
          criado_em: new Date().toISOString()
        })
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}