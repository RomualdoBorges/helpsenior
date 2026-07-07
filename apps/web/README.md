# @helpsenior/web

Aplicação Web do HelpSenior.

Este app é responsável pela interface principal da plataforma, permitindo que usuários criem conta, façam login, organizem tarefas simples ou guiadas por etapas, criem lembretes, configurem lembretes recorrentes, recebam alertas no navegador, editem o perfil e personalizem a experiência visual com recursos de acessibilidade.

O app Web consome os pacotes internos do monorepo:

```txt
@helpsenior/core
@helpsenior/firebase
```

## Objetivo

O HelpSenior Web tem como objetivo ajudar pessoas idosas a organizar atividades do dia a dia com mais clareza, segurança, acessibilidade e autonomia.

A aplicação permite criar tarefas simples ou divididas em etapas guiadas, facilitando o acompanhamento de ações como:

```txt
Tomar remédio
Preparar café
Ir ao médico
Fazer caminhada
Pagar uma conta
Organizar documentos
```

Além disso, o usuário pode:

- criar conta com nome completo, e-mail e senha;
- entrar na conta com e-mail e senha;
- criar lembretes com data e horário;
- criar lembretes recorrentes;
- receber alerta visual dentro do app;
- receber notificação do navegador com o app aberto;
- ajustar preferências visuais;
- salvar dados básicos de perfil;
- navegar entre tarefas, lembretes, perfil e configurações;
- receber mensagens de erro mais amigáveis em login, cadastro e operações com dados.

## Funcionalidades atuais

Atualmente o app Web possui:

- cadastro com nome completo, e-mail e senha;
- confirmação de senha no cadastro;
- criação automática do perfil ao cadastrar;
- preenchimento automático do nome no perfil após cadastro;
- atualização imediata da barra superior com o nome do usuário;
- login com e-mail e senha;
- logout;
- persistência de sessão com Firebase Authentication;
- tratamento amigável de erros de autenticação;
- tratamento amigável de erros do Firestore;
- criação de tarefas simples;
- criação de tarefas com etapas guiadas;
- listagem de tarefas do usuário logado;
- conclusão de tarefa inteira;
- conclusão de etapa individual;
- conclusão automática da tarefa quando todas as etapas são concluídas;
- persistência das tarefas no Cloud Firestore;
- criação de lembretes;
- criação de lembretes recorrentes;
- criação de lembretes com data final de recorrência;
- listagem de lembretes;
- ordenação de lembretes;
- filtros de lembretes;
- contadores por filtro;
- resumo rápido de lembretes;
- conclusão de lembretes;
- criação automática do próximo lembrete recorrente ao concluir;
- persistência dos lembretes no Cloud Firestore;
- alerta visual para lembretes vencidos;
- notificação do navegador para lembretes vencidos;
- monitoramento global de lembretes no app;
- verificação automática de lembretes a cada minuto;
- preferências de acessibilidade por usuário;
- persistência das preferências no Firestore;
- aplicação visual das preferências na interface;
- ajuste de tamanho da fonte;
- modo alto contraste;
- modo simples;
- redução de animações;
- espaçamento maior;
- perfil do usuário;
- persistência do perfil no Firestore;
- exibição do nome do usuário na barra superior;
- roteamento com React Router;
- páginas separadas para tarefas, lembretes, perfil e configurações;
- menu ativo conforme a rota atual;
- estilização com Tailwind CSS;
- separação entre interface, regra de negócio e infraestrutura.
- recuperação de senha;
- envio de e-mail de redefinição de senha pelo Firebase Authentication;
- modo “Esqueci minha senha” no formulário de autenticação;
- mensagem amigável após envio do e-mail de recuperação;

## Funcionalidades previstas

As próximas evoluções previstas são:

- tarefas recorrentes;
- recorrência personalizada por dias da semana;
- Design System;
- responsividade refinada;
- testes automatizados no Web;
- login social;
- notificações com Service Worker/Firebase Cloud Messaging;
- versão mobile.

## Arquitetura

O app Web não concentra as regras de negócio diretamente.

Ele usa:

```txt
@helpsenior/core
```

para entidades, contratos e casos de uso.

E usa:

```txt
@helpsenior/firebase
```

para autenticação e persistência no Firebase.

## Fluxo geral da aplicação

```txt
Usuário interage com a tela
        ↓
apps/web chama hooks
        ↓
hooks chamam casos de uso do @helpsenior/core
        ↓
casos de uso usam contratos de repositório
        ↓
@helpsenior/firebase implementa esses contratos
        ↓
Firebase Auth / Firestore
```

## Pacotes utilizados

### @helpsenior/core

O pacote `@helpsenior/core` contém a lógica principal da aplicação.

Ele fornece recursos para tarefas:

```txt
Task
TaskStep
TaskRepository
CreateTaskUseCase
ListTasksUseCase
CompleteTaskUseCase
CompleteTaskStepUseCase
```

Recursos para lembretes:

```txt
Reminder
ReminderRecurrence
ReminderRepository
CreateReminderUseCase
ListRemindersUseCase
CompleteReminderUseCase
calculateNextReminderDate
```

Recursos para preferências de acessibilidade:

```txt
UserPreferences
UserPreferencesRepository
GetUserPreferencesUseCase
UpdateUserPreferencesUseCase
```

E recursos para perfil do usuário:

```txt
UserProfile
UserProfileRepository
GetUserProfileUseCase
UpdateUserProfileUseCase
```

### @helpsenior/firebase

O pacote `@helpsenior/firebase` contém a camada de infraestrutura Firebase.

Ele fornece:

```txt
FirebaseAuthService
FirebaseTaskRepository
FirebaseReminderRepository
FirebaseUserPreferencesRepository
FirebaseUserProfileRepository
createFirebaseServices
```

O app Web usa esse pacote para:

- autenticar usuários;
- observar usuário logado;
- salvar tarefas no Firestore;
- listar tarefas do usuário logado;
- atualizar status das tarefas;
- salvar lembretes no Firestore;
- salvar recorrência de lembretes no Firestore;
- listar lembretes do usuário logado;
- atualizar lembretes;
- salvar preferências de acessibilidade;
- carregar preferências de acessibilidade;
- salvar perfil do usuário;
- carregar perfil do usuário.

## Tailwind CSS

O app Web usa Tailwind CSS para estilização dos componentes.

A configuração foi feita com o plugin oficial para Vite:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

O arquivo principal de estilos importa o Tailwind em:

```txt
src/index.css
```

```css
@import "tailwindcss";
```

## Estratégia de estilização

A estilização atual segue duas camadas:

```txt
Tailwind CSS
  ↓
Estilos diretos dos componentes

index.css
  ↓
Regras globais de acessibilidade
```

Os componentes usam Tailwind para layout, espaçamento, bordas, botões, inputs e cards.

O arquivo `index.css` concentra regras globais como:

- alto contraste;
- tamanho de fonte;
- modo simples;
- redução de animações;
- espaçamento maior;
- ajustes de alto contraste para cards, menus, lembretes, alertas e resumo rápido.

## Roteamento

O app usa React Router para separar as páginas principais.

As rotas atuais são:

```txt
/               → tarefas
/lembretes      → lembretes
/perfil         → perfil do usuário
/configuracoes  → preferências de acessibilidade
```

O roteamento é configurado em:

```txt
src/App.tsx
```

E o provedor principal fica em:

```txt
src/main.tsx
```

## Estrutura atual

```txt
apps/web/
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── config/
│   │   └── firebase.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── AuthForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── utils/
│   │   │       └── getFirebaseAuthErrorMessage.ts
│   │   │
│   │   ├── preferences/
│   │   │   ├── components/
│   │   │   │   └── UserPreferencesPanel.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useUserPreferences.ts
│   │   │   └── utils/
│   │   │       └── getPreferenceClassNames.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   │   └── UserProfileForm.tsx
│   │   │   └── hooks/
│   │   │       └── useUserProfile.ts
│   │   │
│   │   ├── reminders/
│   │   │   ├── components/
│   │   │   │   ├── CreateReminderForm.tsx
│   │   │   │   ├── DueReminderAlert.tsx
│   │   │   │   └── ReminderList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCurrentTime.ts
│   │   │   │   ├── useReminderNotifications.ts
│   │   │   │   └── useReminders.ts
│   │   │   └── utils/
│   │   │       ├── getDueReminders.ts
│   │   │       └── sortReminders.ts
│   │   │
│   │   └── tasks/
│   │       ├── components/
│   │       │   ├── CreateTaskForm.tsx
│   │       │   └── TaskList.tsx
│   │       └── hooks/
│   │           └── useTasks.ts
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RemindersPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── shared/
│   │   └── errors/
│   │       └── getFirebaseFirestoreErrorMessage.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Configuração do Firebase no Web

A configuração do Firebase usada pelo app Web fica em:

```txt
src/config/firebase.ts
```

Esse arquivo lê as variáveis de ambiente do Vite e cria os serviços Firebase por meio do pacote `@helpsenior/firebase`.

## Variáveis de ambiente

Crie um arquivo `.env` dentro de:

```txt
apps/web/.env
```

Com as seguintes variáveis:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

O arquivo `.env` não deve ser versionado no Git.

## Autenticação

A autenticação é feita com Firebase Authentication usando o método:

```txt
E-mail/senha
```

Esse método precisa estar ativado no Firebase Console em:

```txt
Authentication → Método de login → E-mail/senha
```

## Fluxo de autenticação

```txt
Usuário cria conta informando nome, e-mail e senha
        ↓
Firebase Authentication cria o usuário e retorna o uid
        ↓
apps/web cria/atualiza o perfil no Firestore com nome e e-mail
        ↓
apps/web armazena o usuário autenticado no hook useAuth
        ↓
O uid é usado como userId das tarefas, lembretes, preferências e perfil
        ↓
A barra superior mostra "Olá, Nome"
        ↓
Cada usuário vê apenas seus próprios dados
```

## Hook useAuth

O hook de autenticação fica em:

```txt
src/features/auth/hooks/useAuth.ts
```

Ele retorna:

```ts
{
  user,
  isAuthenticated,
  isLoadingAuth,
  isSubmittingAuth,
  authError,
  authSuccessMessage,
  signUp,
  signIn,
  resetPassword,
  signOut,
}
```

O hook é responsável por:

- observar o usuário autenticado;
- criar conta;
- entrar na conta;
- sair da conta;
- criar/atualizar o perfil após cadastro;
- disparar evento interno quando o perfil é atualizado;
- guardar temporariamente o nome recém-cadastrado para evitar corrida entre Auth e Firestore;
- tratar erros de autenticação com mensagens amigáveis.
- enviar e-mail de recuperação de senha;
- controlar mensagem de sucesso após envio do e-mail de recuperação;

## Cadastro com nome completo

No modo de cadastro, o formulário solicita:

```txt
Nome completo
E-mail
Senha
Confirmar senha
```

Ao cadastrar, o app executa:

```txt
1. cria o usuário no Firebase Authentication
2. cria perfil padrão no Firestore se necessário
3. atualiza o perfil com o nome informado
4. salva temporariamente o nome em sessionStorage
5. dispara evento interno de perfil atualizado
6. entra no app
```

Isso permite que, logo após o cadastro:

```txt
A barra superior mostre "Olá, Nome"
```

e que a página:

```txt
/perfil
```

já venha com o nome preenchido.

## Evento interno de atualização de perfil

O app usa um evento interno para sincronizar o perfil logo após o cadastro.

Evento:

```txt
helpsenior:user-profile-updated
```

Esse evento é disparado pelo `useAuth` depois que o cadastro cria/atualiza o perfil.

O `useUserProfile` escuta esse evento e atualiza o estado local do perfil.

Isso evita que o usuário precise recarregar a página ou sair e entrar novamente para ver o nome atualizado.

## sessionStorage para nome pendente

Durante o cadastro, o app salva temporariamente o nome informado no `sessionStorage`.

Chave:

```txt
helpsenior:pending-user-profile-name:{userId}
```

Essa estratégia evita problema de corrida entre:

```txt
onAuthStateChanged
```

e a criação/atualização do documento de perfil no Firestore.

Quando o `useUserProfile` confirma que o perfil já possui o nome correto, a chave temporária é removida.

## AuthForm

O formulário de autenticação fica em:

```txt
src/features/auth/components/AuthForm.tsx
```

Ele possui dois modos:

```txt
Entrar
Criar conta
```

No modo `Entrar`, exibe:

```txt
E-mail
Senha
```

No modo `Criar conta`, exibe:

```txt
Nome completo
E-mail
Senha
Confirmar senha
```

Antes de cadastrar, o formulário valida:

```txt
Nome obrigatório
Confirmação de senha igual à senha
```

## Recuperação de senha

O app possui fluxo de recuperação de senha usando Firebase Authentication.

Na tela de login, o usuário pode clicar em:

```txt
Esqueci minha senha
```

O formulário muda para o modo de recuperação e solicita apenas:

```txt
E-mail
```

Ao enviar, o app chama:

```txt
resetPassword
```

no hook:

```txt
src/features/auth/hooks/useAuth.ts
```

Esse hook usa o método:

```txt
resetPassword
```

do serviço:

```txt
FirebaseAuthService
```

localizado no pacote:

```txt
@helpsenior/firebase
```

Fluxo:

```txt
Usuário clica em "Esqueci minha senha"
↓
Informa o e-mail
↓
apps/web chama useAuth.resetPassword
↓
@helpsenior/firebase chama sendPasswordResetEmail
↓
Firebase Authentication envia o e-mail
↓
apps/web mostra mensagem de sucesso
```

Mensagem exibida após envio:

```txt
Enviamos um e-mail com as instruções para redefinir sua senha.
```

Durante o desenvolvimento, o e-mail pode cair na caixa de spam/lixo eletrônico, pois o envio é feito pelo domínio padrão do Firebase.

## Tratamento amigável de erros de autenticação

O app traduz erros técnicos do Firebase Auth para mensagens mais claras.

Exemplos:

```txt
auth/email-already-in-use
        ↓
Este e-mail já está cadastrado.

auth/invalid-email
        ↓
Informe um e-mail válido.

auth/weak-password
        ↓
A senha precisa ter pelo menos 6 caracteres.

auth/invalid-credential
        ↓
E-mail ou senha incorretos.

auth/network-request-failed
        ↓
Não foi possível conectar. Verifique sua internet e tente novamente.
```

Arquivo:

```txt
src/features/auth/utils/getFirebaseAuthErrorMessage.ts
```

Esse mapper é usado em:

```txt
useAuth
```

nas ações:

```txt
signUp
signIn
signOut
```

## Tratamento amigável de erros do Firestore

O app possui um mapper compartilhado para erros do Firestore.

Arquivo:

```txt
src/shared/errors/getFirebaseFirestoreErrorMessage.ts
```

Ele converte códigos técnicos do Firestore em mensagens amigáveis.

Exemplos:

```txt
permission-denied
        ↓
Você não tem permissão para acessar essas informações.

unauthenticated
        ↓
Sua sessão expirou. Faça login novamente.

unavailable
        ↓
Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.

deadline-exceeded
        ↓
A conexão demorou mais que o esperado. Tente novamente.

not-found
        ↓
O registro solicitado não foi encontrado.

invalid-argument
        ↓
Alguma informação enviada está inválida.
```

Esse mapper recebe também uma mensagem padrão de fallback.

Exemplo:

```ts
getFirebaseFirestoreErrorMessage(
  error,
  "Não foi possível carregar os lembretes.",
);
```

## Onde o tratamento de erros do Firestore é usado

O mapper de erros do Firestore é usado nos hooks:

```txt
useTasks
useReminders
useUserProfile
useUserPreferences
```

### useTasks

Mensagens de fallback:

```txt
Não foi possível carregar as tarefas.
Não foi possível criar a tarefa.
Não foi possível concluir a tarefa.
Não foi possível concluir a etapa.
```

### useReminders

Mensagens de fallback:

```txt
Não foi possível carregar os lembretes.
Não foi possível criar o lembrete.
Não foi possível concluir o lembrete.
```

### useUserProfile

Mensagens de fallback:

```txt
Não foi possível carregar o perfil.
Não foi possível salvar o perfil.
```

### useUserPreferences

Mensagens de fallback:

```txt
Não foi possível carregar as preferências.
Não foi possível salvar as preferências.
```

## Tarefas

As tarefas são o primeiro módulo funcional do HelpSenior.

Elas podem ser simples:

```txt
Tomar remédio
```

Ou guiadas por etapas:

```txt
Tomar remédio

1. Pegar o remédio
2. Conferir o horário
3. Tomar com água
```

## Página HomePage

A página principal fica em:

```txt
src/pages/HomePage.tsx
```

Ela representa a rota:

```txt
/
```

Essa página renderiza:

```txt
CreateTaskForm
TaskList
```

## Hook useTasks

O hook de tarefas fica em:

```txt
src/features/tasks/hooks/useTasks.ts
```

Ele é responsável por:

- criar instância do `FirebaseTaskRepository`;
- criar os casos de uso do `@helpsenior/core`;
- listar tarefas do usuário logado;
- criar tarefa;
- concluir tarefa;
- concluir etapa;
- recarregar a lista após alterações;
- controlar estados de loading e erro;
- traduzir erros do Firestore para mensagens amigáveis.

## Lembretes

O app possui um módulo de lembretes.

A rota é:

```txt
/lembretes
```

Os lembretes permitem que o usuário crie avisos com:

```txt
title
description
date
time
recurrence
recurrenceEndDate
completed
```

Exemplos:

```txt
Tomar remédio às 08:00
Consulta médica às 14:30
Pagar conta todo mês
Medir pressão todos os dias
Fazer caminhada toda semana
```

## Recorrência de lembretes no Web

O formulário de lembretes permite escolher:

```txt
Nenhuma recorrência
Todos os dias
Toda semana
Todo mês
```

Também é possível informar:

```txt
Data final da recorrência
```

Quando um lembrete recorrente é concluído, o `CompleteReminderUseCase` do `core` cria automaticamente o próximo lembrete.

Exemplo:

```txt
Lembrete atual:
Tomar remédio
2026-07-10 às 08:00
Recorrência: Todos os dias

Após concluir:
Novo lembrete criado
2026-07-11 às 08:00
Recorrência: Todos os dias
```

## Página RemindersPage

A página de lembretes fica em:

```txt
src/pages/RemindersPage.tsx
```

Ela recebe do `App.tsx`:

```txt
reminders
dueReminders
isLoadingReminders
isCreatingReminder
remindersError
createReminder
completeReminder
notificationPermission
requestNotificationPermission
isNotificationSupported
isNotificationAllowed
isNotificationDenied
```

E renderiza:

```txt
DueReminderAlert
CreateReminderForm
ReminderList
Resumo rápido
Filtros de lembretes
```

## Resumo rápido de lembretes

A página de lembretes exibe cards com os totais:

```txt
Vencidos
Pendentes
Recorrentes
Concluídos
```

Esses valores são calculados a partir da lista de lembretes e da lista de lembretes vencidos.

## Filtros de lembretes

A página possui filtros:

```txt
Todos
Pendentes
Concluídos
Recorrentes
```

Cada filtro mostra um contador:

```txt
Todos (8)
Pendentes (3)
Concluídos (4)
Recorrentes (1)
```

Cada filtro possui mensagem vazia contextual:

```txt
Nenhum lembrete cadastrado ainda.
Nenhum lembrete pendente.
Nenhum lembrete concluído.
Nenhum lembrete recorrente.
```

## Ordenação de lembretes

Os lembretes são ordenados por utilitário próprio:

```txt
src/features/reminders/utils/sortReminders.ts
```

A regra atual é:

```txt
1. pendentes primeiro
2. pendentes mais próximos no topo
3. concluídos no final
4. concluídos mais recentes primeiro
```

## Hook useReminders

O hook de lembretes fica em:

```txt
src/features/reminders/hooks/useReminders.ts
```

Ele recebe o `userId` do usuário autenticado:

```ts
const {
  reminders,
  isLoadingReminders,
  isCreatingReminder,
  remindersError,
  createReminder,
  completeReminder,
  loadReminders,
} = useReminders(user?.id ?? null);
```

Esse hook é responsável por:

- criar instância do `FirebaseReminderRepository`;
- criar os casos de uso do `@helpsenior/core`;
- listar lembretes do usuário logado;
- criar lembrete;
- criar lembrete recorrente;
- concluir lembrete;
- permitir que o core gere o próximo lembrete recorrente;
- recarregar a lista após alterações;
- ordenar a lista;
- controlar estados de loading e erro;
- traduzir erros do Firestore para mensagens amigáveis.

## CreateReminderForm

O componente de criação de lembretes fica em:

```txt
src/features/reminders/components/CreateReminderForm.tsx
```

Ele permite:

- informar o título do lembrete;
- informar descrição opcional;
- informar data;
- informar horário opcional;
- escolher recorrência;
- informar data final da recorrência;
- enviar o lembrete para o hook `useReminders`.

O componente não sabe como o lembrete é salvo. Ele apenas chama:

```ts
onCreateReminder(input);
```

## ReminderList

O componente de listagem de lembretes fica em:

```txt
src/features/reminders/components/ReminderList.tsx
```

Ele exibe:

- título do lembrete;
- descrição;
- data;
- horário;
- status;
- recorrência;
- data final da recorrência;
- botão para concluir lembrete;
- mensagem vazia contextual.

## DueReminderAlert

O componente de alerta de lembretes vencidos fica em:

```txt
src/features/reminders/components/DueReminderAlert.tsx
```

Ele exibe um alerta visual dentro do app quando existe pelo menos um lembrete pendente cuja data/hora já chegou.

Também exibe se o lembrete é único ou recorrente.

Quando o lembrete é recorrente, o alerta informa:

```txt
Ao concluir, o próximo lembrete será criado automaticamente.
```

## getDueReminders

O utilitário que identifica lembretes vencidos fica em:

```txt
src/features/reminders/utils/getDueReminders.ts
```

A regra é:

```txt
Se reminder.completed === false
E reminder.date + reminder.time <= agora
Então o lembrete está vencido
```

Lembretes sem horário vencem no começo do dia.

## useReminderNotifications

O hook de notificações do navegador fica em:

```txt
src/features/reminders/hooks/useReminderNotifications.ts
```

Esse hook é responsável por:

- verificar se o navegador suporta notificações;
- pedir permissão ao usuário;
- armazenar o estado da permissão;
- disparar notificação do navegador quando um lembrete vence;
- evitar repetir a mesma notificação várias vezes para o mesmo lembrete.

A notificação atual funciona com o app aberto.

Ela ainda não usa Service Worker nem Firebase Cloud Messaging.

## useCurrentTime

O hook de relógio interno fica em:

```txt
src/features/reminders/hooks/useCurrentTime.ts
```

Ele atualiza a hora atual em intervalo definido.

Atualmente é usado para recalcular os lembretes vencidos automaticamente a cada minuto.

## Notificações globais de lembretes

O monitoramento de lembretes fica no `App.tsx`, não apenas na página `/lembretes`.

Isso permite que o app verifique lembretes vencidos em qualquer rota:

```txt
/
/lembretes
/perfil
/configuracoes
```

Desde que o usuário esteja logado e o app esteja aberto.

Fluxo:

```txt
Usuário está logado
        ↓
App.tsx carrega lembretes
        ↓
useCurrentTime atualiza o horário atual
        ↓
getDueReminders calcula lembretes vencidos
        ↓
useReminderNotifications dispara notificação do navegador
        ↓
RemindersPage exibe alerta visual quando aberta
```

## Limitação das notificações atuais

A notificação atual funciona com o app aberto.

Ela não garante notificação quando:

```txt
o navegador está fechado
o app está fechado
o computador/celular bloqueia notificações
o usuário não deu permissão ao navegador
```

Para notificação fora do app aberto, será necessário evoluir para:

```txt
Service Worker
Web Push
Firebase Cloud Messaging
```

## Perfil do usuário

O app possui uma página de perfil do usuário.

A rota é:

```txt
/perfil
```

O perfil permite salvar:

```txt
name
email
phone
birthDate
createdAt
updatedAt
```

O e-mail vem do Firebase Authentication e é exibido como campo desabilitado no formulário.

## Hook useUserProfile

O hook de perfil fica em:

```txt
src/features/profile/hooks/useUserProfile.ts
```

Ele é responsável por:

- carregar perfil do usuário;
- criar perfil padrão quando ainda não existe;
- atualizar perfil;
- persistir perfil no Firestore;
- sincronizar o perfil logo após cadastro;
- controlar estado de carregamento;
- controlar estado de salvamento;
- controlar erros;
- traduzir erros do Firestore para mensagens amigáveis.

## UserProfileForm

O formulário de perfil fica em:

```txt
src/features/profile/components/UserProfileForm.tsx
```

Ele permite alterar:

```txt
Nome
Telefone
Data de nascimento
```

O e-mail é exibido no perfil, mas não é editado por esse formulário.

## Preferências de acessibilidade

O app Web possui preferências de acessibilidade persistidas por usuário.

As preferências disponíveis são:

- tamanho da fonte;
- alto contraste;
- modo simples;
- redução de animações;
- espaçamento maior.

Essas preferências são salvas no Firestore na coleção:

```txt
userPreferences
```

Cada documento usa como ID o `uid` do usuário autenticado:

```txt
userPreferences/{userId}
```

## Hook useUserPreferences

O hook de preferências fica em:

```txt
src/features/preferences/hooks/useUserPreferences.ts
```

Ele é responsável por:

- carregar preferências do usuário;
- criar preferências padrão quando ainda não existem;
- atualizar preferências;
- persistir alterações no Firestore;
- controlar estado de carregamento;
- controlar estado de salvamento;
- controlar erros;
- traduzir erros do Firestore para mensagens amigáveis.

## Classes globais de acessibilidade

As principais classes globais são:

```txt
font-size-small
font-size-medium
font-size-large
font-size-extra_large
high-contrast
simple-mode
reduce-motion
increased-spacing
```

## Firestore

O app Web usa quatro coleções principais no Firestore:

```txt
tasks
reminders
userPreferences
userProfiles
```

## Coleção reminders

Os lembretes são salvos na coleção:

```txt
reminders
```

Cada documento possui os principais campos:

```txt
userId
taskId
title
description
date
time
completed
recurrence
recurrenceEndDate
createdAt
updatedAt
completedAt
```

## Coleção userProfiles

Os perfis são salvos na coleção:

```txt
userProfiles
```

Cada documento usa o `uid` do Firebase Authentication como ID:

```txt
userProfiles/{userId}
```

Cada documento possui os principais campos:

```txt
userId
name
email
phone
birthDate
createdAt
updatedAt
```

No cadastro, o app já cria/atualiza esse documento com:

```txt
name
email
```

## Segurança do Firestore

As regras do Firestore devem garantir que cada usuário acesse apenas seus próprios dados.

Regra recomendada atual:

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

## Menu ativo

O menu principal usa `NavLink` do React Router.

Rotas disponíveis:

```txt
Tarefas         → /
Lembretes       → /lembretes
Perfil          → /perfil
Configurações   → /configuracoes
```

O item ativo fica destacado conforme a rota atual.

## Rodando o app

Na raiz do monorepo, execute:

```bash
pnpm --filter @helpsenior/web dev
```

A aplicação ficará disponível em:

```txt
http://localhost:5173
```

## Typecheck

Rodar typecheck apenas do app Web:

```bash
pnpm --filter @helpsenior/web typecheck
```

Rodar typecheck geral do monorepo:

```bash
pnpm typecheck
```

Rodar typecheck geral sem cache do Turbo:

```bash
pnpm typecheck --force
```

## Build

Rodar build apenas do app Web:

```bash
pnpm --filter @helpsenior/web build
```

## Lint

Rodar lint apenas do app Web:

```bash
pnpm --filter @helpsenior/web lint
```

## Scripts disponíveis

No `apps/web/package.json`:

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

## Estado atual

O app Web atualmente possui:

- React;
- Vite;
- TypeScript;
- Tailwind CSS;
- React Router;
- Firebase Authentication;
- Cloud Firestore;
- cadastro com nome completo;
- confirmação de senha no cadastro;
- criação automática do perfil após cadastro;
- sincronização imediata do nome do perfil após cadastro;
- login;
- logout;
- tratamento amigável de erros de autenticação;
- tratamento amigável de erros do Firestore;
- criação de tarefas;
- criação de tarefas com etapas;
- listagem de tarefas por usuário autenticado;
- conclusão de tarefa;
- conclusão de etapa;
- criação de lembretes;
- criação de lembretes recorrentes;
- listagem de lembretes;
- ordenação de lembretes;
- filtros de lembretes;
- contadores por filtro;
- resumo rápido de lembretes;
- conclusão de lembretes;
- criação automática do próximo lembrete recorrente;
- alerta visual para lembretes vencidos;
- notificação do navegador para lembretes vencidos;
- monitoramento global de lembretes no app;
- verificação automática de lembretes a cada minuto;
- preferências de acessibilidade persistidas;
- preferências de acessibilidade aplicadas visualmente;
- perfil do usuário persistido;
- exibição do nome do usuário na barra superior;
- rotas para tarefas, lembretes, perfil e configurações;
- menu ativo;
- regras globais de acessibilidade centralizadas no `index.css`;
- componentes principais migrados para Tailwind;
- integração com `@helpsenior/core`;
- integração com `@helpsenior/firebase`.

## Limitações atuais

O app ainda não possui:

- recuperação de senha;
- tarefas recorrentes;
- recorrência personalizada por dias da semana;
- Design System;
- responsividade refinada;
- loading visual refinado;
- testes automatizados no Web;
- componentes reutilizáveis;
- login social;
- notificação com app fechado;
- Service Worker;
- Firebase Cloud Messaging.

## Próximas evoluções

As próximas evoluções recomendadas são:

1. Criar recuperação de senha.
2. Criar tarefas recorrentes.
3. Criar recorrência personalizada por dias da semana.
4. Melhorar responsividade.
5. Criar Design System.
6. Criar testes automatizados no Web.
7. Criar notificações com Service Worker/Firebase Cloud Messaging.
8. Criar app Mobile.
