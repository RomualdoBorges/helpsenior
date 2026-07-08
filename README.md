# HelpSenior

HelpSenior é uma aplicação Web focada em acessibilidade para pessoas idosas, criada para organizar tarefas, lembretes, perfil e preferências visuais de forma simples, clara e previsível.

O projeto foi desenvolvido em formato de monorepo com separação entre domínio, infraestrutura Firebase e aplicação Web.

## Objetivo

O objetivo do HelpSenior é ajudar pessoas idosas a manterem autonomia no uso de uma plataforma digital, com recursos como:

- tarefas simples;
- tarefas com data;
- tarefas com etapas guiadas;
- lembretes com data e horário;
- lembretes recorrentes;
- alerta visual para lembretes vencidos;
- notificação do navegador com o app aberto;
- recuperação de senha;
- perfil do usuário;
- preferências de acessibilidade;
- modo alto contraste;
- tamanho de fonte ajustável;
- modo simples;
- espaçamento ampliado;
- redução de animações;
- mensagens de erro amigáveis.

## Decisão de produto

```txt
Tarefa = o que precisa ser feito
Etapas = como fazer
Lembrete = quando avisar e repetir
```

Por isso, tarefas não possuem recorrência. A recorrência fica apenas nos lembretes.

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

```txt
@helpsenior/core
        ↓
@helpsenior/firebase
        ↓
apps/web
```

## Pacotes

### @helpsenior/core

Pacote de domínio com entidades, contratos, casos de uso, regras de negócio e testes unitários.

Módulos atuais:

```txt
tasks
preferences
profile
reminders
```

### @helpsenior/firebase

Pacote de infraestrutura Firebase com autenticação, recuperação de senha, repositórios Firestore e mappers.

Coleções usadas:

```txt
tasks
reminders
userPreferences
userProfiles
```

### @helpsenior/web

Aplicação Web em React com rotas, hooks, componentes, integração Firebase e aplicação das preferências de acessibilidade.

## Funcionalidades atuais

### Autenticação

- cadastro com nome completo, e-mail e senha;
- confirmação de senha;
- login com e-mail e senha;
- logout;
- recuperação de senha;
- envio de e-mail de redefinição pelo Firebase Authentication;
- mensagem amigável após envio do e-mail de recuperação;
- persistência de sessão;
- criação automática do perfil após cadastro;
- sincronização imediata do nome do usuário na barra superior;
- tratamento amigável de erros de autenticação.

### Tarefas

- criar tarefa simples;
- criar tarefa com descrição;
- criar tarefa com data;
- criar tarefa com etapas guiadas opcionais;
- listar tarefas do usuário logado;
- concluir tarefa inteira;
- concluir etapa individual;
- concluir automaticamente a tarefa quando todas as etapas forem concluídas;
- persistir tarefas no Firestore.

### Lembretes

- criar lembrete;
- informar data;
- informar horário;
- informar descrição;
- criar lembrete recorrente;
- informar data final da recorrência;
- concluir lembrete;
- listar lembretes;
- ordenar lembretes;
- filtrar lembretes;
- exibir contadores por filtro;
- exibir resumo rápido;
- persistir lembretes no Firestore.

### Lembretes recorrentes

Recorrências disponíveis:

```txt
Nenhuma recorrência
Todos os dias
Toda semana
Todo mês
```

Ao concluir um lembrete recorrente:

```txt
1. o lembrete atual é marcado como concluído;
2. a próxima data é calculada;
3. um novo lembrete é criado automaticamente.
```

### Alertas e notificações

- alerta visual para lembretes vencidos;
- notificação do navegador para lembretes vencidos;
- monitoramento global dos lembretes;
- verificação automática a cada minuto.

A notificação atual funciona com o app aberto. Ainda não há Service Worker nem Firebase Cloud Messaging.

### Perfil

A página de perfil possui:

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

Coleções atuais:

```txt
tasks
reminders
userPreferences
userProfiles
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

## Instalação

```bash
pnpm install
```

## Rodando o app Web

```bash
pnpm --filter @helpsenior/web dev
```

Acesse:

```txt
http://localhost:5173
```

## Scripts principais

```bash
pnpm typecheck
pnpm typecheck --force
pnpm --filter @helpsenior/core test
pnpm --filter @helpsenior/core typecheck
pnpm --filter @helpsenior/firebase typecheck
pnpm --filter @helpsenior/web typecheck
pnpm --filter @helpsenior/web build
pnpm --filter @helpsenior/web lint
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

## Cuidados importantes

Não versionar:

```txt
node_modules
**/node_modules
.turbo
.env
.env.local
.env.*.local
```

Se alguma dessas pastas já foi commitada por engano:

```bash
git rm -r --cached node_modules apps/web/node_modules packages/core/node_modules packages/firebase/node_modules .turbo 2>/dev/null || true
git commit -m "chore: remove ignored files from repository"
git push
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
- recuperação de senha;
- perfil automático após cadastro;
- tarefas;
- tarefas com data;
- tarefas com etapas;
- lembretes;
- lembretes recorrentes;
- preferências de acessibilidade;
- tratamento amigável de erros;
- Firestore com regras por usuário;
- documentação por pacote;
- typecheck, testes e build passando.

## Limitações atuais

O projeto ainda não possui:

- filtros e resumo visual de tarefas;
- recorrência personalizada por dias da semana nos lembretes;
- Design System;
- responsividade refinada;
- testes automatizados no Web;
- login social;
- notificações com app fechado;
- Service Worker;
- Firebase Cloud Messaging;
- app Mobile.

## Próximas evoluções recomendadas

1. Criar filtros e resumo visual de tarefas.
2. Criar recorrência personalizada por dias da semana nos lembretes.
3. Melhorar responsividade.
4. Criar Design System básico.
5. Criar testes automatizados no Web.
6. Criar notificações com Service Worker/Firebase Cloud Messaging.
7. Criar app Mobile.

## Repositório

```txt
git@github.com:RomualdoBorges/helpsenior.git
```

## Licença

Este projeto foi criado para fins acadêmicos e de estudo.