# Test-Driven Development (TDD)

Um guia completo sobre o que é TDD, como funciona o ciclo Red-Green-Refactor e como aplicá-lo para desenvolver software com mais confiança e menos retrabalho.

## O que é TDD?

TDD (Test-Driven Development), ou Desenvolvimento Guiado por Testes, é uma prática em que você escreve o teste antes de escrever o código que o faz passar. A ideia inverte a ordem intuitiva: em vez de programar a funcionalidade e depois testá-la, você primeiro define o que o código *deveria* fazer na forma de um teste automatizado.

A diferença entre TDD e escrever testes é o momento e a intenção: no TDD o teste é um ato de design, não de verificação posterior. O teste descreve o comportamento esperado antes da implementação existir, e é ele quem guia como o código vai nascer.

**Analogia simples:** escrever o teste primeiro é como definir o critério de aprovação de uma prova antes de estudar. Você sabe exatamente o que precisa ser verdade no final, e cada linha de código escrita tem um objetivo claro: fazer aquele teste passar.

## Por que usar TDD?

| Sem TDD | Com TDD |
| --- | --- |
| Testes escritos depois (ou nunca) | Comportamento definido antes do código |
| "Acho que funciona" | Garantia verificável de que funciona |
| Medo de refatorar | Refatoração segura com rede de proteção |
| Bugs descobertos em produção | Bugs descobertos no momento da escrita |
| Design acoplado e difícil de testar | Design naturalmente modular e testável |

## O ciclo Red-Green-Refactor

O coração do TDD é um ciclo curto e repetitivo de três passos:

### 🔴 RED — Escreva um teste que falha

Escreva um teste para um comportamento que ainda não existe. Ele deve falhar — afinal, o código ainda não foi escrito. Esse passo força você a definir, antes de programar, o que exatamente é o sucesso.

### 🟢 GREEN — Faça o teste passar

Escreva a solução mais simples possível para o teste passar. Sem elegância, sem generalizações prematuras. O objetivo aqui é único: sair do vermelho para o verde o mais rápido possível.

### 🔵 REFACTOR — Limpe o código

Com os testes passando, melhore o código: remova duplicação, melhore nomes, simplifique a estrutura. A segurança vem dos testes — se algo quebrar durante a refatoração, eles avisam imediatamente.

Em seguida, volte ao RED com o próximo comportamento. Os ciclos são curtos, geralmente de minutos.

## Anatomia de um bom teste

Um teste de unidade bem escrito costuma seguir o padrão **AAA — Arrange, Act, Assert**.
Exemplo de guia em typescript:

```typescript
describe('calcularNivelDeRisco', () => {
  it('retorna "alto" quando há 3 ou mais ocorrências na zona', () => {
    // Arrange — prepara os dados de entrada
    const ocorrencias = [criarOcorrencia(), criarOcorrencia(), criarOcorrencia()];

    // Act — executa o comportamento sob teste
    const nivel = calcularNivelDeRisco(ocorrencias);

    // Assert — verifica o resultado esperado
    expect(nivel).toBe('alto');
  });
});
```

Características de um bom teste:

- **Determinístico** — sempre dá o mesmo resultado, sem depender de horário, rede ou ordem de execução.
- **Isolado** — testa uma unidade por vez; dependências externas são simuladas (mocks/stubs).
- **Legível** — o nome do teste descreve o comportamento, não a implementação.
- **Rápido** — roda em milissegundos, para permitir ciclos curtos.

## Os níveis da pirâmide de testes

TDD trabalha principalmente no nível dos testes de unidade, mas vale entender onde cada tipo se encaixa:

| Nível | O que testa | Quantidade | Velocidade |
| --- | --- | --- | --- |
| **Unidade** | Uma função ou componente isolado | Muitos | Muito rápida |
| **Integração** | Vários módulos trabalhando juntos | Alguns | Média |
| **End-to-end (E2E)** | O fluxo completo do usuário | Poucos | Lenta |

A base larga (muitos testes de unidade) é o que torna o TDD viável: testes rápidos permitem o ciclo Red-Green-Refactor sem fricção.

## Como aplicar TDD na prática

1. **Escolha o menor comportamento testável.** Não tente cobrir a feature inteira de uma vez; pegue um caso específico.
2. **Escreva o teste e veja-o falhar (RED).** Confirme que ele falha pelo motivo certo — isso valida que o teste de fato testa algo.
3. **Implemente o mínimo para passar (GREEN).** Resista à tentação de adiantar funcionalidades futuras.
4. **Refatore (REFACTOR).** Melhore o código de produção e os próprios testes, mantendo tudo verde.
5. **Repita.** Adicione o próximo caso de borda como um novo teste e recomece o ciclo.

## TDD com IA

A IA potencializa o TDD quando usada na ordem certa. Em vez de pedir "escreva essa funcionalidade", você usa a IA dentro do ciclo:

**Para gerar os testes a partir de uma spec:**

> "Com base nesta spec [cola a spec da feature], escreva testes de unidade cobrindo todos os critérios de aceite. Não implemente o código ainda."

**Para implementar (passar do RED para o GREEN):**

> "Aqui estão os testes que devem passar [cola os testes]. Implemente a solução mais simples que faça todos passarem, sem adicionar comportamento extra."

**Para refatorar com segurança:**

> "O código abaixo está com os testes passando [cola código e testes]. Sugira refatorações que melhorem a legibilidade mantendo todos os testes verdes."

**Para encontrar casos de borda esquecidos:**

> "Analise esta função e seus testes [cola]. Que casos de borda ainda não estão cobertos?"

> **Atenção:** sempre rode os testes você mesmo. A IA pode gerar um teste que "passa" mas não valida o comportamento real, ou afirmar que algo passa sem ter executado. No TDD, quem decide é o terminal verde, não a IA.

## Erros comuns ao fazer TDD

| Erro | Problema | Correção |
| --- | --- | --- |
| Escrever o código antes do teste | Perde o benefício de design antecipado | Sempre teste primeiro — RED antes de GREEN |
| Testar a implementação, não o comportamento | Testes quebram a cada refatoração | Teste *o que* o código faz, não *como* |
| Pular o passo de refatoração | Código fica bagunçado com o tempo | Refatore a cada ciclo, com os testes como rede |
| Testes lentos ou dependentes de rede | Quebra o ritmo do ciclo curto | Use mocks/stubs e mantenha testes isolados |
| Teste que nunca falhou | Pode estar verificando nada | Veja o teste falhar antes de fazê-lo passar |

## Como organizar os testes no projeto

```
src/
├── components/
│   ├── NewsFeed.tsx
│   └── NewsFeed.test.tsx
├── lib/
│   ├── risco.ts
│   └── risco.test.ts
└── ...
```

**Dica:** mantenha os testes ao lado do código que eles testam (ou em uma pasta `__tests__/` próxima). Isso facilita encontrá-los, mantê-los atualizados e garante que passem pelo mesmo code review e versionamento do código de produção.

## TDD vs outras abordagens

| Abordagem | Quando usar | Limitação |
| --- | --- | --- |
| **TDD** | Quando os comportamentos são bem definidos | Testes não substituem o design de arquitetura |
| **Spec-Driven** | Projetos estruturados, equipes, uso intenso de IA | Exige disciplina para manter specs atualizadas |
| **BDD** | Quando o negócio precisa validar o comportamento | Verbosidade pode atrapalhar em times pequenos |
| **Ad hoc** | Prototipagem rápida, projetos solo | Não escala, gera retrabalho com o tempo |

TDD e Spec-Driven Development se complementam bem: a spec define **o que** construir e os critérios de aceite; o TDD transforma esses critérios em testes que **guiam e garantem** a implementação.

## Tecnologias para o SafeStreets

| Camada | Stack | Ferramentas de teste sugeridas |
| --- | --- | --- |
| Frontend (Next.js / TypeScript) | React | Vitest ou Jest + React Testing Library |
| Backend (FastAPI / Python) | Python | pytest |
| Fluxo E2E (opcional) | App completo | Playwright ou Cypress |

---

> **Origem do TDD:** a prática foi popularizada por Kent Beck como parte da metodologia **Extreme Programming (XP)**, e detalhada em seu livro *Test-Driven Development: By Example* (2002). As ferramentas centrais do TDD são os **testes de unidade**.
