# python:3.12-slim foi escolhida em vez da versão "full" ou Alpine:
# - "full" teria ~900MB desnecessários (compiladores, headers, docs)
# - Alpine usa musl libc, que causa incompatibilidades com algumas libs Python nativas (ex: uvicorn com extras)
# - slim usa Debian mínimo (~130MB), compatível com todas as dependências sem peso extra
FROM python:3.12-slim

# Define o diretório de trabalho dentro do container.
# Usar /app é convenção amplamente adotada; evita poluir o diretório raiz
WORKDIR /app

# Copia apenas o arquivo de dependências ANTES do código-fonte.
# Estratégia de cache: se o requirements.txt não mudar, o Docker reutiliza
# a camada do RUN pip install mesmo que o código seja alterado — builds mais rápidos
COPY requirements.txt .

# Instala dependências sem cache local do pip (--no-cache-dir reduz o tamanho da imagem)
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código agora — esta camada só é invalidada se o código mudar,
# e não reexecuta o pip install desnecessariamente
COPY . .

# Documenta a porta usada pelo uvicorn (não abre a porta por si só — isso é feito pelo docker-compose)
EXPOSE 8000

# CMD é substituível em runtime (útil para testes e debugging).
# Usamos ENTRYPOINT apenas quando o binário não deve mudar nunca — aqui CMD é mais flexível.
# --host 0.0.0.0 é obrigatório: sem isso o uvicorn escuta apenas em loopback (127.0.0.1)
# e o container não recebe requisições externas nem do Nginx
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
