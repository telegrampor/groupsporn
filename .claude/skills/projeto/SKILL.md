# nsfw-directory

## Stack
- Next.js 15 App Router + TypeScript
- Supabase via @supabase/ssr
- Tailwind CSS v4
- Vercel (regiões iad1 + lhr1)
- Cloudflare R2

## Skills ativas
- senior-fullstack, senior-frontend, senior-backend
- senior-architect, react-best-practices
- seo-optimizer, frontend-patterns
- architecture-patterns, postgres-patterns

## Regras obrigatórias
- SEMPRE App Router, NUNCA Pages Router
- SEMPRE Server Components para páginas indexáveis
- SEMPRE generateMetadata() em toda página de conteúdo
- SEMPRE generateStaticParams() em app/[slug]/page.tsx
- SEMPRE Schema.org JSON-LD (WebPage + BreadcrumbList + FAQPage)
- NUNCA "Loading..." visível para o Googlebot
- Scripts Python SEMPRE usam scripts/utils/logger.py e db_validator.py
- Grupos só aparecem se indexing_status IN ('published','submitted','indexed')

## Design tokens
- Background: #0d0d0f | Accent: #e8356d | Card: #1a1a1f | Border: #2a2a32