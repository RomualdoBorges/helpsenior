# HelpSenior

HelpSenior é uma aplicação Web focada em acessibilidade para pessoas idosas. A proposta é ajudar o usuário a organizar tarefas, lembretes, perfil e preferências visuais de forma simples, clara e previsível.

O projeto está organizado como um monorepo com separação entre domínio, infraestrutura Firebase e aplicação Web.

## Stack

```txt
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

```txt
@helpsenior/core
        ↓
@helpsenior/firebase
        ↓
@helpsenior/web
```

- `@helpsenior/core`: entidades, contratos de repositório, casos de uso, regras de negócio e testes unitários.
- `@helpsenior/firebase`: serviços Firebase, repositórios Firestore e mappers entre Firestore e domínio.
- `@helpsenior/web`: interface React, rotas, hooks, componentes, autenticação e aplicação das preferências de acessibilidade.

## Decisão de produto

```txt
Tarefa = o que precisa ser feito
Lembrete = quando avisar e repetir
```

Por isso, tarefas não possuem recorrência. Recorrência existe apenas em lembretes.

## Funcionalidades atuais

### Autenticação

- cadastro com nome completo, e-mail, senha e confirmação de senha;
- login com e-mail e senha;
- logout;
- recuperação de senha por e-mail pelo Firebase Authentication;
- persistência de sessão;
- criação/atualização automática do perfil após cadastro;
- exibição do nome do usuário na barra superior;
- mensagens amigáveis para erros de autenticação.

### Tarefas

- criar tarefas com título obrigatório;
- informar descrição opcional;
- informar data opcional;
- listar tarefas do usuário logado;
- filtrar tarefas por todas, pendentes, concluídas e com data;
- exibir resumo de tarefas pendentes, concluídas e com data;
- editar tarefas pendentes;
- concluir tarefas;
- excluir tarefas;
- persistir tarefas no Cloud Firestore.

### Lembretes

- criar lembretes com título e data;
- informar descrição e horário opcionais;
- criar lembretes recorrentes;
- informar data final da recorrência;
- listar, ordenar e filtrar lembretes;
- exibir resumo de vencidos, pendentes, recorrentes e concluídos;
- editar lembretes pendentes;
- concluir lembretes;
- excluir lembretes;
- persistir lembretes no Cloud Firestore.

Recorrências disponíveis:

```txt
Sem recorrência
Todos os dias
Toda semana
Todo mês
```

Ao concluir um lembrete recorrente, o lembrete atual é marcado como concluído e o próximo lembrete é criado automaticamente quando ainda está dentro da data final configurada.

### Alertas e notificações

- alerta visual para lembretes vencidos dentro do app;
- notificação do navegador para lembretes vencidos com o app aberto;
- pedido de permissão de notificações no navegador;
- verificação automática de lembretes a cada minuto.

Ainda não há Service Worker nem Firebase Cloud Messaging, então as notificações não funcionam com o app fechado.

### Perfil

O perfil do usuário salva:

```txt
Nome
E-mail
Telefone
Data de nascimento
```

### Preferências de acessibilidade

Preferências persistidas por usuário:

```txt
Tamanho da fonte
Alto contraste
Modo simples
Redução de animações
Espaçamento maior
```

## Rotas Web

```txt
/               → Tarefas
/lembretes      → Lembretes
/perfil         → Perfil do usuário
/configuracoes  → Preferências de acessibilidade
```

## Estrutura

```txt
apps/
└── web/

packages/
├── core/
└── firebase/
```

## Firebase

O projeto usa:

```txt
Firebase Authentication
Cloud Firestore
```

Método de autenticação:

```txt
E-mail/senha
```

Coleções usadas:

```txt
tasks
reminders
userPreferences
userProfiles
```

## Variáveis de ambiente

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

## Instalação

```bash
pnpm install
```

## Rodando o app Web

```bash
pnpm --filter @helpsenior/web dev
```

Por padrão, o Vite sobe em:

```txt
http://localhost:5173
```

## Scripts principais

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm typecheck
pnpm --filter @helpsenior/core test
pnpm --filter @helpsenior/web dev
pnpm --filter @helpsenior/web build
pnpm --filter @helpsenior/firebase typecheck
```

## Testes

O pacote `@helpsenior/core` possui testes unitários com Vitest para:

- tarefas;
- lembretes;
- lembretes recorrentes;
- preferências de acessibilidade;
- perfil do usuário.

## Status atual

O projeto possui app Web funcional com autenticação, tarefas, lembretes, perfil, configurações de acessibilidade e persistência no Firebase.

## Limitações atuais

- não há testes automatizados no app Web;
- não há notificações com app fechado;
- não há Service Worker;
- não há Firebase Cloud Messaging;
- não há login social;
- não há app Mobile.

## Licença

Este projeto foi criado para fins acadêmicos e de estudo.
