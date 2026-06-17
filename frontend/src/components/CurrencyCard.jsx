const FLAG = {
  EUR: '🇪🇺', USD: '🇺🇸', BRL: '🇧🇷', GBP: '🇬🇧',
  JPY: '🇯🇵', CAD: '🇨🇦', CHF: '🇨🇭',
}

const NOME = {
  EUR: 'Euro',
  USD: 'Dólar Americano',
  BRL: 'Real Brasileiro',
  GBP: 'Libra Esterlina',
  JPY: 'Iene Japonês',
  CAD: 'Dólar Canadense',
  CHF: 'Franco Suíço',
}

// Formata a taxa conforme a moeda — JPY não usa decimais (moeda de baixo valor unitário)
function formatarTaxa(moeda, taxa) {
  if (moeda === 'JPY') return taxa.toFixed(2)
  if (taxa < 0.01) return taxa.toFixed(6)
  return taxa.toFixed(4)
}

export default function CurrencyCard({ moeda, taxa, base, isBase }) {
  return (
    <div style={{ ...styles.card, ...(isBase ? styles.cardBase : {}) }}>
      <div style={styles.top}>
        <span style={styles.flag}>{FLAG[moeda] ?? '🏳️'}</span>
        <div>
          <span style={styles.code}>{moeda}</span>
          {isBase && <span style={styles.baseBadge}>base</span>}
        </div>
      </div>

      <p style={styles.name}>{NOME[moeda] ?? moeda}</p>

      <div style={styles.rateRow}>
        <span style={styles.rate}>
          {isBase ? '1.0000' : formatarTaxa(moeda, taxa)}
        </span>
        <span style={styles.pair}>{base}</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'transform 0.15s, box-shadow 0.15s',
    cursor: 'default',
  },
  cardBase: {
    border: '1px solid var(--accent)',
    background: 'var(--surface-hover)',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  flag: {
    fontSize: '2rem',
  },
  code: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'block',
  },
  baseBadge: {
    fontSize: '0.65rem',
    background: 'var(--accent)',
    color: '#fff',
    padding: '1px 7px',
    borderRadius: '10px',
    fontWeight: 600,
    marginLeft: '6px',
    verticalAlign: 'middle',
  },
  name: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  rateRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginTop: '4px',
  },
  rate: {
    fontSize: '1.7rem',
    fontWeight: 700,
    color: 'var(--accent-light)',
    fontVariantNumeric: 'tabular-nums',
  },
  pair: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
  },
}
