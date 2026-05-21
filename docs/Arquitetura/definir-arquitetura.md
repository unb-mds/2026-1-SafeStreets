# Avaliando cada Arquitetura

# Arquitetura Monolítica

A mais tradicional.
Todo o sistema fica em uma única aplicação.

---

## Estrutura

```
app/
├── routes/
├── services/
├── database/
├── models/
└── main.py
```

---

## Como funciona

Tudo roda junto:

- API
- regras
- banco
- autenticação

em um único projeto.

---

## Exemplo prático

## Sistema de denúncias

```
POST /reports
```

Fluxo:

```
Route → Service → Banco
```

Tudo dentro da mesma aplicação.

---

## Vantagens

- simples
- rápido de começar
- fácil para projetos pequenos

---

## Desvantagens

- cresce desorganizado
- difícil escalar
- manutenção complexa

---

# Arquitetura em Camadas (Layered Architecture)

A MAIS usada em APIs.
Separação por responsabilidades.

---

# Estrutura

```
app/
├── controllers/
├── services/
├── repositories/
├── models/
└── database/
```

---

# Camadas

## Controller

Recebe requisições HTTP.

## Service

Regra de negócio.

## Repository

Acesso ao banco.

---

# Exemplo prático

## Criar denúncia

```
POST /reports
```

Fluxo:

```
Controller
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL
```

---

# Vantagens

- organizada
- fácil manutenção
- muito usada no mercado

---

# Desvantagens

- pode crescer demais
- algumas responsabilidades podem misturar

---

# Arquitetura Modular

Muito usada junto com FastAPI e NestJS.
Sistema dividido por funcionalidades.

---

# Estrutura

```
modules/
├── users/
├── reports/
├── ai/
└── notifications/
```

---

# Exemplo prático

## Módulo AI

```
ai/
├── routes/
├── services/
├── models/
└── schemas/
```

---

# Cada módulo possui:

- rotas
- regras
- banco
- validações

próprias.

---

# Vantagens

- ótima organização
- trabalho em equipe facilitado
- fácil escalar

---

# Desvantagens

- exige padronização

---

# MVC (Model View Controller)

Muito usado em aplicações web tradicionais.

---

# Estrutura

```
app/
├── models/
├── views/
└── controllers/
```

---

# Componentes

## Model

Dados.

## View

Interface.

## Controller

Controle das requisições.

---

# Exemplo prático

```
Usuário → Controller → Model → View
```

---

# Vantagens

- simples
- organizado

---

# Desvantagens

- menos flexível para APIs modernas

---

# Arquiteturas Mais Usadas Hoje

| Arquitetura | Mercado | Complexidade | Escalabilidade |
| --- | --- | --- | --- |
| Monolítica | Muito usada | Baixa | Média |
| Em Camadas | MUITO usada | Média | Alta |
| Modular | MUITO usada | Média | Alta |
| Clean Architecture | Crescendo muito | Alta | Muito alta |
| Microsserviços | Grandes empresas | Muito alta | Extremamente alta |
| MVC | Tradicional | Média | Média |

## Links de Estudos baseados:

- https://youtu.be/wEUwn-WFhKM?si=FRUVi-UAPfWYJnX6
- https://youtu.be/kYx1QC1XZSo?si=kRVvHXSXSNrFN9J-
- https://youtu.be/FWeHPCqD67c?si=YzxrprBWM4AMcHPd

# Conclusões

O Projeto em conjunto da equipe decidimos que será feito em **Arquitetura em Camadas** 

Garantindo:

- Fácil Manutenção
- Organizado em Responsabilidades
