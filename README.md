# Antonio Barber

Site completo da barbearia **Antonio Barber**: landing page, loja de perfumes e roupas (modo demonstração), agendamento com controle de horários e painel administrativo.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Tailwind CSS, Framer Motion, Lenis |
| Backend | FastAPI (Python), Motor (MongoDB async) |
| Banco | MongoDB |
| Auth | JWT (cookie httpOnly + Bearer) com senha hasheada (bcrypt) |

## Estrutura de pastas

```
├── backend/
│   ├── server.py            # API: rotas, modelos, seeds e regras de negócio
│   ├── requirements.txt     # Dependências Python
│   ├── .env                 # Configuração (Mongo, JWT, admin)
│   └── uploads/             # Fotos enviadas pelo painel admin
├── frontend/
│   ├── public/
│   │   ├── gallery/         # Fotos reais da galeria de cortes
│   │   ├── favicon.svg      # Ícone do site
│   │   └── index.html       # HTML base + fontes
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/     # Seções da página inicial (Hero, Services, Gallery, Shop, Manifesto, Footer, Marquee)
│   │   │   ├── Logo.jsx     # Logo e ícone em SVG
│   │   │   ├── Navbar.jsx   # Menu fixo
│   │   │   └── CartDrawer.jsx # Sacola de compras
│   │   ├── context/         # AuthContext (login) e CartContext (sacola)
│   │   ├── lib/api.js       # Axios configurado + helpers (preço, imagem, erros)
│   │   ├── pages/           # Landing, AuthPage, ClientArea, AdminArea
│   │   ├── App.js           # Rotas + scroll suave (Lenis)
│   │   └── index.css        # Tema (cores, fontes, efeitos)
│   └── tailwind.config.js   # Paleta da marca (petrol, gold, crimson, cream)
└── memory/                  # Documentação interna (PRD, credenciais de teste)
```

## Como rodar localmente (VSCode)

Pré-requisitos: Node.js 18+, Yarn, Python 3.10+, MongoDB.

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
No primeiro start, o sistema cria automaticamente: usuário admin, 4 serviços e 6 produtos.

### 2. Frontend
```bash
cd frontend
yarn install
yarn start
```
Abre em `http://localhost:3000`. O arquivo `frontend/.env` aponta o endereço da API em `REACT_APP_BACKEND_URL` (em desenvolvimento local, use `http://localhost:8001`).

## Acessos de teste

| Perfil | E-mail | Senha | Onde entra |
|---|---|---|---|
| Admin | admin@antoniobarber.com | admin123 | `/admin` |
| Cliente | cliente@teste.com | cliente123 | `/cliente` |

## Funcionalidades

- **Landing page**: hero animado, letreiro, serviços e preços, galeria de cortes, loja (perfumes e roupas), história da casa
- **Loja (demo)**: sacola com quantidades, pedido registrado sem cobrança
- **Área do cliente**: cadastro/login, agendamento com horários livres por dia, histórico de agendamentos e pedidos
- **Painel admin**: status de agendamentos e pedidos, CRUD de serviços e produtos (com upload de foto), expediente por dia da semana
- **Regras de agenda**: horário ocupado é bloqueado; fora do expediente é recusado; cancelar libera o horário

## Onde mexer no quê

| Quero mudar... | Arquivo |
|---|---|
| Cores | `frontend/tailwind.config.js` |
| Textos da página inicial | `frontend/src/components/landing/*.jsx` |
| Fotos da galeria | `frontend/src/components/landing/Gallery.jsx` + `frontend/public/gallery/` |
| Preços, produtos, expediente | Painel Admin (sem mexer em código) |
| Logo | `frontend/src/components/Logo.jsx` |
| Regras da API | `backend/server.py` |
