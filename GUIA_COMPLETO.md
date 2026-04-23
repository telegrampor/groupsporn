# GUIA COMPLETO DE LANÇAMENTO — nsfw-directory
# Do zero ao site no ar. Siga na ordem. Não pule etapas.
# ================================================================

# ════════════════════════════════════════════════════════════════
# ETAPA 0 — O QUE VOCÊ VAI PRECISAR CRIAR/TER
# ════════════════════════════════════════════════════════════════

Contas necessárias (crie antes de começar):
  ✅ GitHub         → github.com (gratuito)
  ✅ Vercel         → vercel.com (gratuito)
  ✅ Supabase       → supabase.com (gratuito)
  ✅ Cloudflare     → cloudflare.com (gratuito)
  ✅ Namecheap      → namecheap.com (pago ~$10/ano pelo domínio)
  ✅ Google Cloud   → console.cloud.google.com (gratuito, precisa de cartão)
  ✅ Anthropic      → console.anthropic.com (pago por uso, ~$5 pra começar)

Tempo estimado para completar tudo: 3-4 horas na primeira vez.


# ════════════════════════════════════════════════════════════════
# ETAPA 1 — DOMÍNIO (Namecheap + Cloudflare)
# ════════════════════════════════════════════════════════════════

## 1.1 Comprar o domínio no Namecheap
  1. Acesse namecheap.com
  2. Pesquise um nome (ex: telensfw.com, nsfwgroups.net, etc)
  3. Compre. Durante o checkout:
     - Ative "WhoisGuard" (privacidade, é grátis)
     - NÃO compre o hosting deles (vai usar Vercel)
  4. Anote: SEUDOMAIN.COM

## 1.2 Adicionar domínio no Cloudflare
  1. Acesse cloudflare.com → "Add a site"
  2. Digite SEUDOMAIN.COM → selecione plano Free → Continue
  3. O Cloudflare vai mostrar 2 nameservers, algo como:
       ana.ns.cloudflare.com
       bob.ns.cloudflare.com
  4. Anote esses dois nameservers

## 1.3 Apontar Namecheap para Cloudflare
  1. No Namecheap → "Domain List" → clique no seu domínio → "Manage"
  2. Em "Nameservers" → selecione "Custom DNS"
  3. Insira os 2 nameservers do Cloudflare
  4. Salve
  5. Aguarde 15-30 minutos para propagar
  
  VERIFICAÇÃO: No Cloudflare, o status deve mudar para "Active"


# ════════════════════════════════════════════════════════════════
# ETAPA 2 — SUPABASE (Banco de dados)
# ════════════════════════════════════════════════════════════════

## 2.1 Criar projeto
  1. Acesse supabase.com → "New Project"
  2. Nome: nsfw-directory
  3. Database Password: crie uma senha forte e ANOTE
  4. Region: US East (melhor para tráfego EN/EUA)
  5. Clique "Create new project" → aguarde ~2 minutos

## 2.2 Pegar as chaves de API
  Após criar o projeto:
  1. Vá em Settings (engrenagem) → API
  2. Copie e anote:
     - "Project URL"       → NEXT_PUBLIC_SUPABASE_URL
     - "anon public"       → NEXT_PUBLIC_SUPABASE_ANON_KEY
     - "service_role"      → SUPABASE_SERVICE_ROLE_KEY
                             (CUIDADO: nunca exponha esta chave no frontend)

## 2.3 Rodar o SQL do banco
  1. No Supabase → clique em "SQL Editor" no menu lateral
  2. Clique em "New query"
  3. Cole TODO o conteúdo do arquivo:
     supabase/migrations/001_initial_schema.sql
     (o arquivo SQL que está na pasta do projeto)
  4. Clique "Run" (ou Ctrl+Enter)
  5. Deve aparecer "Success. No rows returned"
  
  VERIFICAÇÃO: Vá em "Table Editor" → você deve ver as tabelas:
  groups, bots, categories, articles, ai_tools, indexing_log, seo_config

## 2.4 Criar as funções SQL extras (rodar separado)
  No SQL Editor, rode este comando para criar a função RPC:
  
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_type = 'FUNCTION' AND routine_schema = 'public';
  
  Deve listar: publish_daily_batch, increment_group_view, 
               increment_group_click, calculate_quality_score


# ════════════════════════════════════════════════════════════════
# ETAPA 3 — CLOUDFLARE R2 (Storage de imagens)
# ════════════════════════════════════════════════════════════════

## 3.1 Criar bucket R2
  1. No Cloudflare → clique em "R2" no menu lateral
  2. Clique "Create bucket"
  3. Nome: nsfw-directory-images
  4. Location: Automatic
  5. Clique "Create bucket"

## 3.2 Tornar o bucket público
  1. Clique no bucket criado
  2. Vá na aba "Settings"
  3. Em "Public Access" → clique "Allow Access"
  4. Anote a URL pública, algo como:
     https://pub-XXXXXXXXXXXX.r2.dev
     → Esta é a NEXT_PUBLIC_R2_PUBLIC_URL

## 3.3 Criar token de acesso R2 (para o scraper fazer upload)
  1. No Cloudflare → R2 → "Manage R2 API Tokens"
  2. Clique "Create API Token"
  3. Permissions: "Object Read & Write"
  4. Selecione o bucket: nsfw-directory-images
  5. Clique "Create API Token"
  6. Anote:
     - Access Key ID     → R2_ACCESS_KEY_ID
     - Secret Access Key → R2_SECRET_ACCESS_KEY
     - Endpoint          → R2_ENDPOINT (algo como https://ACCOUNTID.r2.cloudflarestorage.com)


# ════════════════════════════════════════════════════════════════
# ETAPA 4 — GOOGLE CLOUD (Indexing API — 6 projetos)
# ════════════════════════════════════════════════════════════════

Você precisa criar 6 projetos separados no Google Cloud.
Cada projeto = 200 URLs/dia = 1200 URLs/dia no total.
Repita os passos 4.1 a 4.4 exatamente 6 vezes.

## 4.1 Criar projeto no Google Cloud
  1. Acesse console.cloud.google.com
  2. No topo → clique no seletor de projeto → "New Project"
  3. Nome: nsfw-indexing-1 (depois: nsfw-indexing-2, nsfw-indexing-3... até 6)
  4. Clique "Create"

## 4.2 Ativar a Indexing API
  1. Com o projeto selecionado, vá em:
     APIs & Services → Library
  2. Pesquise "Web Search Indexing API"
  3. Clique → "Enable"

## 4.3 Criar conta de serviço
  1. Vá em: IAM & Admin → Service Accounts
  2. Clique "Create Service Account"
  3. Nome: indexing-sa
  4. Clique "Create and Continue" → "Done" (sem role por enquanto)
  5. Clique na conta criada → aba "Keys"
  6. Add Key → Create new key → JSON → Create
  7. O arquivo JSON vai baixar automaticamente
  8. RENOMEIE para: credentials1.json (depois credentials2.json... até credentials6.json)
  
  IMPORTANTE: Guarde esses arquivos. Eles são as suas "chaves" para enviar URLs ao Google.

## 4.4 Adicionar a conta de serviço no Google Search Console
  ATENÇÃO: Só faça esta etapa APÓS o site estar no ar com o domínio funcionando.
  
  1. Acesse search.google.com/search-console
  2. Adicione sua propriedade (seu domínio)
  3. Vá em Settings → Users and permissions
  4. Clique "Add user"
  5. Email: copie o email da conta de serviço (termina em @...iam.gserviceaccount.com)
     (está visível no Google Cloud → IAM & Admin → Service Accounts)
  6. Permission: Owner
  7. Clique "Add"
  
  Repita o passo 4.4 para todos os 6 projetos (6 emails diferentes no GSC).


# ════════════════════════════════════════════════════════════════
# ETAPA 5 — ANTHROPIC (IA para gerar seo_descriptions)
# ════════════════════════════════════════════════════════════════

  1. Acesse console.anthropic.com
  2. Settings → API Keys → "Create Key"
  3. Nome: nsfw-directory
  4. Copie a chave → ANTHROPIC_API_KEY
  5. Adicione créditos: Settings → Billing → Add credits ($5 já basta para começar)


# ════════════════════════════════════════════════════════════════
# ETAPA 6 — GITHUB (Repositório do código)
# ════════════════════════════════════════════════════════════════

  1. Acesse github.com → "New repository"
  2. Nome: nsfw-directory
  3. Visibilidade: Private (importante — não deixe público)
  4. NÃO inicialize com README
  5. Clique "Create repository"
  6. Anote a URL do repositório:
     https://github.com/SEU_USUARIO/nsfw-directory


# ════════════════════════════════════════════════════════════════
# ETAPA 7 — CRIAR O PROJETO NO SEU PC
# ════════════════════════════════════════════════════════════════

Abra o CMD do Windows e rode:

  cd C:\
  npx create-next-app@latest nsfw-directory --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git
  cd nsfw-directory
  npm install @supabase/supabase-js @supabase/ssr lucide-react

Agora abra o Claude Code DENTRO desta pasta:
  (no CMD, dentro de C:\nsfw-directory, rode: claude)

E cole o PROMPT DA FASE 1 do arquivo CLAUDE_CODE_PROMPTS.md


# ════════════════════════════════════════════════════════════════
# ETAPA 8 — ONDE COLOCAR CADA ARQUIVO
# ════════════════════════════════════════════════════════════════

Estrutura final da pasta C:\nsfw-directory:

C:\nsfw-directory\
│
├── .env.local                ← NUNCA commitar no GitHub (já está no .gitignore)
│
├── credentials\              ← Pasta para as chaves do Google Cloud
│   ├── credentials1.json     ← Baixado na Etapa 4 (projeto nsfw-indexing-1)
│   ├── credentials2.json     ← Baixado na Etapa 4 (projeto nsfw-indexing-2)
│   ├── credentials3.json     ← Baixado na Etapa 4 (projeto nsfw-indexing-3)
│   ├── credentials4.json     ← Baixado na Etapa 4 (projeto nsfw-indexing-4)
│   ├── credentials5.json     ← Baixado na Etapa 4 (projeto nsfw-indexing-5)
│   └── credentials6.json     ← Baixado na Etapa 4 (projeto nsfw-indexing-6)
│
├── scripts\
│   ├── requirements.txt      ← Dependências Python
│   ├── health_check.py       ← Arquivo entregue anteriormente
│   ├── utils\
│   │   ├── __init__.py       ← Arquivo vazio (crie um arquivo vazio com este nome)
│   │   ├── logger.py         ← Arquivo entregue anteriormente
│   │   └── db_validator.py   ← Arquivo entregue anteriormente
│   └── ingestion\
│       ├── __init__.py       ← Arquivo vazio (crie um arquivo vazio com este nome)
│       ├── daily_publish.py  ← Arquivo entregue anteriormente
│       └── ai_content_generator.py  ← Arquivo entregue anteriormente
│
├── supabase\
│   └── migrations\
│       └── 001_initial_schema.sql  ← SQL da conversa anterior
│
├── src\                      ← Código Next.js (gerado pelo Claude Code)
│   ├── app\
│   ├── components\
│   ├── lib\
│   └── types\
│
├── next.config.ts
├── middleware.ts
├── .gitignore
└── package.json

## Como colocar os arquivos Python:

Os 5 arquivos .py que foram entregues como download nesta conversa:
  - logger.py              → C:\nsfw-directory\scripts\utils\logger.py
  - db_validator.py        → C:\nsfw-directory\scripts\utils\db_validator.py
  - health_check.py        → C:\nsfw-directory\scripts\health_check.py
  - daily_publish.py       → C:\nsfw-directory\scripts\ingestion\daily_publish.py
  - ai_content_generator.py → C:\nsfw-directory\scripts\ingestion\ai_content_generator.py

Crie também 2 arquivos __init__.py vazios:
  - C:\nsfw-directory\scripts\utils\__init__.py      (arquivo vazio)
  - C:\nsfw-directory\scripts\ingestion\__init__.py  (arquivo vazio)

## Como colocar os credentials do Google:

Os 6 arquivos JSON baixados na Etapa 4:
  - O JSON do projeto nsfw-indexing-1 → renomeie para credentials1.json
  - O JSON do projeto nsfw-indexing-2 → renomeie para credentials2.json
  - ...e assim por diante até credentials6.json
  - Cole todos em: C:\nsfw-directory\credentials\


# ════════════════════════════════════════════════════════════════
# ETAPA 9 — ARQUIVO .env.local (todas as chaves juntas)
# ════════════════════════════════════════════════════════════════

Crie o arquivo C:\nsfw-directory\.env.local com TODAS as chaves que você coletou:

  # Supabase (Etapa 2.2)
  NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

  # Site
  NEXT_PUBLIC_SITE_URL=https://SEUDOMAIN.COM
  NEXT_PUBLIC_SITE_NAME=TeleNSFW

  # Cloudflare R2 (Etapa 3.2 e 3.3)
  NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-XXXX.r2.dev
  R2_ACCESS_KEY_ID=XXXX
  R2_SECRET_ACCESS_KEY=XXXX
  R2_ENDPOINT=https://ACCOUNTID.r2.cloudflarestorage.com
  R2_BUCKET_NAME=nsfw-directory-images

  # Anthropic (Etapa 5)
  ANTHROPIC_API_KEY=sk-ant-...

ATENÇÃO: Nunca commite este arquivo. Verifique que .gitignore contém ".env.local"


# ════════════════════════════════════════════════════════════════
# ETAPA 10 — SUBIR CÓDIGO NO GITHUB
# ════════════════════════════════════════════════════════════════

No CMD, dentro de C:\nsfw-directory:

  git init
  git add .
  git commit -m "initial commit"
  git branch -M main
  git remote add origin https://github.com/SEU_USUARIO/nsfw-directory.git
  git push -u origin main

ATENÇÃO: O .env.local NÃO deve aparecer no push.
Verifique antes: git status — o .env.local não deve aparecer na lista.


# ════════════════════════════════════════════════════════════════
# ETAPA 11 — DEPLOY NO VERCEL
# ════════════════════════════════════════════════════════════════

  1. Acesse vercel.com → "Add New Project"
  2. Clique "Import Git Repository"
  3. Conecte sua conta GitHub se ainda não conectou
  4. Selecione o repositório: nsfw-directory
  5. Clique "Import"

## Configurar variáveis de ambiente no Vercel:
  Antes de dar o primeiro deploy, clique em "Environment Variables"
  e adicione UMA A UMA todas as variáveis do seu .env.local:
  
  NEXT_PUBLIC_SUPABASE_URL       = (o valor do seu .env.local)
  NEXT_PUBLIC_SUPABASE_ANON_KEY  = (o valor do seu .env.local)
  SUPABASE_SERVICE_ROLE_KEY      = (o valor do seu .env.local)
  NEXT_PUBLIC_SITE_URL           = https://SEUDOMAIN.COM
  NEXT_PUBLIC_SITE_NAME          = TeleNSFW
  NEXT_PUBLIC_R2_PUBLIC_URL      = (o valor do seu .env.local)
  ANTHROPIC_API_KEY              = (o valor do seu .env.local)

  Depois clique "Deploy"

## Conectar domínio no Vercel:
  1. Vercel → seu projeto → Settings → Domains
  2. Digite SEUDOMAIN.COM → Add
  3. O Vercel vai mostrar registros DNS para adicionar
  4. Vá no Cloudflare → DNS do seu domínio
  5. Adicione os registros que o Vercel pediu (geralmente um CNAME)
  6. Aguarde 5-10 minutos

VERIFICAÇÃO FINAL:
  Abra o CMD e rode:
  curl -s https://SEUDOMAIN.COM | findstr /I "TeleNSFW"
  
  Se retornar o nome do site → está funcionando e servindo SSR.


# ════════════════════════════════════════════════════════════════
# ETAPA 12 — INSTALAR DEPENDÊNCIAS PYTHON E TESTAR
# ════════════════════════════════════════════════════════════════

No CMD, dentro de C:\nsfw-directory:

  pip install -r scripts/requirements.txt

Teste o health check:
  python scripts/health_check.py

Na primeira execução, vai mostrar:
  - 0 grupos em todos os status (banco vazio, normal)
  - Status de cada credentials*.json (OK ou ARQUIVO NÃO ENCONTRADO)
  - Recomendação de ação

Se credentials*.json aparecer como "ARQUIVO NÃO ENCONTRADO":
  → Você ainda não colocou os arquivos na pasta credentials\
  → Volte para a Etapa 4 e baixe os JSONs do Google Cloud


# ════════════════════════════════════════════════════════════════
# ETAPA 13 — INSERIR OS PRIMEIROS 50 GRUPOS (Sandbox)
# ════════════════════════════════════════════════════════════════

Antes de rodar qualquer automação, insira manualmente os primeiros 50 grupos.
Esses grupos serão o seu "sandbox de validação".

No Supabase → SQL Editor, rode este INSERT de exemplo (adapte com dados reais):

  INSERT INTO groups (
    slug, name, description, telegram_url, thumbnail_url,
    category_slug, country, member_count,
    is_verified, is_new, indexing_status, status, source
  ) VALUES (
    'slap-ass-milf',
    'SLAP ASS MILF',
    'Loads of high quality porn videos on Telegram! Slap that ass!',
    'https://t.me/slap_ass_milf',
    'https://pub-XXXX.r2.dev/groups/slap-ass-milf.webp',
    'milf',
    'All',
    315225,
    true, true, 'queued', 'active', 'erogram'
  );

Insira os 50 grupos mais populares do erogram.
Use o erogram.pro/groups como fonte (member_count, categoria, etc).
O quality_score é calculado automaticamente pelo trigger SQL.

Após inserir, verifique:
  SELECT slug, quality_score, indexing_status FROM groups ORDER BY quality_score DESC;

Grupos com quality_score >= 40 estão prontos para publicação.


# ════════════════════════════════════════════════════════════════
# ETAPA 14 — FLUXO COMPLETO DE LANÇAMENTO
# ════════════════════════════════════════════════════════════════

Execute nesta ordem EXATA:

## Passo 1: Gerar as seo_descriptions
  python scripts/ingestion/ai_content_generator.py
  
  Aguarda terminar. Loga cada geração com evidência.
  Resultado esperado: 50 grupos com seo_description gerada e confirmada.

## Passo 2: Verificar saúde antes de publicar
  python scripts/health_check.py
  
  Confirme que mostra:
  ✅ 0 grupos sem seo_description
  ✅ credentials carregadas
  ✅ 50 grupos com indexing_status='queued'

## Passo 3: Publicar o primeiro lote (sandbox de 50)
  python scripts/ingestion/daily_publish.py
  
  O script vai:
  1. Publicar os 50 no banco (indexing_status → published)
  2. Cross-check que foram publicados
  3. Scan de segurança: reverter qualquer um sem seo_description
  4. Submeter as URLs à Google Indexing API
  5. Cross-check que foram marcados como 'submitted' no banco
  6. Gerar log detalhado em logs/daily_publish_TIMESTAMP.jsonl

## Passo 4: Verificar resultado
  python scripts/health_check.py
  
  Deve mostrar:
  ✅ 50 grupos com indexing_status='submitted'
  ✅ 50 entradas no indexing_log com status='success'

## Passo 5: Validar SSR das páginas publicadas
  curl -s https://SEUDOMAIN.COM/slap-ass-milf | findstr /I "<h1"
  curl -s https://SEUDOMAIN.COM/slap-ass-milf | findstr /I "<title"
  
  Ambos devem retornar conteúdo real (não vazio, não "Loading...")

## Passo 6: Adicionar ao Google Search Console
  1. Acesse search.google.com/search-console
  2. Adicione propriedade: SEUDOMAIN.COM
  3. Verifique via DNS (Cloudflare facilita isso)
  4. Vá em Sitemaps → adicione: https://SEUDOMAIN.COM/sitemap.xml
  5. Aguarde 24-48h para o Google processar


# ════════════════════════════════════════════════════════════════
# ETAPA 15 — WINDOWS TASK SCHEDULER (Automação diária)
# ════════════════════════════════════════════════════════════════

Configure estas 3 tarefas no Task Scheduler do Windows
(Pesquise "Task Scheduler" no menu iniciar):

## Tarefa 1: ai_content_generator (08:00 UTC diário)
  Action: Start a program
  Program: python
  Arguments: C:\nsfw-directory\scripts\ingestion\ai_content_generator.py
  Start in: C:\nsfw-directory
  Trigger: Daily at 08:00 UTC

## Tarefa 2: daily_publish (13:30 UTC diário)
  Action: Start a program
  Program: python
  Arguments: C:\nsfw-directory\scripts\ingestion\daily_publish.py
  Start in: C:\nsfw-directory
  Trigger: Daily at 13:30 UTC

## Tarefa 3: health_check (14:30 UTC diário)
  Action: Start a program
  Program: python
  Arguments: C:\nsfw-directory\scripts\health_check.py
  Start in: C:\nsfw-directory
  Trigger: Daily at 14:30 UTC

Os logs ficam em: C:\nsfw-directory\logs\
Abra qualquer arquivo .jsonl para ver o histórico detalhado.


# ════════════════════════════════════════════════════════════════
# RESUMO: ORDEM CRONOLÓGICA COMPLETA
# ════════════════════════════════════════════════════════════════

DIA 1 (setup de contas — ~3h):
  ✅ Etapa 1: Comprar domínio + apontar para Cloudflare
  ✅ Etapa 2: Criar Supabase + rodar SQL
  ✅ Etapa 3: Criar bucket R2 no Cloudflare
  ✅ Etapa 4: Criar 6 projetos Google Cloud + baixar credentials*.json
  ✅ Etapa 5: Pegar chave Anthropic
  ✅ Etapa 6: Criar repositório GitHub privado

DIA 1-2 (código — ~2h com Claude Code):
  ✅ Etapa 7: Criar projeto Next.js + rodar prompts Fase 1 e 2
  ✅ Etapa 8: Colocar arquivos Python nas pastas certas
  ✅ Etapa 9: Criar .env.local com todas as chaves
  ✅ Etapa 10: Push para GitHub
  ✅ Etapa 11: Deploy no Vercel + conectar domínio

DIA 2 (validação — ~1h):
  ✅ Etapa 12: Instalar Python deps + testar health_check.py
  ✅ Etapa 13: Inserir 50 grupos manualmente no Supabase
  ✅ Etapa 14: Rodar fluxo completo (IA → health → publish → validate)
  ✅ Etapa 15: Configurar Task Scheduler

DIA 3+ (crescimento):
  → Google confirma indexação das primeiras páginas (24-72h)
  → A partir do dia 3: 150 grupos novos publicados automaticamente por dia
  → Rodar scraper para popular o banco com mais grupos
