# 💱 Cash Dash

Dashboard de cotações de moedas em tempo real, desenvolvido como trabalho prático da disciplina de Sistemas Operacionais.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Como Executar](#como-executar)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Uso de IA](#uso-de-ia)

---

## Sobre o Projeto

O **Cash Dash** exibe cotações das principais moedas mundiais (USD, EUR, BRL, GBP, JPY, CAD, CHF) e um gráfico com o histórico dos últimos 7 dias. Os dados são obtidos da [Frankfurter API](https://frankfurter.app) — gratuita, sem autenticação, com dados do Banco Central Europeu.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | FastAPI + Python 3.12 |
| Frontend | React 18 + Vite + Recharts |
| Servidor | Nginx (proxy reverso + static files) |
| Containerização | Docker + Docker Compose |
| API Externa | [Frankfurter API](https://frankfurter.app) |

---

## Arquitetura

```
Browser → Nginx :80 ─┬─ / (arquivos estáticos React)
                      └─ /api/* → FastAPI :8000 → Frankfurter API
```

Dois serviços no Docker Compose:

- **`backend`**: FastAPI rodando com uvicorn na porta 8000 (acessível apenas internamente)
- **`frontend`**: Nginx servindo o build estático do React e fazendo proxy reverso para o backend

---

## Como Executar

### Pré-requisitos

- Docker
- Docker Compose

### Subir a aplicação

```bash
docker compose up --build
```

Acesse em: [http://localhost](http://localhost)

### Parar

```bash
docker compose down
```

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/cotacoes` | Cotações com base em EUR |
| GET | `/api/v1/cotacoes/{base}` | Cotações com base personalizada |
| GET | `/api/v1/historico/{base}` | Histórico dos últimos 7 dias |

Documentação interativa (Swagger): [http://localhost/api/docs](http://localhost/api/docs) *(via proxy Nginx → FastAPI)*

---

## Estrutura de Pastas

```
cash-dash/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── routers/cotacoes.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── services/api.js
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── diario.md
└── README.md
```

---

## Uso de IA

### O que foi gerado com IA

- criar a estrutura DE PASTAS inicial do projeto (criar as pastas de acordo com o que decidi usar/tema)
- debug para entender o problema de rota da api e correção no back
- front end praticamente inteiro, apenas defini algumas coisas ux/ui
- nginx com proxy reverso e SPA fallback

### o que aprendi e modifiquei

o principal aprendizado foi entender como o docker orquestra multiplos servicos juntos. o `docker-compose.yml` define o backend (fastapi) e o frontend (nginx servindo o react) como servicos separados, cada um no seu container, e o docker gerencia a rede interna entre eles.

no backend aprendi: como estruturar as rotas, como fazer chamadas http pra uma api externa com httpx e como configurar o cors. tambem entendi por que o uvicorn precisa do `--host 0.0.0.0` dentro de um container — sem isso ele so escuta o loopback interno e o nginx nao consegue se conectar. aprendi tb que os arquivos `__init__.py` vazios dentro das pastas do projeto sao necessarios pro python tratar essas pastas como pacotes... sem eles o uvicorn nao consegue importar os modulos e lanca erro na inicializacao.

o front foi praticamente todo gerado por ia. defini o tema visual e as informacoes que queria exibir, tecnologia que ela deveria usar e fui ajustando.

as decisoes de docker que entendi e consegui justificar: escolha da imagem base, estrategia de cache de camadas no dockerfile, multi-stage build no frontend e como o `depends_on` com healthcheck garante que os servicos sobem na ordem certa.
