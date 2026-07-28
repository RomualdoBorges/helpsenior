# @helpsenior/web

Aplicação Web do HelpSenior, criada com React, Vite, TypeScript, Tailwind CSS e React Router.

Este app consome os pacotes internos:

```txt
@helpsenior/core
@helpsenior/firebase
```

## Responsabilidades

- renderizar a interface principal;
- controlar rotas autenticadas;
- integrar autenticação Firebase;
- chamar casos de uso do `@helpsenior/core`;
- usar repositórios do `@helpsenior/firebase`;
- aplicar preferências visuais de acessibilidade;
- tratar erros de autenticação e Firestore com mensagens amigáveis.

## Fluxo geral

```txt
Usuário interage com a tela
        ↓
componentes chamam hooks
        ↓
hooks chamam casos de uso do @helpsenior/core
        ↓
casos de uso usam contratos de repositório
        ↓
@helpsenior/firebase implementa os repositórios
        ↓
Firebase Auth / Cloud Firestore
```

## Funcionalidades atuais

### Autenticação

- cadastro com nome completo, e-mail, senha e confirmação de senha;
- login com e-mail e senha;
- logout;
- recuperação de senha por e-mail;
- observação da sessão autenticada;
- criação/atualização de perfil no cadastro;
- exibição do nome do usuário na barra superior;
- mensagens amigáveis de erro e sucesso.

### Atividades

- criar atividades como guias para situações do dia a dia;
- informar título, descrição e etapas;
- listar, buscar, editar e excluir atividades;
- vincular atividades às tarefas;
- persistir atividades no Cloud Firestore.

### Tarefas

- criar tarefas com título;
- adicionar descrição e data opcionais;
- listar tarefas do usuário logado;
- ordenar tarefas;
- filtrar por todas, pendentes, concluídas e com data;
- exibir resumo de pendentes, concluídas e com data;
- editar tarefas pendentes;
- concluir tarefas;
- excluir tarefas com confirmação.

### Lembretes

- criar lembretes com título e data;
- adicionar descrição e horário opcionais;
- configurar recorrência diária, semanal ou mensal;
- configurar data final da recorrência;
- listar e ordenar lembretes;
- filtrar por todos, pendentes, concluídos e recorrentes;
- exibir resumo de vencidos, pendentes, recorrentes e concluídos;
- editar lembretes pendentes;
- concluir lembretes;
- excluir lembretes com confirmação;
- criar automaticamente o próximo lembrete recorrente ao concluir.

### Notificações

- identifica lembretes vencidos;
- exibe alerta visual dentro do app;
- solicita permissão para notificações do navegador;
- envia notificação do navegador com o app aberto;
- verifica lembretes a cada minuto.

Não há Service Worker nem Firebase Cloud Messaging nesta versão.

### Perfil e acessibilidade

- página de perfil com nome, e-mail, telefone e data de nascimento;
- página de configurações com tamanho da fonte, alto contraste, modo simples, redução de animações e espaçamento maior;
- persistência de perfil e preferências no Firestore;
- aplicação das preferências por classes globais no shell da aplicação.

## Rotas

```txt
/               → início
/atividades     → atividades
/tarefas        → tarefas
/lembretes      → lembretes
/perfil         → perfil do usuário
/configuracoes  → preferências de acessibilidade
```

As rotas são configuradas em `src/routes/AppRoutes.tsx`. O provider principal do React Router fica em `src/main.tsx`.

## Estrutura

```txt
apps/web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── e2e/
│   └── auth.e2e.ts
├── src/
│   ├── config/
│   │   └── firebase.ts
│   ├── features/
│   │   ├── activities/
│   │   ├── auth/
│   │   ├── preferences/
│   │   ├── profile/
│   │   ├── reminders/
│   │   └── tasks/
│   ├── pages/
│   │   ├── ActivityPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RemindersPage.tsx
│   │   ├── TaskPage.tsx
│   │   └── SettingsPage.tsx
│   ├── shared/
│   │   └── errors/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── playwright.config.ts
└── vite.config.ts
```

## Firebase

A configuração do Firebase fica em:

```txt
src/config/firebase.ts
```

Esse arquivo lê as variáveis de ambiente do Vite e cria:

```txt
db
auth
authService
```

## Variáveis de ambiente

Crie:

```txt
apps/web/.env
```

Com:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Scripts

```bash
pnpm --filter @helpsenior/web dev
pnpm --filter @helpsenior/web build
pnpm --filter @helpsenior/web lint
pnpm --filter @helpsenior/web test
pnpm --filter @helpsenior/web test:watch
pnpm --filter @helpsenior/web test:integration
pnpm --filter @helpsenior/web test:e2e
pnpm --filter @helpsenior/web test:e2e:ui
pnpm --filter @helpsenior/web typecheck
pnpm --filter @helpsenior/web preview
```

## Testes

O app Web possui três níveis de testes automatizados:

- 76 testes unitários para utilitários, componentes e hooks;
- 11 testes de integração para os fluxos das páginas de atividades, tarefas e lembretes;
- 3 testes E2E com Playwright para a jornada pública de autenticação.

Ao todo, são 87 testes executados pelo Vitest, além dos 3 testes E2E.

Os testes unitários e de integração usam Vitest, React Testing Library e `jsdom`. Os testes E2E executam a aplicação em um navegador Chromium real.

Antes da primeira execução local dos testes E2E, instale o navegador:

```bash
pnpm --filter @helpsenior/web exec playwright install chromium
```

Para executar cada nível:

```bash
pnpm --filter @helpsenior/web test
pnpm --filter @helpsenior/web test:integration
pnpm --filter @helpsenior/web test:e2e
```

Os relatórios do Playwright são gerados em `apps/web/playwright-report`.

## Integração contínua

O workflow `.github/workflows/ci.yml` executa automaticamente:

- lint do workspace;
- typecheck do workspace;
- testes unitários e de integração do Web;
- build do Web;
- instalação do Chromium;
- testes E2E;
- publicação do relatório do Playwright.

O workflow roda em pull requests, pushes para `main` e acionamentos manuais pelo GitHub Actions.

## Estilização

O app usa Tailwind CSS via `@tailwindcss/vite`.

O arquivo `src/index.css` importa o Tailwind e concentra regras globais de acessibilidade, incluindo alto contraste, tamanho de fonte, modo simples, redução de animações e espaçamento maior.

## Limitações atuais

- os testes E2E autenticados ainda não usam Firebase Emulator;
- notificações dependem do app aberto;
- não há Service Worker;
- não há Firebase Cloud Messaging;
- não há login social.
