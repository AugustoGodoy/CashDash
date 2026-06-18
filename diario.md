# diario de desenvolvimento — cash dash


primeiramente defini o tema do projeto, os requsitos e tecnlogias a serem utilizadas, apos isso revisei os requisitos no ava e pedi para ia gerar a estrtura de pastas e um front em react, apos isso fui construindo o back end e docker.

Muitas coisas eu tinha duvida mas assim que eu começava a desenvolver eu tinha as sugestoes do tab complete que ajuda bastante no desenvolvimento... 

registro dos problemas que apareceram durante o desenvolvimento e como resolvi cada um.

---

## entrada 1 — build do frontend quebrando no npm install

rodei `docker compose up --build` e o build parou com esse erro:

```
ERROR [frontend build 4/5] RUN npm install
npm error ENOENT: no such file or directory, open '/app/package.json'
```

fui olhar o dockerfile e vi que o `COPY package*.json ./` estava antes do `WORKDIR /app`. sem o workdir definido, o docker copiou o arquivo pra raiz `/` do container, e o npm install nao encontrou o `package.json` dentro de `/app`.

movi o `WORKDIR` pra antes do `COPY` e o build passou. aprendi que a ordem das instrucoes no dockerfile importa — cada linha depende do que a anterior deixou.

---

## entrada 2 — cards de cotacao nao carregavam (502)

o build funcionou, o cash dash abriu no navegador, mas os cards de moeda nao apareciam — so uma mensagem de erro 502.

os logs do nginx mostravam:

```
[error] connect() failed (111: Connection refused) while connecting to upstream,
upstream: "http://backend:8000/"
```

o nginx nao conseguia se conectar ao backend. o uvicorn por padrao escuta em `127.0.0.1`, o que significa que so aceita conexoes de dentro do proprio container. o nginx esta em outro container, entao era recusado.

ajustei o CMD no `backend/Dockerfile` pra usar `0.0.0.0`:

```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

depois disso os cards de USD, EUR, BRL etc apareceram normal.

---

## entrada 3 — f5 na pagina retornava 404

dei f5 na pagina e caiu num 404 do nginx.

o cash dash e uma SPA, entao o react controla as rotas via javascript no client. pra o nginx, nao existe arquivo fisico com o nome da rota, entao ele retorna 404.

adicionei o fallback no `nginx.conf`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

com isso, se o arquivo nao existir, o nginx serve o `index.html` e o react assume o controle.

---

## entrada 4 — frontend subia antes do backend estar pronto

em alguns `docker compose up` os cards apareciam com erro no inicio, mas rodando de novo funcionava.

o `depends_on` padrao so espera o container iniciar, nao espera o serviço dentro dele estar respondendo. dependendo da velocidade, o nginx subia e tentava fazer proxy antes do uvicorn terminar de inicializar.

adicionei um `healthcheck` no backend que bate no `/health` do fastapi, e configurei o frontend pra esperar `service_healthy`:

```yaml
depends_on:
  backend:
    condition: service_healthy
```

o nginx agora so sobe depois que o `/health` ja esta retornando 200.

---

## entrada 4.5 — dificuldade pra criar o cotacoes.py

na parte do backend eu travei bastante no `cotacoes.py`. nao sabia como estruturar os endpoints no fastapi, como chamar uma api externa de dentro do python nem como tratar os erros de forma que o frontend recebesse algo util.

recorri a ia pra me ajudar a montar esse arquivo. expliquei o que eu queria — tres endpoints: um pra cotacao atual, um por moeda base e um de historico — e a ia gerou a estrutura usando `httpx` pra chamadas async e `APIRouter` pra organizar as rotas separado do `main.py`.

o que aprendi com isso: o `httpx.AsyncClient` funciona com `async/await`, que faz sentido dentro do fastapi que e async por natureza. o `APIRouter` serve pra modularizar as rotas em vez de jogar tudo no `main.py`. e o padrao `raise_for_status()` + `except HTTPStatusError` e a forma certa de capturar falha de api externa sem deixar o servidor cair com 500 generico.

---

## entrada 5 — cotacoes com 502 mesmo com tudo healthy

os dois containers apareciam `Up (healthy)`, o frontend abria, mas as cotacoes nao carregavam — erro 502.

```
backend-1   | INFO:     172.21.0.3:34724 - "GET /api/v1/cotacoes HTTP/1.1" 502 Bad Gateway
backend-1   | INFO:     172.21.0.3:34712 - "GET /api/v1/cotacoes/BRL HTTP/1.1" 502 Bad Gateway
backend-1   | INFO:     172.21.0.3:52964 - "GET /api/v1/historico/USD HTTP/1.1" 502 Bad Gateway
```

o `/health` continuava respondendo 200, entao o uvicorn estava ok. o problema estava dentro dos endpoints de cotacao. fui ver o `cotacoes.py` e lembrei que o fastapi joga novamente a falha da api externa como 502. testei a url manualmente e vi que `api.frankfurter.app` nao estava mais respondendo... o dominio correto mudou pra `api.frankfurter.dev`.

ajustei no codigo:

```python
# antes
FRANKFURTER_BASE = "https://api.frankfurter.app"

# depois
FRANKFURTER_BASE = "https://api.frankfurter.dev/v1"
```

rodei novamente `docker compose up --build` pra rebuildar e bombou 

---

## entrada 6 — imagem do frontend com 1.2gb

rodei `docker images` e vi isso:

```
cashdash-frontend   latest   1.18GB
```

o dockerfile tinha um unico stage, entao o node.js inteiro ficava na imagem final mesmo nao sendo necessario em producao — o nginx so precisa dos arquivos estaticos do `/dist`.

mudei pra multi-stage build: stage 1 com `node:20-alpine` compila o react e gera o `/dist`, stage 2 com `nginx:alpine` copia so o `/dist`. o node nao vai pra imagem final.

```
antes:  cashdash-frontend   latest   1.18GB
depois: cashdash-frontend   latest   26.3MB
```
