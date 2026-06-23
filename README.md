# ChatbotLess

Aplicacao full stack de chatbot com autenticacao Firebase, base de conhecimento, processamento de documentos, RAG e painel web.

O projeto esta dividido em:

- `backend`: API Django/Django Ninja, Celery, Postgres com pgvector, Redis e integracao com Firebase Admin.
- `frontend/chatbot`: aplicacao React com Vite, Firebase Auth, React Query e Tailwind CSS.
- `docker-compose.yml`: orquestracao completa para rodar backend, frontend e servicos auxiliares.

## Stack

Backend:

- Python 3.13
- Django 6
- Django Ninja
- Celery
- Redis
- PostgreSQL com pgvector
- Firebase Admin
- Gunicorn
- WhiteNoise
- LlamaIndex, OpenAI, spaCy e utilitarios de processamento de PDF/texto

Frontend:

- React 19
- Vite
- Tailwind CSS
- Firebase Web SDK
- Axios
- TanStack Query
- React Router

Infra:

- Docker Compose
- Nginx para servir o build do frontend
- PostgreSQL
- PgAdmin opcional
- Servico externo `integracar/classificador:latest`

## Estrutura do projeto

```text
.
|-- backend/
|   |-- apps/
|   |   |-- analytics/
|   |   |-- base_conhecimento/
|   |   |-- chat/
|   |   |-- rag/
|   |   `-- user/
|   |-- core/
|   |   |-- api.py
|   |   |-- auth.py
|   |   |-- celery.py
|   |   |-- settings.py
|   |   `-- urls.py
|   |-- Dockerfile
|   |-- manage.py
|   `-- requirements.txt
|-- frontend/
|   `-- chatbot/
|       |-- src/
|       |-- Dockerfile
|       |-- nginx.conf
|       |-- package.json
|       `-- vite.config.js
|-- docker-compose.yml
`-- README.md
```

## Servicos Docker

O Compose da raiz sobe:

- `frontend`: React/Vite servido por Nginx em `http://localhost:5173`
- `backend`: Django/Gunicorn em `http://localhost:8000`
- `celery`: worker Celery da aplicacao
- `db-postgres`: PostgreSQL com pgvector em `localhost:5432`
- `redis`: Redis em `localhost:6379`
- `classificador`: imagem `integracar/classificador:latest` em `localhost:8001`
- `pg-admin`: PgAdmin em `http://localhost:15432`

## Variaveis e arquivos de ambiente

O backend espera um arquivo:

```text
backend/.env
```

Variaveis usadas pelo backend:

```env
SECRET_KEY=
OPENAI_API_KEY=
LANGSMITH_TRACING=
LANGSMITH_API_KEY=
DB_NAME=chatbot_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db-postgres
DB_PORT=5432
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
CLASSIFICADOR_URL=http://classificador:8000/classificar
FIREBASE_CREDENTIALS_PATH=/run/secrets/firebase-service-account.json
```

O frontend espera um arquivo:

```text
frontend/chatbot/.env
```

Variaveis usadas pelo Vite/Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Observacao: variaveis `VITE_*` sao embutidas no build final do frontend. Depois de alterar `frontend/chatbot/.env`, refaca o build da imagem do frontend.

## Credenciais Firebase

O JSON da service account do Firebase nao e copiado para a imagem Docker.

No Compose atual, ele e montado como arquivo somente leitura a partir de:

```text
backend/chatbotless-firebase-adminsdk-fbsvc-743390d96f.json
```

Dentro dos containers `backend` e `celery`, o arquivo fica disponivel em:

```text
/run/secrets/firebase-service-account.json
```

Se o nome do JSON mudar, atualize o bind mount e a variavel `FIREBASE_CREDENTIALS_PATH` em `docker-compose.yml`.

## Rodando com Docker

Na raiz do projeto, execute:

```bash
docker-compose up --build
```

Se sua instalacao usa Compose v2:

```bash
docker compose up --build
```

Ao subir, o container do backend executa:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

Para parar os containers:

```bash
docker-compose down
```

Para parar e remover tambem os volumes do banco, Redis, media e static:

```bash
docker-compose down -v
```

## Acessos locais

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

Admin Django:

```text
http://localhost:8000/admin/
```

Documentacao interativa da API Django Ninja:

```text
http://localhost:8000/api/docs
```

PgAdmin:

```text
http://localhost:15432
```

Credenciais padrao do PgAdmin no Compose:

```text
Email: postgres@gmail.com
Senha: postgres
```

## API

A API principal fica sob:

```text
/api/
```

Routers registrados:

- `/api/users/`
- `/api/chat/`
- `/api/base_conhecimento/`
- `/api/rag/`

Principais grupos de endpoints:

- Usuarios: listagem e usuario autenticado.
- Chat: criacao/listagem de chats, mensagens e feedbacks.
- Base de conhecimento: criacao, ativacao, desativacao, upload e listagem de documentos.
- RAG: envio de mensagens para recuperacao e resposta baseada na base de conhecimento.

A autenticacao da API usa Firebase Bearer Token. O frontend injeta automaticamente o token do usuario autenticado nos requests via Axios.

## Desenvolvimento local sem Docker

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Celery:

```bash
cd backend
.venv\Scripts\activate
celery -A core worker -l info
```

Frontend:

```bash
cd frontend/chatbot
npm install
npm run dev
```

Build do frontend:

```bash
cd frontend/chatbot
npm run build
```

## Banco de dados e volumes

O Compose usa volumes nomeados para persistir dados:

- `postgres_data`: dados do PostgreSQL
- `redis_data`: dados do Redis
- `backend_media`: arquivos enviados/processados
- `backend_static`: arquivos estaticos coletados pelo Django

Remover esses volumes apaga dados persistidos:

```bash
docker-compose down -v
```

## Validacao

Comandos uteis:

```bash
docker-compose config
npm run build
python manage.py check
```
