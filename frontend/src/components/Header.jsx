import { useState } from 'react'

const MOEDAS = ['EUR', 'USD', 'BRL', 'GBP', 'JPY', 'CAD', 'CHF']

const FLAG = {
  EUR: '🇪🇺', USD: '🇺🇸', BRL: '🇧🇷', GBP: '🇬🇧',
  JPY: '🇯🇵', CAD: '🇨🇦', CHF: '🇨🇭',
}

export default function Header({ base, onBaseChange, dataAtualizacao, loading }) {
  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <span style={styles.logo}>💱</span>
        <div>
          <h1 style={styles.title}>Cash Dash</h1>
          <p style={styles.subtitle}>Cotações de Moedas em Tempo Real</p>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.baseSelector}>
          <span style={styles.label}>Moeda base:</span>
          <div style={styles.moedaBtns}>
            {MOEDAS.map((m) => (
              <button
                key={m}
                onClick={() => onBaseChange(m)}
                style={{
                  ...styles.moedaBtn,
                  ...(base === m ? styles.moedaBtnActive : {}),
                }}
              >
                {FLAG[m]} {m}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.meta}>
          {loading && <span style={styles.loading}>⟳ Atualizando...</span>}
          {dataAtualizacao && !loading && (
            <span style={styles.data}>📅 {dataAtualizacao}</span>
          )}
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logo: {
    fontSize: '2.4rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: 'var(--accent-light)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
  },
  baseSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  moedaBtns: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  moedaBtn: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    transition: 'all 0.15s',
  },
  moedaBtnActive: {
    background: 'var(--accent)',
    color: '#fff',
    border: '1px solid var(--accent)',
    fontWeight: 600,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  loading: {
    fontSize: '0.8rem',
    color: 'var(--yellow)',
    animation: 'spin 1s linear infinite',
  },
  data: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
}
