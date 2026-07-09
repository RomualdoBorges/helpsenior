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
/               → tarefas
/lembretes      → lembretes
/perfil         → perfil do usuário
/configuracoes  → preferências de acessibilidade
```

As rotas são configuradas em `src/App.tsx`. O provider principal do React Router fica em `src/main.tsx`.

## Estrutura

```txt
apps/web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── config/
│   │   └── firebase.ts
│   ├── features/
│   │   ├── auth/
│   │   ├── preferences/
│   │   ├── profile/
│   │   ├── reminders/
│   │   └── tasks/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RemindersPage.tsx
│   │   └── SettingsPage.tsx
│   ├── shared/
│   │   └── errors/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
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
pnpm --filter @helpsenior/web typecheck
pnpm --filter @helpsenior/web preview
```

## Estilização

O app usa Tailwind CSS via `@tailwindcss/vite`.

O arquivo `src/index.css` importa o Tailwind e concentra regras globais de acessibilidade, incluindo alto contraste, tamanho de fonte, modo simples, redução de animações e espaçamento maior.

## Limitações atuais

- não há testes automatizados específicos no app Web;
- notificações dependem do app aberto;
- não há Service Worker;
- não há Firebase Cloud Messaging;
- não há login social.
