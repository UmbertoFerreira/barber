# Antonio Barber — PRD

## Problema original
Landing page de barbearia "Antonio Barber" baseada na foto do logo enviada (emblema vintage: pólo de barbeiro, navalha, tesoura, tipografia dourada "ANTONIO" sobre faixa vermelha "BARBER", fundo azul-petróleo). Com logo e ícone criados, área admin e área de clientes, cards de preço, cards de cortes e loja de perfumes e roupas diferenciada no mesmo site. Pagamento demonstrativo. Cores da imagem (petróleo, dourado, vermelho).

## Arquitetura
- Frontend: React + Tailwind + Framer Motion + Lenis (scroll suave), React Router
- Backend: FastAPI + MongoDB (motor), auth JWT (cookie httpOnly + Bearer), bcrypt
- Rotas: `/` (landing), `/entrar`, `/cliente`, `/admin`
- Coleções: users, services, products, bookings, orders

## Personas
- Visitante: navega landing, vê preços, produtos, adiciona à sacola
- Cliente: cadastro/login, agenda horário, acompanha agendamentos e pedidos
- Admin: gerencia agendamentos (status), serviços/preços (CRUD), produtos (CRUD, perfume/vestuário), pedidos (status)

## Implementado (2026-08-15)
- Fotos reais da casa na galeria (2 primeiras posições: degradê e freestyle), servidas de /public/gallery
- Textos do site simplificados (tom direto, sem "gourmet"): hero "Corte e barba do seu jeito, sem frescura", seções renomeadas (O que a gente faz, Escolha seu corte, Loja, Sobre a casa), descrições de serviços e manifesto reescritos
- Galeria de Cortes: vitrine com 6 estilos (fotos reais), hover revela nome/descrição e botão "Quero esse estilo" que leva ao agendamento com a referência preenchida nas observações; novo link "Galeria" no menu
- Horários bloqueados: GET /api/bookings/slots?date= retorna horários ocupados (pendente/confirmado); select de horário desabilita ocupados com "— ocupado" e auto-seleciona horário livre; backend rejeita duplicado com 409; cancelar agendamento no admin libera o horário
- Expediente configurável: coleção settings (business_hours, seg-dom com aberto/início/fim); GET /api/settings/hours público, PUT /api/admin/hours; aba "Expediente" no admin; cliente vê "— fechado" fora do expediente e "Fechado neste dia"; backend valida dia/horário no POST /api/bookings. Padrão: seg e dom fechados, ter–sex 09–19, sáb 09–14
- Logo emblema SVG customizado (pólo, navalha, tesoura, ANTONIO dourado, faixa BARBER vermelha) + ícone/favicon
- Landing award-level: hero cinético com reveal linha a linha + parallax, pólos de barbeiro animados, marquee editorial lento, cards de serviços/preços numerados, seção Perfumaria (spotlight, molduras douradas) diferenciada da seção Vestuário (grid editorial), manifesto em capítulos numerados com parallax, footer
- Loja demo: sacola com drawer, quantidades, checkout que registra pedido (sem cobrança)
- Auth: cadastro/login e-mail+senha, admin seedado, proteção por role
- Área do Cliente: novo agendamento (serviço/data/horário/obs), meus agendamentos, meus pedidos
- Painel Admin: stats, status de agendamentos, CRUD de serviços/preços, CRUD de produtos (categoria, estoque, selo, imagem), status de pedidos
- Seeds: 4 serviços, 3 perfumes, 3 peças de vestuário
- Verificado: curl em todos os endpoints + screenshots de todos os fluxos (landing, carrinho, login cliente, agendamento, login admin, gestão)

## Credenciais
Ver /app/memory/test_credentials.md (admin@antoniobarber.com / admin123; cliente@teste.com / cliente123)

## Backlog priorizado
- P0: pagamento real (Stripe), notificação de agendamento por e-mail (Resend)
- P1: escolha de barbeiro no agendamento, upload de imagem de produto (object storage)
- P2: recuperação de senha, avaliações de clientes, programa de fidelidade

## Próximas tarefas sugeridas
1. Pagamento real com Stripe no checkout
2. E-mail de confirmação de agendamento/pedido
3. Bloqueio de horários já agendados
4. Upload de fotos de produtos pelo admin
