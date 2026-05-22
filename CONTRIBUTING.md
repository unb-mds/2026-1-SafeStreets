# Contribuindo para o SafeStreets

Obrigado por considerar contribuir para o **SafeStreets — Monitor de Segurança Urbana**! Suas contribuições são essenciais para evoluirmos o monitoramento inteligente de riscos urbanos e tornar as cidades mais seguras. Este documento explica como você pode participar de maneira simples e eficaz.

---

## 📋 Como posso contribuir?

### 🐛 Relatar problemas ou bugs

Encontrou um bug? Ajude-nos a corrigi-lo!

**Antes de abrir um novo issue:**
1. Verifique se o problema já foi relatado nos [issues abertos](https://github.com/unb-mds/2026-1-SafeStreets/issues)

**Se for um novo bug:**
1. Abra um novo issue clicando em "New Issue"
2. Selecione o template adequado (se disponível) ou descreva o problema livremente
3. Preencha as seguintes informações:
   - **Descrição completa do problema:** Contextualize o bug e explique por que é importante corrigi-lo
   - **Como reproduzir:** Passos para reproduzir o comportamento inesperado
   - **Comportamento esperado vs. atual:** O que deveria acontecer e o que acontece de fato
   - **Responsáveis:** Defina quem será responsável pela issue, pela correção e quem será o revisor
   - **Prioridade:** Indique se é um bug urgente ou não
   - **Tarefas:** Liste as ações necessárias para corrigir o problema
   - **Definições de Pronto e Feito:** Estabeleça os critérios de conclusão

---

### 💡 Sugerir melhorias

Tem uma ideia para melhorar o projeto? Adoraríamos ouvir!

**Antes de sugerir:**
1. Verifique se a melhoria já foi discutida nos [issues abertos](https://github.com/unb-mds/2026-1-SafeStreets/issues)

**Se for uma nova sugestão:**
1. Abra um novo issue clicando em "New Issue"
2. Preencha as seguintes informações:
   - **Descrição completa da melhoria:** Contextualize a sugestão, explique sua importância e o que ela resolve
   - **Área impactada:** Coleta de dados, classificação de ocorrências, geração de métricas, API, visualizações, etc.
   - **Responsáveis:** Defina quem será responsável pela implementação e quem será o revisor
   - **Prioridade:** Indique se é uma melhoria imprescindível ou não
   - **Tarefas:** Liste as ações necessárias para implementar a melhoria
   - **Definições de Pronto e Feito:** Estabeleça os critérios de conclusão
   - **Resultado esperado:** Descreva o comportamento ou saída após a implementação

---

## 💻 Contribuir com código

Se você deseja contribuir com código, siga estas etapas:

### 1. Fork o repositório
Clique em "Fork" no topo da página do GitHub para criar uma cópia do repositório em sua conta.

### 2. Clone o repositório
```sh
git clone https://github.com/seu-usuario/2026-1-SafeStreets.git
```

### 3. Configure o ambiente de desenvolvimento
O projeto utiliza **Python**. Recomendamos o uso de um ambiente virtual:
```sh
cd 2026-1-SafeStreets
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 4. Crie uma branch para sua alteração
Use nomes descritivos que reflitam a mudança proposta:
```sh
git checkout -b feat/classificacao-ocorrencias
# ou
git checkout -b fix/correcao-coleta-noticias
```

### 5. Faça as alterações necessárias
Implemente as mudanças desejadas no código, seguindo os [padrões de codificação](#-padrões-de-codificação) abaixo.

### 6. Adicione commits seguindo nosso padrão
Utilize mensagens de commit claras e descritivas no padrão [Conventional Commits](https://www.conventionalcommits.org/):
```sh
git commit -m "feat: adiciona classificação automática de tipo de crime por NLP"
git commit -m "fix: corrige extração de localização em notícias sem geotag"
git commit -m "docs: atualiza README com instruções de instalação do backend"
```

**Tipos de commit mais comuns:**
| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações na documentação |
| `test` | Adição ou correção de testes |
| `refactor` | Refatoração de código sem mudança de comportamento |
| `chore` | Tarefas de manutenção (dependências, configs, etc.) |

### 7. Envie as alterações para seu fork
```sh
git push origin feat/classificacao-ocorrencias
```

### 8. Abra um Pull Request
Clique em "New Pull Request" e descreva suas alterações detalhadamente, incluindo:
- O que foi alterado e por quê
- Como testar as mudanças
- Screenshots ou exemplos de saída, se aplicável

---

## 📝 Padrões de Codificação

Para manter a qualidade do código Python do SafeStreets, siga estas diretrizes:

- **PEP 8:** Siga o guia de estilo oficial do Python
- **Tipagem:** Utilize type hints sempre que possível (`def processar(texto: str) -> dict:`)
- **Docstrings:** Documente funções e módulos seguindo o padrão Google ou NumPy
- **Comentários:** Comente trechos de lógica complexa (coleta de dados, modelos de IA, parsing)
- **Nomenclatura:** Use `snake_case` para variáveis e funções, `PascalCase` para classes
- **Testes:** Escreva testes para todas as funcionalidades criadas — unitários, de integração e, quando possível, automatizados — para garantir que funcionalidades existentes não sejam quebradas

---

## 🧪 Executando os testes

Antes de abrir um Pull Request, certifique-se de que todos os testes passam:

```sh
# Com o ambiente virtual ativo
pytest backend/tests/
```

---

## 📚 Documentação

A documentação do projeto está localizada na pasta `Docs`. Se sua alteração afetar o comportamento do sistema, as APIs geradas, os modelos de classificação ou qualquer fluxo existente, lembre-se de atualizar a documentação correspondente.

---

## 🗂️ Estrutura do Projeto

```
2026-1-SafeStreets/
├── backend/        # Código Python: coleta, classificação, métricas e API
├── Docs/           # Documentação do projeto
├── LICENSE
└── README.md
```

---

## 💬 Precisa de ajuda?

Se você tem perguntas ou precisa de suporte, sinta-se à vontade para abrir um [issue](https://github.com/unb-mds/2026-1-SafeStreets/issues) ou entrar em contato com a equipe de desenvolvimento.

---

## 📜 Código de Conduta

Ao contribuir para o SafeStreets, espera-se que todos os participantes mantenham um ambiente respeitoso, inclusivo e colaborativo. Comportamentos abusivos, discriminatórios ou desrespeitosos não serão tolerados.

---

## 🙏 Agradecimentos

Agradecemos a todos os colaboradores e a quem considera contribuir para o **SafeStreets**. Juntos, podemos transformar dados em informação útil e contribuir para cidades mais seguras! 🛡️
