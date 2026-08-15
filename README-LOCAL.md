# Antonio Barber — Como rodar no VSCode

## Estrutura
```
backend/    → API em FastAPI (Python) + MongoDB
frontend/   → Site em React + Tailwind
```

## Pré-requisitos
- Node.js 18+ e Yarn (`npm install -g yarn`)
- Python 3.10+
- MongoDB rodando localmente (ou uma URL do MongoDB Atlas)

## 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # no Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Edite o arquivo `backend/.env` se precisar (Mongo local já vem configurado):
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
JWT_SECRET="..."          # troque por uma chave sua
ADMIN_EMAIL="admin@antoniobarber.com"
ADMIN_PASSWORD="admin123"
```
Rodar:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
Na primeira vez que subir, o sistema cria sozinho: usuário admin, 4 serviços e 6 produtos.

## 2. Frontend
```bash
cd frontend
yarn install
```
Edite `frontend/.env` e aponte para o seu backend:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```
Rodar:
```bash
yarn start
```
Site abre em http://localhost:3000

## Acessos de teste
- Admin: admin@antoniobarber.com / admin123 → painel em /admin
- Cliente: cliente@teste.com / cliente123 → área em /cliente

## Onde mexer no que
| Quero mudar... | Arquivo |
|---|---|
| Cores do site | `frontend/tailwind.config.js` (petrol, gold, crimson, cream) |
| Textos da página inicial | `frontend/src/components/landing/*.jsx` |
| Fotos da galeria | `frontend/src/components/landing/Gallery.jsx` + pasta `frontend/public/gallery/` |
| Nomes/preços de cortes e produtos | Painel Admin (ou seeds em `backend/server.py`) |
| Horários de funcionamento | Painel Admin → aba Expediente |
| Logo | `frontend/src/components/Logo.jsx` (SVG) |
