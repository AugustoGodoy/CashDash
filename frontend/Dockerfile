# ─── STAGE 1: BUILD ─────────────────────────────────────────────────────────
# node:20-alpine: versão LTS do Node com Alpine (~180MB vs ~1GB full).
# Alpine é adequado aqui porque o Node apenas compila o React — sem libs nativas Python
# que gerariam conflitos com musl libc. O artefato final é só HTML/CSS/JS estático.
FROM node:20-alpine AS build

# Diretório de trabalho dentro do stage de build
WORKDIR /app

# Copia manifesto de dependências ANTES do código-fonte.
# Mesma estratégia de cache do backend: se package.json não mudar,
# o npm install é reutilizado da cache — builds subsequentes são muito mais rápidos
# Obs.: caminhos relativos ao contexto de build (raiz do projeto), definido no docker-compose
COPY frontend/package*.json ./

# Instala dependências (incluindo devDependencies, necessárias para o Vite compilar)
RUN npm install

# Copia o restante dos arquivos do frontend — invalida o cache só quando o código muda
COPY frontend/ .

# Gera o bundle de produção estático na pasta /app/dist
RUN npm run build


# ─── STAGE 2: SERVE ──────────────────────────────────────────────────────────
# Multi-stage build: a imagem final NÃO contém Node.js, npm, source-code nem devDependencies.
# Apenas os arquivos estáticos do /dist + Nginx (~25MB) chegam ao container de produção.
# Isso reduz a superfície de ataque e o tamanho da imagem drasticamente.
FROM nginx:alpine

# Copia a configuração customizada do Nginx (proxy reverso + SPA fallback).
# O contexto de build é a raiz do projeto, por isso o path nginx/nginx.conf funciona aqui.
# A config padrão do nginx:alpine serviria arquivos mas não faria proxy para o backend
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados pelo stage de build para o diretório padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Porta 80 é a padrão do Nginx e está mapeada no docker-compose
EXPOSE 80

# CMD padrão do nginx:alpine já inicia o daemon — não precisamos sobrescrever
