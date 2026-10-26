# Petição Nacional - Urna Eletrônica Interativa

Aplicação web desenvolvida com **Next.js 14 (React)**, **Tailwind CSS** e **Supabase**, simulando com alta fidelidade visual e sonora uma Urna Eletrônica para apoio a uma petição pública.

---

## 🚀 Como Executar o Projeto Localmente

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Configurar as Variáveis de Ambiente:**
   Crie ou edite o arquivo `.env.local` na raiz do projeto com as chaves do seu projeto Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
   ```

3. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: [http://localhost:3000](http://localhost:3000)

4. **Gerar a Build de Produção:**
   ```bash
   npm run build
   ```

---

## 🗄️ Configuração do Banco de Dados (Supabase)

No painel do Supabase, acesse o menu **SQL Editor**, crie uma nova query e execute o conteúdo do arquivo [`supabase_schema.sql`](./supabase_schema.sql):

- Cria a tabela `peticao_votos`
- Restrição `UNIQUE` em `titulo_eleitor` para bloqueio rigoroso contra fraude/duplicidade
- Habilita `Row Level Security (RLS)` permitindo inserção anônima e resguardando a privacidade dos dados de acordo com a LGPD.

---

## 🛡️ Medidas Anti-Fraude e Anti-Cópia

- **Restrição Unique no PostgreSQL:** Garante a unicidade do Título de Eleitor a nível de banco de dados.
- **Validação Regex no Frontend:** Aceita estritamente apenas números de 10 a 12 dígitos.
- **Prevenção de Cópia e Extração:** `select-none`, bloqueio de clique com o botão direito (`contextmenu`) e atalhos comuns (`F12`, `Ctrl+U`, `Ctrl+S`).
- **Web Audio API:** Síntese em áudio dos sons oficiais da urna brasileira (teclado e encerramento com o clássico "pi-pi-pi-pi-pi-piiii") sem depender de arquivos externos.

---

## 🌐 Deploy na Vercel

1. Suba o repositório para o GitHub ou utilize o CLI da Vercel (`vercel`).
2. Adicione as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. O build e deploy serão realizados automaticamente.
