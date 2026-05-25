# FinanceHub
 
Aplicativo de gestão financeira pessoal: controle de patrimônio, investimentos (com tipos de ativos, moedas BRL/USD e entidades PF/PJ/holding/offshore), despesas, assinaturas, contas fixas e parcelados.
 
## Stack
 
- **Frontend:** Vite + React + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **PWA:** Vite Plugin PWA (instalável no celular)
- **Estado/Dados:** React Context API, React Query
## Rodando localmente
 
### Pré-requisitos
 
- [Node.js](https://nodejs.org/) 18 ou superior
- npm
### Passo a passo
 
```sh
# 1. Clonar
git clone https://github.com/HNeres12/hn2.git
cd hn2
 
# 2. Instalar dependências
npm install
 
# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com as credenciais do seu Supabase
 
# 4. Rodar
npm run dev
```
 
App em `http://localhost:8080`.
 
## Variáveis de ambiente
 
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
```
 
Encontre esses valores no painel do Supabase em **Project Settings → API**.
 
## Scripts
 
- `npm run dev` — desenvolvimento (hot reload)
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — linter
## Estrutura
 
```
src/
  components/      Componentes da aplicação
  contexts/        Context API (Auth, Expense, Investment, AssetType)
  hooks/           Hooks customizados (useQuotes para cotações)
  integrations/    Cliente do Supabase
  pages/           Páginas (Auth, Dashboards, Management, Settings)
  types/           Tipos TypeScript
supabase/
  migrations/      Migrations SQL
```
 
## Tabelas do banco
 
- `asset_types` — Tipos de ativos
- `investments` — Investimentos
- `expense_categories` — Categorias de despesas
- `expenses` — Despesas pontuais
- `subscriptions` — Assinaturas
- `fixed_expenses` — Despesas fixas
- `installment_purchases` — Compras parceladas
Todas têm Row Level Security (RLS) ativado.
 
## Deploy
 
Compatível com Vercel, Netlify, Cloudflare Pages. Configure as variáveis de ambiente no painel do serviço.
 
