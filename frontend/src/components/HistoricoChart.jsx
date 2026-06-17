import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// Cores distintas para cada moeda no gráfico
const CORES = {
  USD: '#6c63ff',
  BRL: '#4caf78',
  GBP: '#f5c842',
  JPY: '#f06060',
  CAD: '#60c4f0',
  CHF: '#f08060',
  EUR: '#c060f0',
}

export default function HistoricoChart({ historico, base }) {
  if (!historico) return null

  // Transforma o objeto { "2024-01-01": { USD: 1.1, ... } } em array de pontos para o Recharts
  const dados = Object.entries(historico).map(([data, taxas]) => ({
    data: data.slice(5), // exibe apenas MM-DD
    ...taxas,
  }))

  const moedas = dados.length > 0
    ? Object.keys(dados[0]).filter((k) => k !== 'data')
    : []

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Histórico — últimos 7 dias (base: {base})</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dados} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d42" />
          <XAxis dataKey="data" stroke="#9094b0" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9094b0" tick={{ fontSize: 12 }} width={70} />
          <Tooltip
            contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d42', borderRadius: 8 }}
            labelStyle={{ color: '#e8eaf6' }}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          {moedas.map((m) => (
            <Line
              key={m}
              type="monotone"
              dataKey={m}
              stroke={CORES[m] ?? '#888'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles = {
  container: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '24px',
  },
  titulo: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '20px',
  },
}
