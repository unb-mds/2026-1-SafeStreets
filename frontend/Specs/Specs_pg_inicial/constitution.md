# Constituição do Projeto — SafeStreets

> Princípios não-negociáveis. Toda spec, plano e tarefa deve respeitar este documento.
> O agente (Claude Code) deve consultar este arquivo antes de qualquer implementação.

## Visão do produto
SafeStreets é uma aplicação de monitoramento inteligente de riscos urbanos no DF,
que transforma notícias e dados públicos de segurança em informação útil para o cidadão.

## Princípios de desenvolvimento

1. **Aderência estrita ao protótipo.** Componentes visuais (header, cards, menu, modais)
   devem seguir o protótipo de alta fidelidade do Figma. Quando houver dúvida de layout,
   o protótipo é a fonte da verdade — não improvisar.

2. **Paleta de cores fixa.** Apenas estas cores como base do tema:
   - Verde principal: `#016d01`
   - Amarelo (destaque): `#f8c311`
   - Branco: `#ffffff`
   Tons auxiliares (cinzas de fundo/texto) são permitidos, mas a identidade vem dessas três.

3. **Componentização.** Toda parte reutilizável da interface é um componente isolado
   com responsabilidade única. Nada de páginas monolíticas.

4. **Estilização com CSS Modules.** CSS tradicional com escopo local (suporte nativo do Next.js).
   Proibido adicionar frameworks de CSS (Tailwind, Bootstrap, etc.) sem justificativa no PLAN.

5. **TypeScript sempre.** Toda lógica tipada. Sem `any` implícito.

6. **Desktop-first (por enquanto).** A interface é otimizada para Desktop/Web,
   conforme as telas do protótipo. Responsividade mobile não é prioridade nesta fase.

7. **Separação de camadas.** O frontend nunca acessa fontes de dados diretamente:
   consome dados via uma camada de dados isolada. Hoje essa camada são mocks estáticos;
   amanhã será uma API REST. A troca não deve quebrar os componentes.

8. **Segurança de segredos.** Nenhuma chave de API ou credencial no código do frontend.

## Convenções de código
- Idioma do código: nomes de componentes e tipos em inglês ou português, mas **consistentes**.
- Estrutura de pastas: o código do frontend vive em `components/` (componentes
  reutilizáveis, com `.module.css` ao lado), `view/` (telas montadas a partir dos
  componentes), `style/` (tokens/estilos globais) e `utils/` (camada de dados mockados
  e funções utilitárias). As pastas `app/` (App Router) e `public/` são exigidas pelo
  Next.js: `app/` é mantida como camada fina de roteamento, apenas repassando para as `view/`.
- Cada commit referencia o ID do requisito ou da tarefa (ex: `feat(RF01): feed de notícias`).
- Realizar pelo menos um commit no momento da criação de um novo arquivo.