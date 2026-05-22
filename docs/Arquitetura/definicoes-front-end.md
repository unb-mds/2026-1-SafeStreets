#  Stack Front-end – SafeStreets

Este documento define as tecnologias utilizadas no desenvolvimento do front-end do **SafeStreets**, bem como as justificativas para cada escolha. O foco é garantir um sistema **moderno, escalável e de fácil manutenção**, sem adicionar complexidade desnecessária.

---

##  Framework Principal: Next.js

**Definição:**
Framework baseado em React que oferece estrutura pronta para aplicações web modernas.

**Por que utilizar:**

* Renderização otimizada (SSR e SSG)
* Melhor performance e SEO
* Estrutura de projeto organizada
* Suporte nativo a rotas
* Otimizações automáticas (imagens, carregamento)

---

##  Linguagem: TypeScript + JSX

**Definição:**
O projeto utiliza TypeScript para lógica e tipagem, juntamente com JSX, uma sintaxe que permite escrever estruturas semelhantes a HTML diretamente no código.

**Por que utilizar:**

* Redução de erros em tempo de desenvolvimento
* Melhor organização do código
* Facilita manutenção e escalabilidade
* Integração direta com Next.js
* Permite construir interfaces de forma declarativa usando JSX

---

##  Estilização: CSS 

**Definição:**
Uso de CSS tradicional com escopo local através de CSS Modules (suportado nativamente pelo Next.js).

**Por que utilizar:**

* Escopo local evita conflitos de classes
* Código mais organizado e previsível
* Fácil manutenção e refatoração
* Sem dependência de frameworks de estilo

---

##  Boas Práticas Utilizadas

* Componentização da interface
* Separação de responsabilidades
* Código limpo e reutilizável
* Tratamento de erros e feedback visual

---

Links relacionados: 

https://www.youtube.com/watch?v=fX5WCe3d8WU

https://www.youtube.com/watch?v=QsSUbuYeEFk

https://www.youtube.com/watch?v=sW-yibnl1tQ
