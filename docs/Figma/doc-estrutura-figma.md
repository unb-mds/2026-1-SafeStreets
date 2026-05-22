# 🏷️ Entregável Estrutura
Adicionar o entregável "Documento de Estrutura" do campo de Estrutura do Figma à documentação do projeto

---

## 🚀 Objetivo
Disponibilizar o Documento de Estrutura do SafeStreets na documentação oficial do projeto. O objetivo é registrar de forma clara como o conteúdo e as funcionalidades do produto estão organizados, por meio dos diagramas de Arquitetura da Informação, Site Map e User Flow, servindo como referência para a etapa de criação dos wireframes.

## 📋 Descrição
Esta issue consiste em acrescentar o Documento de Estrutura à documentação do repositório.

O documento deve conter:
- **Arquitetura da Informação**: cómo o conteúdo é organizado e agrupado
- **Site Map**: hierarquia de navegação entre as páginas, partindo da Página Inicial.
- **User Flow**: fluxograma do caminho percorrido pelo usuário, desde a entrada no site até a saída, incluindo os pontos de decisão.

Tarefas envolvidas:
- [ ] Publicar/atualizar o conteúdo como issue no github
- [ ] Revisar a formatação e a consistência com os demais entregáveis (Documento de Estratégia e Feature List)

## 👥 Responsáveis
- Autor: @jorgevasquez25 
- Revisor: @ArthurFeitosa05 @EdsonToppzera @IsraelSoares-25 @Nic0laslc  @matheusqsa

## 🎯 Prioridade
Marque uma caixinha de acordo com seu nível de importância
- [ ] 🔴 Alta
- [x] 🟡 Média
- [ ] 🟢 Baixa

## 📌 Definition of Ready (DoR)
---
- [x] Os diagramas de Arquitetura da Informação, Site Map e User Flow foram concluídos no Figma
- [x] Os responsáveis pela tarefa estão definidos
- [x] A issue possui descrição clara e objetivo bem definido

## 📌 Definition of Done (DoD)
---
- [ ] O documento contém os três entregáveis: Arquitetura da Informação, Site Map e User Flow
- [ ] O conteúdo foi revisado e aprovado pelos revisores
- [ ] A formatação está consistente com os demais entregáveis do projeto
- [ ] A issue foi vinculada ao board (kanban) e está movida para a coluna correspondente

## 🔧 Tecnologias Utilizadas
- GitHub
- Figma 

# 📙 Documento de Estrutura — SafeStreets

---

## 🎯 Objetivo do Documento

Este documento define como o sistema irá se comportar em resposta aos usuários e como o conteúdo será organizado. Para isso, consolida três entregáveis que estruturam as funcionalidades e os conteúdos do SafeStreets em diagramas:

1. **Arquitetura da Informação**
2. **Site Map**
3. **User Flow**

---

## Arquitetura da Informação

<img width="340" height="225" alt="Image" src="https://github.com/user-attachments/assets/2fcf0b1f-9b40-40cf-94ef-27744c3fe154" />


## Site Map

<img width="350" height="200" alt="Image" src="https://github.com/user-attachments/assets/a5a354b1-dfa4-4afc-82e8-59e60ecf59a9" />

## User flow

1. O usuário entra no site e chega à página inicial de notícias.
2. A partir da lista de notícias, ele pode: navegar pelas categorias via menu, revisar as notícias ou usar a busca.
3. O usuário pode acessar o mapa interativo, visualizar regiões e clicar em PINs.
4. Ao aplicar filtros (período/região), o sistema verifica se há resultados.
5. Sem resultados: o sistema exibe a mensagem "nenhum resultado encontrado".
6. Com resultados: o usuário visualiza a notícia, vê os detalhes com o card resumo gerado por IA e consulta os indicadores de risco da região.
7. Por fim, o usuário decide continuar a busca (retornando ao início) ou sair do site.

**Link do figma:** https://www.figma.com/board/13SnyvGleeaYsubnOhMeYk/Template-MDS-Squad-1?node-id=4002-5823&t=3f4EctTN6w3QvHsd-1
