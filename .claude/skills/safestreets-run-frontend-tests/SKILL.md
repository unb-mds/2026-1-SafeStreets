---
name: safestreets-run-frontend-tests
description: Executa testes unitários do frontend do SafeStreets. Use quando solicitado a testar, rodar testes, verificar cobertura ou validar o comportamento de componentes na pasta frontend.
---

# Testes Unitários do Frontend

Os testes ficam em `frontend/__tests__/` e cobrem todos os componentes e utilitários do frontend. Utilizam **Jest 30 + React Testing Library 16** com o transformador `next/jest`.

Cada componente possui ao menos dois casos de teste: um fluxo esperado (happy path) e um caso de borda ou exceção. Os casos de borda incluem arrays vazios, props com tamanho zero, conteúdo com risco de XSS, renderizações duplicadas e verificações de isolamento de DOM.

## Pré-requisitos

Node.js 18+ e npm devem estar disponíveis. As dependências já estão instaladas — nenhuma configuração adicional é necessária.

## Estrutura de diretórios de testes

```
frontend/
  __tests__/
    utils/
      noticias.test.ts        # formato dos dados, unicidade, formato de data, códigos de RA
    components/
      icons.test.tsx          # todos os 8 ícones SVG (tamanho, cor, className, tamanhos extremos)
      Logo.test.tsx           # src da imagem, alt, prop size incluindo size=0
      Footer.test.tsx         # ano do copyright, nome da marca, contagem no DOM
      Hero.test.tsx           # h1, subtítulo, eyebrow, presença de ícone
      NewsCard.test.tsx       # todos os campos de Noticia, XSS-adjacent, título longo, UTF-8
      NewsFeed.test.tsx       # contagem de cards, texto do contador, lista vazia, lista grande
      Header.test.tsx         # aria-label do botão de menu, handler de clique, múltiplos cliques
      Drawer.test.tsx         # estado aberto/fechado, clique no backdrop, rota ativa, link externo
      Chrome.test.tsx         # alternância do drawer, renderização de filhos, filhos nulos
```

## Execução (modo agente)

```powershell
# A partir da raiz do repositório — executa todos os testes uma vez
cd frontend
npx jest --no-coverage

# Com relatório de cobertura
npx jest --coverage

# Modo watch para TDD
npx jest --watch
```

Ou via scripts npm definidos em `frontend/package.json`:

```powershell
cd frontend
npm test               # executa uma vez
npm run test:watch     # modo watch
npm run test:coverage  # relatório de cobertura
```

Saída esperada (133 testes, 10 suites):

```
Test Suites: 10 passed, 10 total
Tests:       133 passed, 133 total
```

## Executar uma suite individual

```powershell
cd frontend
npx jest __tests__/components/NewsCard
npx jest __tests__/utils/noticias
```

## Arquivos de configuração

| Arquivo | Finalidade |
|---|---|
| `frontend/jest.config.ts` | Configuração Jest com suporte ao Next.js (transforms, aliases de caminho, ambiente jsdom) |
| `frontend/jest.setup.ts` | Estende o Jest com os matchers do `@testing-library/jest-dom` |

Pontos-chave da configuração:
- Usa o transformador `next/jest` — trata CSS Modules, `next/image` e `next/link` automaticamente
- Alias `@/` mapeado para `<rootDir>/` para que os imports de componentes sejam resolvidos
- `next/navigation` (`usePathname`) é mockado manualmente em `Drawer.test.tsx` e `Chrome.test.tsx`

## Adicionando novos testes

1. Crie um arquivo em `frontend/__tests__/<categoria>/<NomeDoComponente>.test.tsx`
2. Importe o componente: `import MeuComp from "@/components/MeuComp/MeuComp"`
3. Se o componente usa `usePathname`, adicione no topo do arquivo:
   ```ts
   jest.mock("next/navigation", () => ({ usePathname: jest.fn(() => "/") }));
   ```
4. Escreva ao mínimo: um teste de fluxo esperado e um teste de borda/exceção para cada função exportada ou comportamento renderizado

## Armadilhas conhecidas

- **`toBeInTheDocument` não é uma função**: a opção correta do Jest é `setupFilesAfterEnv` (não `setupFilesAfterFramework`). A configuração já usa o nome correto.
- **Poluição de DOM com múltiplas renderizações**: ao chamar `render()` duas vezes no mesmo teste, use `unmount()` entre elas ou limite as queries com `within(container)`. O `getByText` busca em todo o `document.body`.
- **`usePathname` no Drawer/Chrome**: `next/navigation` deve ser mockado antes do import — `jest.mock(...)` é elevado (hoisted) automaticamente pelo Jest.
- **`next/image` no Logo**: o transformador `next/jest` substitui `next/image` por uma tag `<img>` simples, portanto os atributos `width`/`height` são repassados como strings.
- **Aviso de workspace-root do Next.js**: inofensivo — o Next.js detecta dois lockfiles (raiz + frontend). Os testes passam normalmente mesmo assim.

## Resolução de problemas

| Sintoma | Solução |
|---|---|
| `Cannot find module '@/...'` | Verifique se `moduleNameMapper` em `jest.config.ts` mapeia `^@/(.*)$` para `<rootDir>/$1` |
| `usePathname is not a function` | Adicione `jest.mock('next/navigation', () => ({ usePathname: jest.fn(() => '/') }))` no topo do arquivo de teste |
| `Cannot find module 'next/jest.js'` | Execute `npm install` dentro da pasta `frontend/` |
| Testes passam localmente mas falham no CI | Garanta que `NODE_ENV=test` esteja definido e que a etapa do CI seja executada a partir do diretório `frontend/` |
