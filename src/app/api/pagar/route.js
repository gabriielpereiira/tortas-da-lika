import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return Response.json(
        { success: false, erro: 'Token de acesso do Mercado Pago nao configurado.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      itens,
      cliente_nome,
      cliente_email,
      cliente_telefone,
      endereco_entrega,
      valor_frete,
      pedido_id,
    } = body

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return Response.json(
        { success: false, erro: 'Itens do pedido sao obrigatorios.' },
        { status: 400 }
      )
    }

    if (!pedido_id) {
      return Response.json(
        { success: false, erro: 'ID do pedido e obrigatorio.' },
        { status: 400 }
      )
    }

    const items = itens.map((item) => ({
      id: item.id,
      title: item.nome,
      description: item.descricao || '',
      quantity: item.quantidade,
      unit_price: Number(item.preco),
      currency_id: 'BRL',
    }))

    if (valor_frete && Number(valor_frete) > 0) {
      items.push({
        title: 'Frete',
        quantity: 1,
        unit_price: Number(valor_frete),
        currency_id: 'BRL',
      })
    }

    // Tenta pegar a URL real do servidor em vez de depender so da variavel de ambiente
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'tortas-da-lika.vercel.app'
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`

    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items,
        payer: {
          name: cliente_nome,
          email: cliente_email || undefined,
          phone: cliente_telefone ? { number: cliente_telefone } : undefined,
        },
        back_urls: {
          success: `${BASE_URL}/pedido/sucesso`,
          failure: `${BASE_URL}/pedido/fracasso`,
          pending: `${BASE_URL}/pedido/pendente`,
        },
        auto_return: 'approved',
        external_reference: String(pedido_id),
        notification_url: `${BASE_URL}/api/pagamento/webhook`,
        statement_descriptor: 'TORTAS DA LIKA',
        metadata: {
          cliente_nome,
          cliente_email,
          cliente_telefone,
          endereco_entrega,
          pedido_id: String(pedido_id),
        },
      },
    })

    return Response.json({
      success: true,
      data: {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      },
    })
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return Response.json(
      { success: false, erro: error.message },
      { status: 500 }
    )
  }
}