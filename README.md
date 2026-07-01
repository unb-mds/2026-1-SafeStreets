# 2026-1-SafeStreets
<div img="center">

<img src="https://unb-mds.github.io/2026-1-SafeStreets/imagens/logo-escudo.PNG" width="120" alt="SafeStreets Logo"/>

## 🛡️ SafeStreets — Monitor de Segurança Urbana
link
--

O SafeStreets é uma aplicação voltada ao monitoramento inteligente de riscos urbanos a partir da análise de notícias e dados públicos de segurança. O projeto tem como objetivo fornecer uma visão clara e atualizada sobre ocorrências criminais em diferentes regiões, contribuindo para a conscientização e prevenção.

A proposta combina coleta de dados em tempo real com técnicas de inteligência artificial para identificar o conteúdo relevante e estimar sua localização aproximada. Com isso, o sistema gera indicadores que permitem acompanhar a evolução da criminalidade em bairros e cidades.

## 📊Tecnologias 
<p align="left">
  <img src="https://img.shields.io/badge/PYTHON-BACKEND-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FASTAPI-BACKEND-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/POSTGRESQL-DATABASE-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/REACT-FRONTEND-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-FRONTEND-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/DOCKER-CONTAINERIZED-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

## 📁 Estrutura do Projeto

```text
├── .claude/               # Configurações, prompts ou contextos locais do Claude AI
├── .github/
│   └── workflows/         # Arquivos de configuração de CI/CD
├── backend/               # Código-fonte da API e regras de negócio
├── docs/                  # Documentação adicional, diagramas ou especificações
└── frontend/              # Interface do usuário e aplicação cliente
...
```
## 🎨 Desing e Prototipação
O projeto possui:

* Wireframes
* Protótipos de baixa fidelidade
* Protótipos de alta fidelidade
* Planejamento visual no Figma

## Metodologia

* Kanban
* Sprints
* Story Mapping
* Templates de Issues e Pull Requests

## Como Executar o Projeto

* Python 3.11+
* PostgreSQL
* Docker (Opcional)

## 🔹 Clonando o repositório
```text
git clone https://github.com/unb-mds/2026-1-SafeStreets.git
```
## 🔹 Back-end
```text
cd backend

python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```
## 🌐 Mkdocs

https://unb-mds.github.io/2026-1-SafeStreets/

## 🔍 Principais funcionalidades
* Coleta de notícias e dados de segurança pública
* Classificação de risco automática de ocorrências
* Identificação de localização aproximada dos eventos
* Resumo automático das ocorrencias

## 🎯 Objetivo

Auxiliar na compreensão do cenário de segurança urbana, promovendo acesso a informações relevantes e apoiando decisões mais conscientes no dia a dia.

## 🧩Principais Links: 

* 🗺️[Story Map](https://www.figma.com/board/13SnyvGleeaYsubnOhMeYk/Template-MDS-Squad-1?t=RpJETIb0Vk6BLL3d-0)
* 🎨[Protótipo de Alta Fidelidade](https://www.figma.com/design/PnCiIkDZprkfS66k8bdyCq/Wireframe?node-id=0-1&t=1NT6dQNROoeGOVYk-1)
* 🏗️[Arquitetura](https://github.com/unb-mds/2026-1-SafeStreets/tree/main/docs/Arquitetura)

## 👥 Equipe
Squad 01 MDS-01/2026
<table>
  <tr>
    <td align="center">
      <a href="LINK_DO_GITHUB_1">
        <img src="https://github.com/unb-mds/2026-1-SafeStreets/blob/main/docs/imagens/foto-arthur.jpeg" width="150px;" alt="Arthur Feitosa"/><br>
        <sub><b>Arthur Feitosa</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="LINK_DO_GITHUB_2">
        <img src="https://github.com/unb-mds/2026-1-SafeStreets/blob/main/docs/imagens/foto-edson.jpeg" width="150px;" alt="Edson Gabriel"/><br>
        <sub><b>Edson Gabriel</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="LINK_DO_GITHUB_3">
        <img src="https://github.com/unb-mds/2026-1-SafeStreets/blob/main/docs/imagens/foto-israel.jpeg" width="150px;" alt="Israel Soarez"/><br>
        <sub><b>Israel Soarez</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="LINK_DO_GITHUB_4">
        <img src="https://github.com/unb-mds/2026-1-SafeStreets/blob/main/docs/imagens/foto-jorge.jpeg" width="150px;" alt="Jorge"/><br>
        <sub><b>Jorge</b></sub>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="LINK_DO_GITHUB_5">
        <img src="https://github.com/unb-mds/2026-1-SafeStreets/blob/main/docs/imagens/foto-queiroz.jpeg" width="150px;" alt="Matheus Queiroz"/><br>
        <sub><b>Matheus Queiroz</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="LINK_DO_GITHUB_6">
        <img src="https://github.com/unb-mds/2026-1-SafeStreets/blob/main/docs/imagens/nicolas%20foto.jpg" width="150px;" alt="Nicolas Lopes"/><br>
        <sub><b>Nicolas Lopes</b></sub>
      </a>
    </td>
  </tr>
</table>
