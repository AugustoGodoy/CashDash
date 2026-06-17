import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import CurrencyCard from './components/CurrencyCard.jsx'
import HistoricoChart from './components/HistoricoChart.jsx'
import { fetchCotacoes, fetchHistorico } from './services/api.js'

export default function App() {
  const [base, setBase] = useState('EUR')
  const [cotacoes, setCotacoes] = useState([])
  const [historico, setHistorico] = useState(null)
  const [dataAtualizacao, setDataAtualizacao] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const [dadosCotacoes, dadosHistorico] = await Promise.all([
        fetchCotacoes(base),
        fetchHistorico(base),
      ])
      setCotacoes(dadosCotacoes.cotacoes)
      setDataAtualizacao(dadosCotacoes.data)
      setHistorico(dadosHistorico.historico)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }, [base])

  // Recarrega sempre que a moeda base mudar
  useEffect(() => {
    carregar()
  }, [carregar])

  return (
    <div style={styles.layout}>
      <Header
        base={base}
        onBaseChange={setBase}
        dataAtualizacao={dataAtualizacao}
        loading={loading}
      />

      <main style={styles.main}>
        {erro && (
          <div style={styles.erro}>
            ⚠️ {erro} —{' '}
            <button onClick={carregar} style={styles.retry}>
              tentar novamente
            </button>
          </div>
        )}

        {!erro && cotacoes.length === 0 && loading && (
          <div style={styles.skeleton}>Carregando cotações...</div>
        )}

        <div style={styles.grid}>
          {cotacoes.map((c) => (
            <CurrencyCard
              key={c.moeda}
              moeda={c.moeda}
              taxa={c.taxa}
              base={base}
              isBase={c.moeda === base}
            />
          ))}
        </div>

        <HistoricoChart historico={historico} base={base} />

        <footer style={styles.footer}>
          Dados fornecidos por{' '}
          <a
            href="https://frankfurter.app"
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            Frankfurter API
          </a>{' '}
          · Banco Central Europeu
        </footer>
      </main>
    </div>
  )
}

const styles = {
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    padding: '32px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '8px',
  },
  erro: {
    background: '#2d1a1a',
    border: '1px solid var(--red)',
    color: 'var(--red)',
    borderRadius: '8px',
    padding: '14px 18px',
    marginBottom: '20px',
    fontSize: '0.9rem',
  },
  retry: {
    color: 'var(--accent-light)',
    textDecoration: 'underline',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    font: 'inherit',
  },
  skeleton: {
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '60px 0',
    fontSize: '0.95rem',
  },
  footer: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
    marginTop: '40px',
    paddingBottom: '20px',
  },
  link: {
    color: 'var(--accent-light)',
    textDecoration: 'none',
  },
}
