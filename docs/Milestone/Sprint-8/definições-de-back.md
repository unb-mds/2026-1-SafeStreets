# 📄 Definição Oficial da Stack Back-end — SafeStreets

## 📌 Objetivo
Este documento tem como finalidade formalizar a escolha da stack de desenvolvimento back-end do projeto SafeStreets, justificando tecnicamente as tecnologias selecionadas para atender aos requisitos funcionais, arquiteturais e de inteligência artificial presentes no sistema.

---

# 🚀 Stack Back-end Definida

## 🔹 Linguagem Principal
- Python

## 🔹 Framework Back-end
- FastAPI

## 🔹 Banco de Dados
- PostgreSQL

## 🔹 ORM
- SQLAlchemy

## 🔹 Documentação da API
- Swagger / OpenAPI

## 🔹 Containerização
- Docker

---

# 🧠 Justificativa da Escolha do FastAPI

A equipe definiu a utilização do FastAPI como framework principal do back-end devido às necessidades técnicas do SafeStreets, especialmente relacionadas às funcionalidades envolvendo Inteligência Artificial, classificação de dados e geração de resumos automáticos.

O FastAPI apresenta vantagens significativas para projetos modernos orientados a APIs REST e integração com modelos de IA.

---

# ✅ Motivos da Escolha

## 1. Excelente integração com Inteligência Artificial

O ecossistema Python é atualmente o principal ambiente para desenvolvimento de soluções de IA e Machine Learning.

O FastAPI permite integração direta com bibliotecas como:

- Transformers
- Scikit-learn
- TensorFlow
- PyTorch
- spaCy
- OpenAI SDK

Isso facilita a implementação de:
- classificação automática
- análise textual
- sumarização
- processamento de linguagem natural (NLP)

---

## 2. Alta Performance

O FastAPI possui alta performance graças ao uso do ASGI e Starlette, sendo comparável a frameworks modernos desenvolvidos em outras linguagens.

Isso garante:
- maior velocidade de resposta
- melhor concorrência
- eficiência em APIs modernas

---

## 3. Documentação Automática

O framework gera automaticamente documentação interativa utilizando:
- Swagger UI
- OpenAPI

Isso facilita:
- testes da API
- manutenção
- integração entre front-end e back-end
- entendimento das rotas pela equipe

---

## 4. Arquitetura Moderna

O FastAPI incentiva boas práticas de:
- modularização
- tipagem forte
- separação de responsabilidades
- organização de código

Facilitando:
- manutenção
- escalabilidade
- trabalho em equipe
- evolução do sistema

---

## 5. Facilidade de Desenvolvimento

A sintaxe do Python combinada com o FastAPI permite:
- desenvolvimento rápido
- menor complexidade
- maior produtividade da equipe

Isso é especialmente importante em projetos acadêmicos e colaborativos.
