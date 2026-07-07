# HelpSenior

HelpSenior é uma aplicação Web focada em acessibilidade para pessoas idosas, criada para organizar tarefas, lembretes, perfil e preferências visuais de forma simples, clara e previsível.

O projeto foi desenvolvido em formato de monorepo com separação entre domínio, infraestrutura Firebase e aplicação Web.

## Objetivo

O objetivo do HelpSenior é ajudar pessoas idosas a manterem autonomia no uso de uma plataforma digital, com recursos como:

- tarefas simples;
- tarefas com etapas guiadas;
- lembretes com data e horário;
- lembretes recorrentes;
- alerta visual para lembretes vencidos;
- notificação do navegador com o app aberto;
- perfil do usuário;
- preferências de acessibilidade;
- modo alto contraste;
- tamanho de fonte ajustável;
- modo simples;
- espaçamento ampliado;
- redução de animações;
- mensagens de erro amigáveis.

## Contexto do projeto

O HelpSenior segue a proposta de acessibilidade digital para pessoas idosas, com foco em:

- clareza visual;
- botões e áreas clicáveis maiores;
- navegação previsível;
- feedback claro após ações;
- redução de complexidade;
- separação de responsabilidades;
- arquitetura limpa;
- domínio independente de UI e infraestrutura.

## Stack principal

```txt
Monorepo
pnpm
Turbo
TypeScript
React
Vite
Tailwind CSS
React Router
Firebase Authentication
Cloud Firestore
Vitest
```

## Arquitetura

O projeto usa uma arquitetura em camadas:

```txt
@helpsenior/core
        ↓
@helpsenior/firebase
        ↓
apps/web
```

## Pacotes

### @helpsenior/core

Pacote de domínio.

Contém:

- entidades;
- contratos de repositório;
- casos de uso;
- regras de negócio;
- testes unitários.

Não depende de React, Firebase, navegador, CSS ou Tailwind.

Módulos atuais:

```txt
tasks
preferences
profile
reminders
```

### @helpsenior/firebase

Pacote de infraestrutura Firebase.

Contém:

- configuração do Firebase;
- serviço de autenticação;
- repositórios Firestore;
- mappers entre domínio e Firestore;
- implementação dos contratos do `@helpsenior/core`.

Coleções usadas:

```txt
tasks
reminders
userPreferences
userProfiles
```

### @helpsenior/web

Aplicação Web.

Contém:

- interface React;
- roteamento;
- hooks;
- componentes;
- integração com Firebase;
- telas de tarefas, lembretes, perfil e configurações;
- tratamento amigável de erros;
- aplicação visual das preferências de acessibilidade.

## Estrutura do monorepo

```txt
helpsenior/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
│
├── apps/
│   └── web/
│       ├── README.md
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tsconfig.app.json
│       ├── tsconfig.node.json
│       ├── eslint.config.js
│       ├── public/
│       │   ├── favicon.svg
│       │   └── icons.svg
│       └── src/
│           ├── config/
│           ├── features/
│           ├── pages/
│           ├── shared/
│           ├── App.tsx
│           ├── index.css
│           ├── main.tsx
│           └── vite-env.d.ts
│
└── packages/
    ├── core/
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │
    └── firebase/
        ├── README.md
        ├── package.json
        ├── tsconfig.json
        └── src/
```

## Funcionalidades atuais

### Autenticação

O app possui:

- cadastro com nome completo, e-mail e senha;
- confirmação de senha;
- login com e-mail e senha;
- logout;
- persistência de sessão;
- criação automática do perfil após cadastro;
- sincronização imediata do nome do usuário na barra superior;
- tratamento amigável de erros de autenticação.

Exemplos de mensagens amigáveis:

```txt
Este e-mail já está cadastrado.
Informe um e-mail válido.
A senha precisa ter pelo menos 6 caracteres.
E-mail ou senha incorretos.
Não foi possível conectar. Verifique sua internet e tente novamente.
```

### Tarefas

O app permite:

- criar tarefa simples;
- criar tarefa com etapas guiadas;
- listar tarefas do usuário logado;
- concluir tarefa inteira;
- concluir etapa individual;
- concluir automaticamente a tarefa quando todas as etapas forem concluídas;
- persistir tarefas no Firestore.

Exemplo:

```txt
Tomar remédio

1. Pegar o remédio
2. Conferir o horário
3. Tomar com água
```

### Lembretes

O app permite:

- criar lembrete;
- informar data;
- informar horário;
- informar descrição;
- concluir lembrete;
- listar lembretes;
- ordenar lembretes;
- filtrar lembretes;
- exibir contadores por filtro;
- exibir resumo rápido;
- persistir lembretes no Firestore.

### Lembretes recorrentes

O app suporta recorrência simples:

```txt
Nenhuma recorrência
Todos os dias
Toda semana
Todo mês
```

Também permite informar uma data final da recorrência.

Ao concluir um lembrete recorrente, o sistema:

```txt
1. marca o lembrete atual como concluído;
2. calcula a próxima data;
3. cria automaticamente o próximo lembrete.
```

Exemplo:

```txt
Tomar remédio
Data: 2026-07-10
Horário: 08:00
Recorrência: Todos os dias
```

Após concluir:

```txt
Tomar remédio
Data: 2026-07-11
Horário: 08:00
Recorrência: Todos os dias
```

### Alertas e notificações

O app possui:

- alerta visual para lembretes vencidos;
- notificação do navegador para lembretes vencidos;
- monitoramento global dos lembretes;
- verificação automática a cada minuto.

A notificação atual funciona com o app aberto.

Ainda não há Service Worker nem Firebase Cloud Messaging.

### Perfil

O app possui página de perfil com:

```txt
Nome
E-mail
Telefone
Data de nascimento
```

O e-mail vem do Firebase Authentication.

O nome é preenchido automaticamente após o cadastro.

### Preferências de acessibilidade

O app possui preferências persistidas por usuário:

```txt
Tamanho da fonte
Alto contraste
Modo simples
Redução de animações
Espaçamento maior
```

Essas preferências são salvas no Firestore e aplicadas visualmente na interface.

### Tratamento amigável de erros

O app possui mappers para transformar erros técnicos em mensagens mais claras.

Auth:

```txt
src/features/auth/utils/getFirebaseAuthErrorMessage.ts
```

Firestore:

```txt
src/shared/errors/getFirebaseFirestoreErrorMessage.ts
```

Usado em:

```txt
useAuth
useTasks
useReminders
useUserProfile
useUserPreferences
```

## Rotas Web

```txt
/               → Tarefas
/lembretes      → Lembretes
/perfil         → Perfil do usuário
/configuracoes  → Preferências de acessibilidade
```

## Firebase

O projeto usa:

```txt
Firebase Authentication
Cloud Firestore
```

### Authentication

Método usado:

```txt
E-mail/senha
```

Ative no Firebase Console:

```txt
Authentication → Método de login → E-mail/senha
```

### Firestore

Coleções atuais:

```txt
tasks
reminders
userPreferences
userProfiles
```

### Variáveis de ambiente

Crie o arquivo:

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

Essas informações vêm do Firebase Console.

## Segurança do Firestore

As regras devem garantir que cada usuário acesse apenas os próprios dados.

Regra recomendada:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    match /reminders/{reminderId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    match /userPreferences/{userId} {
      allow create: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.userId == request.auth.uid;

      allow read: if request.auth != null
        && request.auth.uid == userId;

      allow update: if request.auth != null
        && request.auth.uid == userId
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null
        && request.auth.uid == userId
        && resource.data.userId == request.auth.uid;
    }

    match /userProfiles/{userId} {
      allow create: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.userId == request.auth.uid;

      allow read: if request.auth != null
        && request.auth.uid == userId;

      allow update: if request.auth != null
        && request.auth.uid == userId
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null
        && request.auth.uid == userId
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Instalação

Na raiz do projeto:

```bash
pnpm install
```

## Rodando o projeto

Rodar o app Web:

```bash
pnpm --filter @helpsenior/web dev
```

Acesse:

```txt
http://localhost:5173
```

## Scripts principais

### Typecheck geral

```bash
pnpm typecheck
```

### Typecheck sem cache do Turbo

```bash
pnpm typecheck --force
```

### Testes do core

```bash
pnpm --filter @helpsenior/core test
```

### Typecheck do core

```bash
pnpm --filter @helpsenior/core typecheck
```

### Typecheck do Firebase

```bash
pnpm --filter @helpsenior/firebase typecheck
```

### Typecheck do Web

```bash
pnpm --filter @helpsenior/web typecheck
```

### Build do Web

```bash
pnpm --filter @helpsenior/web build
```

### Lint do Web

```bash
pnpm --filter @helpsenior/web lint
```

## Scripts por pacote

### Raiz

```json
{
  "scripts": {
    "build": "turbo build",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "lint": "turbo lint"
  }
}
```

### apps/web

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

### packages/core

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

### packages/firebase

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

## Testes

O pacote `@helpsenior/core` possui testes unitários com Vitest.

Os testes cobrem:

- criação de tarefas;
- listagem de tarefas;
- conclusão de tarefas;
- conclusão de etapas;
- preferências de acessibilidade;
- perfil do usuário;
- criação de lembretes;
- listagem de lembretes;
- conclusão de lembretes;
- lembretes recorrentes;
- criação automática do próximo lembrete;
- respeito à data final da recorrência.

Rodar testes:

```bash
pnpm --filter @helpsenior/core test
```

## Decisões de arquitetura

### Domínio independente

O `@helpsenior/core` não importa React, Firebase ou bibliotecas de UI.

Isso permite testar regras de negócio sem depender de navegador ou banco de dados.

### Firebase isolado

O `@helpsenior/firebase` implementa os contratos do `core`.

Assim, a aplicação Web não precisa conhecer detalhes internos de mappers e persistência.

### Web com hooks

O `apps/web` usa hooks para conectar interface, casos de uso e repositórios.

### Firestore sem undefined

O Firestore não aceita campos com valor `undefined`.

Por isso os mappers montam objetos condicionalmente.

### Erros amigáveis

Erros técnicos do Firebase são convertidos em mensagens compreensíveis para o usuário.

### Acessibilidade como regra do produto

Preferências visuais não são apenas cosméticas. Elas fazem parte do objetivo principal do HelpSenior.

## Cuidados importantes

### Não versionar node_modules

O repositório deve ignorar:

```txt
node_modules
**/node_modules
```

Se `node_modules` foi commitado por engano, remova do Git com:

```bash
git rm -r --cached node_modules apps/web/node_modules packages/core/node_modules packages/firebase/node_modules 2>/dev/null || true
git commit -m "chore: remove node_modules from repository"
git push
```

### Não versionar .env

Arquivos `.env` não devem ser enviados para o GitHub.

Use:

```gitignore
.env
.env.local
.env.*.local
```

### Reinstalar dependências

Como `node_modules` não deve ser versionado, cada ambiente deve instalar dependências com:

```bash
pnpm install
```

## Status atual

O projeto possui:

- monorepo com pnpm;
- Turbo;
- app Web em React/Vite;
- pacote de domínio isolado;
- pacote Firebase isolado;
- autenticação;
- cadastro com nome completo;
- perfil automático após cadastro;
- tarefas;
- tarefas com etapas;
- lembretes;
- lembretes recorrentes;
- preferências de acessibilidade;
- tratamento amigável de erros;
- Firestore com regras por usuário;
- documentação por pacote;
- typecheck e build passando.

## Limitações atuais

O projeto ainda não possui:

- recuperação de senha;
- tarefas recorrentes;
- recorrência personalizada por dias da semana;
- Design System;
- responsividade refinada;
- testes automatizados no Web;
- login social;
- notificações com app fechado;
- Service Worker;
- Firebase Cloud Messaging;
- app Mobile.

## Próximas evoluções recomendadas

1. Remover `node_modules` do histórico/versionamento, se foi enviado ao GitHub.
2. Criar recuperação de senha.
3. Criar tarefas recorrentes.
4. Criar recorrência personalizada por dias da semana.
5. Melhorar responsividade.
6. Criar Design System básico.
7. Criar testes automatizados no Web.
8. Criar notificações com Service Worker/Firebase Cloud Messaging.
9. Criar app Mobile.

## Repositório

```txt
git@github.com:RomualdoBorges/helpsenior.git
```

## Licença

Este projeto foi criado para fins acadêmicos e de estudo.
