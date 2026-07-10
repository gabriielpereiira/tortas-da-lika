'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

function PedidoSucessoContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')
  const isApproved = status === 'approved'

  useEffect(() => {
    if (isApproved && externalReference) {
      fetch('/api/pedido/confirmar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: externalReference,
          paymentId,
          status
        })
      }).catch(err => console.error('Erro ao confirmar pagamento:', err))
    }
  }, [isApproved, externalReference, paymentId, status])

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#fff8f0',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#4a3728',
    textAlign: 'center',
  }

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(74, 55, 40, 0.15)',
    padding: '40px',
    maxWidth: '480px',
    width: '100%',
  }

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: '#4a3728',
  }

  const subtitleStyle = {
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
    color: '#6b5644',
  }

  const infoStyle = {
    backgroundColor: '#f7efe6',
    borderRadius: '8px',
    padding: '16px',
    margin: '0 0 24px 0',
    textAlign: 'left',
  }

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '6px 0',
    fontSize: '14px',
    borderBottom: '1px solid #e8d9c8',
  }

  const labelStyle = {
    fontWeight: '600',
    color: '#4a3728',
  }

  const valueStyle = {
    color: '#6b5644',
    textAlign: 'right',
    wordBreak: 'break-word',
  }

  const linkStyle = {
    display: 'inline-block',
    backgroundColor: '#4a3728',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'background-color 0.2s ease',
  }

  const footerStyle = {
    marginTop: '24px',
    fontSize: '13px',
    color: '#8a7563',
  }

  return (
    <main style={containerStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>
          {isApproved ? 'Pagamento aprovado!' : 'Pedido recebido!'}
        </h1>

        <p style={subtitleStyle}>
          {isApproved
            ? 'Obrigado pela sua compra na Tortas da Lika. Seu pagamento foi confirmado com sucesso.'
            : 'Obrigado pela sua compra na Tortas da Lika. Estamos processando o seu pagamento.'}
        </p>

        <div style={infoStyle}>
          {externalReference && (
            <div style={infoRowStyle}>
              <span style={labelStyle}>Pedido</span>
              <span style={valueStyle}>{externalReference}</span>
            </div>
          )}

          {paymentId && (
            <div style={{
              ...infoRowStyle,
              borderBottom: paymentId && status ? '1px solid #e8d9c8' : 'none'
            }}>
              <span style={labelStyle}>ID do pagamento</span>
              <span style={valueStyle}>{paymentId}</span>
            </div>
          )}

          {status && (
            <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Status</span>
              <span style={valueStyle}>{status}</span>
            </div>
          )}
        </div>

        <Link href="/pedidos" style={linkStyle}>
          Acompanhar status do pedido
        </Link>

        <p style={footerStyle}>
          Tortas da Lika - Obrigado por escolher a nossa confeitaria.
        </p>
      </section>
    </main>
  )
}

export default function PedidoSucessoPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#4a3728' }}>Carregando...</div>}>
      <PedidoSucessoContent />
    </Suspense>
  )
}
