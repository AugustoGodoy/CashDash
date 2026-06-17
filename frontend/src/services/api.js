// Todas as chamadas passam pelo proxy /api — em dev o Vite redireciona para
// localhost:8000, em produção o Nginx faz o proxy para o container backend
const BASE = '/api/v1'

export async function fetchCotacoes(base = 'EUR') {
  const url = base === 'EUR' ? `${BASE}/cotacoes` : `${BASE}/cotacoes/${base}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao buscar cotações: ${res.status}`)
  return res.json()
}

export async function fetchHistorico(base = 'EUR') {
  const res = await fetch(`${BASE}/historico/${base}`)
  if (!res.ok) throw new Error(`Erro ao buscar histórico: ${res.status}`)
  return res.json()
}
