# Git e GitHub

## Visão geral

<aside>
💡

**Git**: ferramenta de controle de versão (histórico do código).

**GitHub**: plataforma online para hospedar repositórios e colaborar.

</aside>

---

## Fluxo rápido (o que você faz na prática)

1. Inicializa ou clona o repositório
2. Confere o estado dos arquivos
3. Adiciona mudanças
4. Faz commit
5. Envia para o GitHub (push)
6. Atualiza seu código (pull)

---

# Comandos básicos do Git 🔸

<aside>
🧠

Regra de ouro: você repete muito o ciclo **status → add → commit**.

</aside>

## 1) Inicializar um repositório

```bash
git init
```

## 2) Clonar um repositório existente

```bash
git clone Meu_Projeto_Url
```

## 3) Ver o estado dos arquivos (o que mudou)

```bash
git status
```

## 4) Adicionar arquivo(s) para commit (stage)

- Adicionar um arquivo específico:

```bash
git add preco.c
```

## 5) Criar um commit (salvar um “ponto” no histórico)

```bash
git commit -m "adicionando função"
```

---

# Comandos para GitHub 🔹

<aside>
🌐

Esses comandos conectam seu repositório local a um remoto (GitHub) e sincronizam as mudanças.

</aside>

## Conectar ao repositório remoto principal

```bash
git remote add origin URL_DO_REPOSITORIO
```

## Enviar código para o GitHub (push)

```bash
git push origin main
```

## Atualizar seu código com o remoto (pull)

```bash
git pull
```

---

# Comandos para Branch 🍀

<aside>
🌿

**Branch** = uma “linha paralela” do código (para desenvolver sem quebrar a main).

</aside>

## Criar uma branch

```bash
git branch nome_da_branch
```

## Trocar de branch

```bash
git checkout nome_da_branch
```

## Criar e já mudar para a branch

```bash
git checkout -b nova_branch
```

## Ver branches existentes

```bash
git branch
```

## Juntar branches (merge)

(Execute estando na branch que vai receber as mudanças, geralmente `main`.)

```bash
git merge nome_da_branch
```

## Ver histórico de commits

```bash
git log
```

## Enviar uma branch para o repositório remoto

```bash
git push origin sua_branch
```

## Atualizar sua branch local com a main remota

```bash
git pull origin main
```

---

## Mini-resumo (cola)

- Ver mudanças: `git status`
- Preparar para commit: `git add ...`
- Salvar no histórico: `git commit -m "..."`
- Enviar para o GitHub: `git push origin main`
- Baixar atualizações: `git pull`