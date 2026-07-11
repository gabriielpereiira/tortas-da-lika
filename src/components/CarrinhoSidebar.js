'use client'
import { useState, useEffect } from 'react'
import { useCarrinho } from '@/app/context/CarrinhoContext'
import { useAuth } from '@/app/context/AuthContext'

const SERIF = '"Playfair Display", Georgia, serif'
const SANS = '"Plus Jakarta Sans", sans-serif'

const COLORS = {
  dark: '#2D1B0E',
  gold: '#C4975A',
  bg: '#FAF7F2',
  white: '#FFFFFF',
  textSecondary: '#6B4F3A',
  border: '#E8E0D8',
  textOnDark: '#F0EBE4'
}

function formatarPreco(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

export default function CarrinhoSidebar() {
  const { itens, aberto, setAberto, removerItem, limparCarrinho, subtotal, totalItens } = useCarrinho()
  const { usuario } = useAuth()
  const [cep, setCep] = useState('')
  const [freteData, setFreteData] = useState(null)
  const [freteCarregando, setFreteCarregando] = useState(false)
  const [freteErro, setFreteErro] = useState(null)
  const [cupomInput, setCupomInput] = useState('')
  const [cupomData, setCupomData] = useState(null)
  const [cupomCarregando, setCupomCarregando] = useState(false)
  const [cupomErro, setCupomErro] = useState(null)
  const [finalizando, setFinalizando] = useState(false)
  const [toast, setToast] = useState(null)
  const [freteTentouFinalizar, setFreteTentouFinalizar] = useState(false)

  // Carregar CEP salvo do usuario ao abrir
  useEffect(() => {
    if (!aberto) return
    let active = true
    async function carregarCepSalvo() {
      try {
        const saved = localStorage.getItem('cep_entrega')
        if (saved && active) {
          const digits = String(saved).replace(/\D/g, '').slice(0, 8)
          setCep(formatarCep(digits))
          if (digits.length === 8) {
            handleBuscarFrete(digits)
          }
        }
      } catch (e) {}
    }
    carregarCepSalvo()
    return () => { active = false }
  }, [aberto, usuario])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function formatarCep(digits) {
    const d = String(digits).replace(/\D/g, '').slice(0, 8)
    if (d.length <= 5) return d
    return d.slice(0, 5) + '-' + d.slice(5)
  }

  function handleFechar() {
    setAberto(false)
  }

  function handleCepChange(value) {
    const digits = String(value).replace(/\D/g, '').slice(0, 8)
    setCep(formatarCep(digits))
    setFreteData(null)
    setFreteErro(null)
    setFreteTentouFinalizar(false)
  }

  async function handleBuscarFrete(cepParam) {
    const cleanCep = String(cepParam !== undefined ? cepParam : cep).replace(/\D/g, '')
    if (cleanCep.length < 8) {
      setFreteErro('CEP invalido')
      setFreteData(null)
      return
    }
    setFreteCarregando(true)
    setFreteErro(null)
    setFreteTentouFinalizar(false)
    try {
      const res = await fetch('/api/frete?cep=' + cleanCep)
      const json = await res.json()
      if (res.ok && json && json.data) {
        setFreteData(json.data)
        localStorage.setItem('cep_entrega', cleanCep)
      } else {
        setFreteErro((json && json.erro) || 'CEP nao atendido para entrega')
        setFreteData(null)
      }
    } catch (e) {
      setFreteErro('Erro ao calcular frete')
      setFreteData(null)
    } finally {
      setFreteCarregando(false)
    }
  }

  // Cupom
  async function handleAplicarCupom() {
    const codigo = cupomInput.trim().toUpperCase()
    if (!codigo) return
    setCupomCarregando(true)
    setCupomErro(null)
    try {
      const res = await fetch('/api/cupom/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, subtotal })
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setCupomData(json.data)
        setCupomInput('')
      } else {
        setCupomErro(json.erro || 'Cupom invalido')
      }
    } catch (e) {
      setCupomErro('Erro ao validar cupom')
    } finally {
      setCupomCarregando(false)
    }
  }

  function handleRemoverCupom() {
    setCupomData(null)
    setCupomErro(null)
    setCupomInput('')
  }

  async function handleFinalizar() {
    if (!usuario) {
      setToast('Faca login para finalizar o pedido')
      return
    }

    if (itens.length === 0) {
      setToast('Sua sacola esta vazia')
      return
    }

    // --- VALIDACAO OBRIGATORIA DE FRETE ---
    if (!freteData) {
      setFreteTentouFinalizar(true)
      setToast('Informe o CEP e calcule o frete para finalizar')
      return
    }

    setFinalizando(true)
    try {
      // 1. Salva o pedido no Supabase
      const orderPayload = {
        user_id: usuario.id,
        nome_cliente: usuario?.user_metadata?.full_name || usuario?.email?.split('@')[0] || '',
        email_cliente: usuario?.email || '',
        telefone_cliente: usuario?.user_metadata?.phone || '',
        itens: itens.map(i => ({
          product_id: i.product_id,
          nome: i.nome,
          descricao: i.descricao || '',
          quantidade: i.quantidade,
          preco: i.preco,
        })),
        subtotal,
        cupom_aplicado: cupomData ? { codigo: cupomData.codigo } : null,
        desconto,
        total: subtotal + freteData.valor_frete - desconto,
        forma_entrega: 'entrega', // SOMENTE ENTREGA
        endereco_entrega: freteData.endereco || '',
        valor_frete: freteData.valor_frete || 0,
      }

      const saveRes = await fetch('/api/pedido/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      const saveResult = await saveRes.json()

      if (!saveResult.success) {
        setToast(saveResult.erro || 'Erro ao salvar pedido')
        setFinalizando(false)
        return
      }

      const pedido_id = saveResult.data.pedido_id

      // 2. Cria pagamento no Mercado Pago
      const payload = {
        itens: itens.map(i => ({
          id: i.product_id,
          nome: i.nome,
          descricao: i.descricao || '',
          quantidade: i.quantidade,
          preco: i.preco,
        })),
        cliente_nome: usuario?.user_metadata?.full_name || usuario?.email?.split('@')[0] || '',
        cliente_email: usuario?.email || '',
        cliente_telefone: usuario?.user_metadata?.phone || '',
        endereco_entrega: freteData.endereco || '',
        valor_frete: freteData.valor_frete || 0,
        cupom: cupomData ? { codigo: cupomData.codigo, tipo: cupomData.tipo, valor: cupomData.valor } : null,
        pedido_id,
      }

      const res = await fetch('/api/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (result && result.success && result.data && result.data.init_point) {
        window.location.href = result.data.init_point
      } else {
        setToast((result && result.erro) || 'Erro ao iniciar pagamento')
        setFinalizando(false)
      }
    } catch (e) {
      setToast('Erro ao iniciar pagamento')
      setFinalizando(false)
    }
  }

  const desconto = cupomData
    ? cupomData.tipo === 'percentual'
      ? subtotal * (cupomData.valor / 100)
      : cupomData.valor
    : 0
  const total = subtotal + (freteData?.valor_frete || 0) - desconto

  if (!aberto) return null

  return (
    <>
      {/* Overlay escuro */}
      <div
        onClick={handleFechar}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 998,
          background: 'rgba(45, 27, 14, 0.35)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          width: '100%',
          maxWidth: '420px',
          background: COLORS.white,
          boxShadow: '-4px 0 24px rgba(45, 27, 14, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'right 0.35s ease',
          fontFamily: SANS,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid ' + COLORS.border,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: COLORS.dark,
              fontFamily: SERIF,
            }}
          >
            Sacola{totalItens > 0 ? ' (' + totalItens + ')' : ''}
          </h2>
          <button
            onClick={handleFechar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.textSecondary,
              padding: '4px',
              display: 'flex',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = COLORS.dark}
            onMouseLeave={e => e.currentTarget.style.color = COLORS.textSecondary}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Conteudo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textSecondary }}>
              <p style={{ margin: 0, fontSize: '15px' }}>Sua sacola esta vazia.</p>
            </div>
          ) : (
            itens.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid ' + COLORS.border,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: COLORS.dark }}>
                    {item.quantidade}x {item.nome}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: COLORS.gold, fontWeight: 600 }}>
                    {formatarPreco(item.preco * item.quantidade)}
                  </p>
                </div>
                <button
                  onClick={() => removerItem(item.product_id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: COLORS.textSecondary,
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '18px',
                    lineHeight: 1,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#D32F2F'}
                  onMouseLeave={e => e.currentTarget.style.color = COLORS.textSecondary}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer com frete, cupom, totais e botoes */}
        <div
          style={{
            borderTop: '1px solid ' + COLORS.border,
            padding: '20px 24px',
          }}
        >
          {/* --- FRETE OBRIGATORIO --- */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: COLORS.dark }}>
              CEP para entrega <span style={{ color: '#D32F2F' }}>*</span>
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: COLORS.textSecondary }}>
              Entregamos apenas em Rio Grande e regiao.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="Digite seu CEP"
                maxLength={9}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid ' + (freteTentouFinalizar && !freteData ? '#D32F2F' : COLORS.border),
                  fontSize: '14px',
                  fontFamily: SANS,
                  color: COLORS.dark,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
              <button
                onClick={() => handleBuscarFrete()}
                disabled={freteCarregando}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: COLORS.gold,
                  color: COLORS.white,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: SANS,
                  whiteSpace: 'nowrap',
                  opacity: freteCarregando ? 0.7 : 1,
                }}
              >
                {freteCarregando ? '...' : 'Calcular'}
              </button>
            </div>
            {freteCarregando && (
              <p style={{ margin: '4px 0', fontSize: '12px', color: COLORS.textSecondary }}>
                Calculando frete...
              </p>
            )}
            {freteErro && (
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#D32F2F' }}>{freteErro}</p>
            )}
            {freteTentouFinalizar && !freteData && !freteCarregando && (
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#D32F2F', fontWeight: 600 }}>
                Informe um CEP valido e clique em Calcular para continuar.
              </p>
            )}
            {freteData && (
              <div style={{ padding: '10px 12px', background: '#E8F5E9', borderRadius: '8px', marginTop: '4px', border: '1px solid #C8E6C9' }}>
                <p style={{ margin: 0, fontSize: '13px', color: COLORS.dark, fontWeight: 600 }}>
                  Endereco de entrega
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.textSecondary }}>
                  {freteData.endereco}
                </p>
                {freteData.bairro && (
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.textSecondary }}>
                    Bairro: {freteData.bairro}
                  </p>
                )}
                <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700, color: COLORS.gold }}>
                  Frete: {formatarPreco(freteData.valor_frete)}
                  {freteData.distancia_km && ` (${freteData.distancia_km} km)`}
                </p>
              </div>
            )}
          </div>

          {/* Cupom */}
          {!cupomData ? (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: COLORS.dark }}>
                Cupom de desconto
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={cupomInput}
                  onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                  placeholder="Digite o codigo"
                  maxLength={20}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid ' + COLORS.border,
                    fontSize: '14px',
                    fontFamily: SANS,
                    color: COLORS.dark,
                    outline: 'none',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleAplicarCupom}
                  disabled={cupomCarregando}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: COLORS.dark,
                    color: COLORS.white,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: SANS,
                    whiteSpace: 'nowrap',
                    opacity: cupomCarregando ? 0.7 : 1,
                  }}
                >
                  {cupomCarregando ? '...' : 'Aplicar'}
                </button>
              </div>
              {cupomErro && (
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#D32F2F' }}>{cupomErro}</p>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#E8F5E9', borderRadius: '8px', border: '1px solid #C8E6C9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#2E7D32' }}>
                  Cupom {cupomData.codigo} aplicado!
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#388E3C' }}>
                  {cupomData.tipo === 'percentual'
                    ? `${cupomData.valor}% de desconto`
                    : `${formatarPreco(cupomData.valor)} de desconto`}
                </p>
              </div>
              <button
                onClick={handleRemoverCupom}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D32F2F',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: SANS,
                  padding: '4px 8px',
                }}
              >
                Remover
              </button>
            </div>
          )}

          {/* Totais */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: COLORS.textSecondary }}>
              <span>Subtotal</span>
              <span>{formatarPreco(subtotal)}</span>
            </div>
            {freteData && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: COLORS.textSecondary }}>
                <span>Frete</span>
                <span>{formatarPreco(freteData.valor_frete)}</span>
              </div>
            )}
            {desconto > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: '#2E7D32' }}>
                <span>Desconto ({cupomData?.codigo})</span>
                <span>-{formatarPreco(desconto)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: '16px', fontWeight: 700, color: COLORS.dark, borderTop: '2px solid ' + COLORS.border, marginTop: '4px' }}>
              <span>Total</span>
              <span>{formatarPreco(total)}</span>
            </div>
          </div>

          {/* Botoes */}
          <button
            onClick={handleFinalizar}
            disabled={finalizando || !freteData}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '999px',
              border: 'none',
              background: !freteData ? COLORS.border : COLORS.gold,
              color: !freteData ? COLORS.textSecondary : COLORS.white,
              fontSize: '15px',
              fontWeight: 700,
              cursor: finalizando || !freteData ? 'not-allowed' : 'pointer',
              fontFamily: SANS,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              opacity: finalizando ? 0.7 : 1,
              marginBottom: '10px',
              transition: 'all 0.3s ease',
            }}
          >
            {finalizando
              ? 'Redirecionando...'
              : !freteData
                ? 'Calcule o frete primeiro'
                : 'Finalizar Pedido'}
          </button>

          <button
            onClick={limparCarrinho}
            disabled={finalizando}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '999px',
              border: '1px solid ' + COLORS.border,
              background: 'transparent',
              color: COLORS.textSecondary,
              fontSize: '13px',
              fontWeight: 600,
              cursor: finalizando ? 'not-allowed' : 'pointer',
              fontFamily: SANS,
              opacity: finalizando ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            Limpar sacola
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: COLORS.dark,
            color: COLORS.textOnDark,
            padding: '12px 24px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: SANS,
            boxShadow: '0 4px 16px rgba(45,27,14,0.2)',
            zIndex: 9999,
            animation: 'slideUp 0.3s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </>
  )
}