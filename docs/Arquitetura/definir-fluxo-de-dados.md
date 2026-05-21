##  Fluxo de Dados: Proposições (Ingestão e Processamento)

Conforme definido na decisão de arquitetura, o sistema adota um pipeline estruturado de ETL (Extração, Tratamento e Transformação) acoplado a uma IA de classificação.

### O Pipeline de Entrada (Backend e Ingestão)

O FastAPI gerencia o ciclo de vida da ingestão de dados em segundo plano, utilizando `BackgroundTasks` ou tarefas agendadas para não bloquear as requisições dos usuários.

```
[API Câmara dos Deputados]
           │
           ▼ (HTTPX / Requests Assíncronos)
[Camada de Ingestão (Python)] ──► Validação Inicial (Pydantic)
           │
           ▼
[Pipeline de Processamento (ETL)] ──► Normalização (Tipo, Data, Tema)
           │
           ▼
[Módulo de Inteligência Artificial] ──► Classificação Temática Fina (ex: "Proteção de Crianças")
           │
           ▼
[Camada de Persistência] ──► Banco de Dados Relacional (Dados Estruturados + JSON Original)
```

#### Passo a Passo do Fluxo de Ingestão:

1. **Extração Otimizada (Proxy de Mudança):** O backend consulta periodicamente o endpoint `listarProposicoesTramitadasNoPeriodo` utilizando um intervalo baseado no timestamp da *última verificação bem-sucedida*.
2. **Enriquecimento:** Para cada ID de proposição modificado, o sistema realiza uma chamada assíncrona para `ObterProposicaoPorID`.
3. **Tratamento e Validação (Pydantic):** O JSON bruto é parseado por um Schema do Pydantic. Os dados são limpos e normalizados (conversão de strings de data para objetos `datetime`, padronização de siglas como PL, PEC).
4. **Classificação por IA:** O texto da proposição (ementa/explicação) é enviado para um modelo de classificação (LLM ou classificador NLP em Python) que categoriza o projeto em temas específicos e refinados.
5. **Persistência Dupla:** O dado tratado é salvo de forma estruturada nas tabelas relacionais, e o JSON original é armazenado em uma coluna do tipo `JSONB` (ou equivalente) para fins de auditoria e reprocessamento futuro.

---

### O Pipeline de Saída (Do Banco à Tela do Usuário)

O consumo de dados é otimizado para que o Next.js exiba dashboards e filtros instantâneos.

| Etapa | Responsável | Descrição Técnica |
| :--- | :--- | :--- |
| **1. Disparo** | Frontend (Next.js) | O usuário interage com os filtros do dashboard (ex: Ano ou Tema). O Next.js dispara uma requisição HTTP `GET` tipada em TypeScript para o backend: `/api/v1/proposicoes?tema=infancia&ano=2026`. |
| **2. Recepção** | Backend (FastAPI) | O FastAPI recebe os parâmetros da query string. O **Pydantic** valida os tipos de dados em tempo de execução. Se os parâmetros forem válidos, a requisição é repassada para a camada de serviço. |
| **3. Consulta** | Banco (SQLAlchemy) | A camada de negócio executa uma query SQL otimizada no banco relacional. Como os dados já foram normalizados e indexados no momento da ingestão, o banco responde de forma ágil, agregando os dados para os gráficos. |
| **4. Resposta** | Backend (FastAPI) | O backend converte o resultado do banco para um schema de saída (`ProposicaoResponse`), mascarando dados desnecessários e garantindo um JSON limpo de resposta. |
| **5. Exibição** | Frontend (Next.js) | O Next.js recebe o JSON. O **TypeScript** garante a integridade da tipagem da resposta. Os dados populam os componentes JSX, e os gráficos e listas são estilizados via **CSS**. |

---

## Dados dos Usuários (Modelo Relacional)

Conforme a conclusão do estudo, o sistema rejeita o armazenamento de listas brutas dentro do objeto do usuário e adota o modelo puramente relacional. Isso garante integridade referencial, consultas rápidas através de *JOINs* e facilidade de indexação.

### Modelagem de Dados no Backend (FastAPI + Pydantic/ORM)

As relações entre os usuários e as propriedades/proposições são mapeadas por tabelas associativas clássicas, estruturadas através de entidades do ORM em Python.

```
   [users] 1 ──── 0..* [favoritos] 0..* ──── 1 [proposicoes]
      │                     │                       │
      │ 1                   │                       │ 1
      ├──────── 0..* [historico] 0..* ──────────────┤
      │                                             │
      └──────── 0..* [notificacoes] 0..* ───────────┘
```

#### Detalhes das Interações de Fluxo:

* **Adicionar aos Favoritos:** O Next.js envia um `POST /api/v1/favoritos` contendo `{ "proposicao_id": 123 }`. O FastAPI intercepta, valida o token do usuário (Autenticação), e insere um registro simples na tabela `favoritos` mapeando `user_id` e `proposicao_id`.
* **Geração de Histórico:** Toda vez que um usuário abre os detalhes de uma proposição no Next.js, uma requisição em segundo plano é enviada para registrar o acesso na tabela `historico`, permitindo futuras análises de relevância e recomendação.
* **Disparo de Notificações:** Quando o Job de Ingestão de Proposições detecta uma nova tramitação, a camada de negócio verifica na tabela `favoritos` quais usuários assinam aquela proposição e insere registros em massa na tabela `notificacoes`.

---

##  Benefícios Arquiteturais da Stack Selecionada

1. **Casamento de Tipos (Pydantic ──► TypeScript):** A definição das tabelas de Proposições e Usuários no FastAPI pode ser exportada automaticamente como documentação OpenAPI. O time de Frontend pode gerar as interfaces TypeScript a partir do Schema do backend, zerando erros de digitação de propriedades no JSX.
2. **Performance em Dashboards:** Com as tabelas de `proposicoes` e `favoritos` estruturadas e indexadas no modelo relacional, operações como "contar quantas pessoas favoritaram a proposição X por ano" tornam-se operações nativas e extremamente rápidas no banco de dados.
3. **Modularidade para Evolução Futura:** Se no futuro o time decidir evoluir para uma abordagem híbrida (adicionar cache com Redis), a Camada de Aplicação do FastAPI está totalmente isolada, bastando interceptar as chamadas de banco na camada de serviço, sem necessidade de alterar uma única linha de código do Frontend Next.js.
