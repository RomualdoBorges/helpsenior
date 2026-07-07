# @helpsenior/firebase

Pacote de infraestrutura Firebase do HelpSenior.

Este pacote é responsável por conectar a aplicação ao Firebase, fornecendo serviços de autenticação, persistência no Cloud Firestore, repositórios concretos e mapeadores entre o domínio do `@helpsenior/core` e os dados salvos no Firebase.

O `@helpsenior/firebase` implementa contratos definidos no pacote:

```txt
@helpsenior/core
```

Ele não deve conter regra de negócio principal. A regra de negócio fica no `core`.

## Objetivo

O objetivo do `@helpsenior/firebase` é isolar toda a comunicação com Firebase em um pacote próprio.

Isso permite que o app Web use Firebase sem espalhar código de infraestrutura pela interface.

```txt
apps/web
   ↓
@helpsenior/firebase
   ↓
Firebase Auth / Cloud Firestore
```

## Responsabilidades

O pacote `@helpsenior/firebase` é responsável por:

- inicializar Firebase App;
- criar instância do Firebase Authentication;
- criar instância do Cloud Firestore;
- autenticar usuários com e-mail e senha;
- observar mudanças no usuário autenticado;
- salvar tarefas no Firestore;
- listar tarefas do usuário autenticado;
- atualizar tarefas;
- salvar preferências de acessibilidade;
- carregar preferências de acessibilidade;
- salvar perfil do usuário;
- carregar perfil do usuário;
- salvar lembretes;
- listar lembretes;
- atualizar lembretes;
- salvar campos de recorrência de lembretes;
- carregar campos de recorrência de lembretes;
- mapear entidades do `core` para documentos do Firestore;
- mapear documentos do Firestore para entidades do `core`.

## O que não fica no Firebase

Este pacote não deve conter:

- componentes React;
- hooks React;
- estilos CSS;
- Tailwind;
- regras de tela;
- validações visuais;
- regras principais de negócio;
- estado de UI;
- roteamento;
- lógica específica do app Web.

Essas responsabilidades pertencem ao `apps/web` ou ao `@helpsenior/core`.

## Relação com outros pacotes

O monorepo segue esta separação:

```txt
@helpsenior/core
        ↓
@helpsenior/firebase
        ↓
apps/web
```

## Estrutura atual

```txt
packages/firebase/
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    │
    ├── config/
    │   └── firebase.ts
    │
    ├── auth/
    │   ├── FirebaseAuthService.ts
    │   └── index.ts
    │
    ├── tasks/
    │   ├── index.ts
    │   ├── mappers/
    │   │   └── TaskFirestoreMapper.ts
    │   └── repositories/
    │       └── FirebaseTaskRepository.ts
    │
    ├── preferences/
    │   ├── index.ts
    │   ├── mappers/
    │   │   └── UserPreferencesFirestoreMapper.ts
    │   └── repositories/
    │       └── FirebaseUserPreferencesRepository.ts
    │
    ├── profile/
    │   ├── index.ts
    │   ├── mappers/
    │   │   └── UserProfileFirestoreMapper.ts
    │   └── repositories/
    │       └── FirebaseUserProfileRepository.ts
    │
    └── reminders/
        ├── index.ts
        ├── mappers/
        │   └── ReminderFirestoreMapper.ts
        └── repositories/
            └── FirebaseReminderRepository.ts
```

## Configuração Firebase

A configuração principal fica em:

```txt
src/config/firebase.ts
```

Esse arquivo expõe funções para criar os serviços Firebase.

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function createFirebaseApp(config: FirebaseConfig) {
  return initializeApp(config);
}

export function createFirebaseServices(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export function createFirestoreDatabase(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return getFirestore(app);
}

export function createFirebaseAuth(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return getAuth(app);
}
```

## Autenticação

A autenticação fica no módulo:

```txt
src/auth/
```

O serviço principal é:

```txt
FirebaseAuthService
```

## AuthUser

O serviço retorna um usuário simplificado para a aplicação.

```ts
export interface AuthUser {
  id: string;
  email: string | null;
}
```

O campo `id` representa o `uid` do Firebase Authentication.

Esse `uid` é usado como:

```txt
userId
```

em tarefas, preferências, perfil e lembretes.

## Métodos do FirebaseAuthService

```txt
signUp
signIn
signOut
onAuthStateChanged
```

## Módulo tasks

O módulo de tarefas fica em:

```txt
src/tasks/
```

Ele implementa o contrato:

```txt
TaskRepository
```

do pacote:

```txt
@helpsenior/core
```

A implementação concreta é:

```txt
FirebaseTaskRepository
```

## Coleção tasks

As tarefas são salvas no Cloud Firestore na coleção:

```txt
tasks
```

Cada documento representa uma tarefa.

Exemplo de caminho:

```txt
tasks/{taskId}
```

## Campos do documento de tarefa

Cada documento de tarefa possui os principais campos:

```txt
userId
title
description
status
steps
createdAt
updatedAt
completedAt
```

## TaskFirestoreMapper

Arquivo:

```txt
src/tasks/mappers/TaskFirestoreMapper.ts
```

O `TaskFirestoreMapper` converte a entidade `Task` do `core` para o formato esperado pelo Firestore.

Também converte documentos do Firestore de volta para `Task`.

O domínio usa:

```txt
Date
```

O Firestore usa:

```txt
Timestamp
```

Além disso, o Firestore não aceita campos com valor:

```txt
undefined
```

Por isso o mapper remove campos opcionais quando eles não existem.

## FirebaseTaskRepository

Arquivo:

```txt
src/tasks/repositories/FirebaseTaskRepository.ts
```

O `FirebaseTaskRepository` implementa o contrato `TaskRepository`.

Ele possui os métodos:

```txt
create
findById
listByUserId
update
```

## Módulo preferences

O módulo de preferências fica em:

```txt
src/preferences/
```

Ele implementa o contrato:

```txt
UserPreferencesRepository
```

do pacote:

```txt
@helpsenior/core
```

A implementação concreta é:

```txt
FirebaseUserPreferencesRepository
```

## Coleção userPreferences

As preferências de acessibilidade são salvas no Cloud Firestore na coleção:

```txt
userPreferences
```

Cada documento representa as preferências de um usuário.

Exemplo de caminho:

```txt
userPreferences/{userId}
```

O ID do documento é o próprio `uid` do Firebase Authentication.

## Campos do documento de preferências

Cada documento de preferências possui os principais campos:

```txt
userId
fontSize
contrast
simpleMode
reduceMotion
increasedSpacing
updatedAt
```

## Módulo profile

O módulo de perfil fica em:

```txt
src/profile/
```

Ele implementa o contrato:

```txt
UserProfileRepository
```

do pacote:

```txt
@helpsenior/core
```

A implementação concreta é:

```txt
FirebaseUserProfileRepository
```

## Coleção userProfiles

Os perfis de usuário são salvos no Cloud Firestore na coleção:

```txt
userProfiles
```

Cada documento representa o perfil básico de um usuário.

Exemplo de caminho:

```txt
userProfiles/{userId}
```

O ID do documento é o próprio `uid` do Firebase Authentication.

## Campos do documento de perfil

Cada documento de perfil possui os principais campos:

```txt
userId
name
email
phone
birthDate
createdAt
updatedAt
```

## Módulo reminders

O módulo de lembretes fica em:

```txt
src/reminders/
```

Ele implementa o contrato:

```txt
ReminderRepository
```

do pacote:

```txt
@helpsenior/core
```

A implementação concreta é:

```txt
FirebaseReminderRepository
```

## Coleção reminders

Os lembretes são salvos no Cloud Firestore na coleção:

```txt
reminders
```

Cada documento representa um lembrete.

Exemplo de caminho:

```txt
reminders/{reminderId}
```

## Campos do documento de lembrete

Cada documento de lembrete possui os principais campos:

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

Exemplo conceitual:

```json
{
  "userId": "firebase-user-id",
  "taskId": "task-id",
  "title": "Tomar remédio",
  "description": "Tomar o remédio da pressão",
  "date": "2026-07-10",
  "time": "08:00",
  "completed": false,
  "recurrence": "daily",
  "recurrenceEndDate": "2026-07-20",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

## Recorrência no Firestore

O campo:

```txt
recurrence
```

pode ter os seguintes valores:

```txt
none
daily
weekly
monthly
```

O campo:

```txt
recurrenceEndDate
```

é opcional e representa a data final da recorrência.

Formato:

```txt
YYYY-MM-DD
```

## Compatibilidade com lembretes antigos

Lembretes criados antes da recorrência podem não ter o campo:

```txt
recurrence
```

O mapper trata isso como:

```txt
none
```

Assim, lembretes antigos continuam funcionando como lembretes únicos.

## ReminderFirestoreMapper

Arquivo:

```txt
src/reminders/mappers/ReminderFirestoreMapper.ts
```

O `ReminderFirestoreMapper` converte a entidade `Reminder` do `core` para o formato esperado pelo Firestore.

Também converte documentos do Firestore de volta para `Reminder`.

O domínio usa:

```txt
Date
```

O Firestore usa:

```txt
Timestamp
```

Por isso o mapper converte:

```txt
createdAt
updatedAt
completedAt
```

O Firestore não aceita `undefined`.

Por isso campos opcionais como:

```txt
taskId
description
time
recurrenceEndDate
completedAt
```

só são enviados quando existirem.

## FirebaseReminderRepository

Arquivo:

```txt
src/reminders/repositories/FirebaseReminderRepository.ts
```

O `FirebaseReminderRepository` implementa o contrato `ReminderRepository`.

Ele possui os métodos:

```txt
create
findById
listByUserId
update
```

### create

Salva um novo lembrete no Firestore.

```ts
await reminderRepository.create(reminder);
```

Internamente usa:

```txt
setDoc
```

### findById

Busca um lembrete pelo ID.

```ts
const reminder = await reminderRepository.findById(reminderId);
```

Se o lembrete não existir, retorna:

```txt
null
```

### listByUserId

Lista lembretes de um usuário específico.

```ts
const reminders = await reminderRepository.listByUserId(userId);
```

Internamente usa query com:

```txt
where("userId", "==", userId)
```

Isso garante que o app carregue apenas lembretes do usuário logado.

### update

Atualiza um lembrete existente.

```ts
await reminderRepository.update(reminder);
```

Internamente usa:

```txt
updateDoc
```

## Firestore

Atualmente o pacote usa quatro coleções principais:

```txt
tasks
userPreferences
userProfiles
reminders
```

## Segurança do Firestore

As regras do Firestore devem garantir que cada usuário acesse apenas os próprios dados.

Regra atual recomendada:

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
  }
}
```

## O que essas regras garantem

Para tarefas:

1. Somente usuários autenticados podem criar tarefas.
2. O usuário só pode criar tarefas para o próprio `uid`.
3. O usuário só pode ler tarefas que pertencem a ele.
4. O usuário só pode atualizar tarefas que pertencem a ele.
5. O usuário não consegue transferir uma tarefa para outro `userId`.
6. O usuário só pode excluir tarefas que pertencem a ele.

Para preferências:

1. Somente usuários autenticados podem criar preferências.
2. O documento de preferências precisa ter o ID igual ao `uid` do usuário.
3. O campo `userId` precisa ser igual ao `uid` do usuário.
4. O usuário só pode ler as próprias preferências.
5. O usuário só pode atualizar as próprias preferências.

Para perfil:

1. Somente usuários autenticados podem criar perfil.
2. O documento de perfil precisa ter o ID igual ao `uid` do usuário.
3. O campo `userId` precisa ser igual ao `uid` do usuário.
4. O usuário só pode ler o próprio perfil.
5. O usuário só pode atualizar o próprio perfil.

Para lembretes:

1. Somente usuários autenticados podem criar lembretes.
2. O usuário só pode criar lembretes para o próprio `uid`.
3. O usuário só pode ler lembretes que pertencem a ele.
4. O usuário só pode atualizar lembretes que pertencem a ele.
5. O usuário não consegue transferir lembretes para outro `userId`.
6. O usuário só pode excluir lembretes que pertencem a ele.

## Observação importante sobre read em documentos por usuário

A regra de leitura de preferências é:

```js
allow read: if request.auth != null
  && request.auth.uid == userId;
```

A regra de leitura de perfil segue a mesma ideia:

```js
allow read: if request.auth != null
  && request.auth.uid == userId;
```

Elas não usam:

```js
resource.data.userId;
```

porque, quando o documento ainda não existe, o Firestore não tem `resource.data`.

Esse detalhe permite que o app consulte um documento inexistente, receba `null` e depois crie o documento padrão via caso de uso do `core`.

## Exports

O arquivo principal do pacote fica em:

```txt
src/index.ts
```

Ele exporta:

```ts
export {
  createFirebaseApp,
  createFirebaseAuth,
  createFirebaseServices,
  createFirestoreDatabase,
  type FirebaseConfig,
} from "./config/firebase";

export * from "./auth";
export * from "./tasks";
export * from "./preferences";
export * from "./profile";
export * from "./reminders";
```

## Exports do módulo reminders

Arquivo:

```txt
src/reminders/index.ts
```

```ts
export { FirebaseReminderRepository } from "./repositories/FirebaseReminderRepository";
```

## Exemplo completo no Web

Exemplo de configuração no app Web:

```ts
import {
  FirebaseAuthService,
  FirebaseTaskRepository,
  FirebaseUserPreferencesRepository,
  FirebaseUserProfileRepository,
  FirebaseReminderRepository,
  createFirebaseServices,
} from "@helpsenior/firebase";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseServices = createFirebaseServices(firebaseConfig);

export const db = firebaseServices.db;
export const auth = firebaseServices.auth;

export const authService = new FirebaseAuthService(auth);

export const taskRepository = new FirebaseTaskRepository(db);

export const userPreferencesRepository = new FirebaseUserPreferencesRepository(
  db,
);

export const userProfileRepository = new FirebaseUserProfileRepository(db);

export const reminderRepository = new FirebaseReminderRepository(db);
```

## Exemplo com lembrete recorrente

```ts
import {
  CompleteReminderUseCase,
  CreateReminderUseCase,
  ListRemindersUseCase,
} from "@helpsenior/core";
import { FirebaseReminderRepository } from "@helpsenior/firebase";

const reminderRepository = new FirebaseReminderRepository(db);

const createReminderUseCase = new CreateReminderUseCase(reminderRepository);
const listRemindersUseCase = new ListRemindersUseCase(reminderRepository);
const completeReminderUseCase = new CompleteReminderUseCase(reminderRepository);

const { reminder } = await createReminderUseCase.execute({
  userId: user.id,
  title: "Tomar remédio",
  description: "Tomar o remédio da pressão",
  date: "2026-07-10",
  time: "08:00",
  recurrence: "daily",
  recurrenceEndDate: "2026-07-20",
});

await completeReminderUseCase.execute({
  reminderId: reminder.id,
});
```

## TypeScript

O pacote usa TypeScript em modo estrito.

## Boas práticas aplicadas

### Imports de tipo

Tipos devem ser importados com `import type`.

Exemplo:

```ts
import type { Firestore } from "firebase/firestore";
```

Isso evita erros com `verbatimModuleSyntax`.

### Sem parameter properties

Evite constructor assim:

```ts
constructor(private readonly db: Firestore) {}
```

Prefira:

```ts
private readonly db: Firestore;

constructor(db: Firestore) {
  this.db = db;
}
```

Isso mantém compatibilidade com configurações mais rígidas do TypeScript, como `erasableSyntaxOnly`.

### Sem undefined no Firestore

Não envie campos `undefined` para o Firestore.

Prefira montar objetos condicionalmente:

```ts
if (reminder.time) {
  firestoreReminder.time = reminder.time;
}
```

## Scripts disponíveis

No `packages/firebase/package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

## Typecheck

Rodar typecheck apenas do pacote Firebase:

```bash
pnpm --filter @helpsenior/firebase typecheck
```

Rodar typecheck geral do monorepo:

```bash
pnpm typecheck
```

Rodar typecheck sem cache do Turbo:

```bash
pnpm typecheck --force
```

## Dependências

O pacote depende de:

```txt
firebase
@helpsenior/core
```

## Estado atual

O pacote `@helpsenior/firebase` atualmente possui:

- configuração Firebase;
- criação de Firebase App;
- criação de Firebase Auth;
- criação de Cloud Firestore;
- serviço de autenticação;
- suporte a cadastro com e-mail e senha;
- suporte a login com e-mail e senha;
- suporte a logout;
- observador de estado de autenticação;
- repositório Firebase para tarefas;
- mapper de tarefas para Firestore;
- repositório Firebase para preferências;
- mapper de preferências para Firestore;
- repositório Firebase para perfil;
- mapper de perfil para Firestore;
- repositório Firebase para lembretes;
- mapper de lembretes para Firestore;
- suporte a lembretes recorrentes;
- suporte aos campos `recurrence` e `recurrenceEndDate`;
- compatibilidade com lembretes antigos sem campo `recurrence`;
- integração com contratos do `@helpsenior/core`;
- suporte à coleção `tasks`;
- suporte à coleção `userPreferences`;
- suporte à coleção `userProfiles`;
- suporte à coleção `reminders`;
- regras recomendadas do Firestore documentadas.

## Limitações atuais

O pacote ainda não possui:

- Firebase Storage;
- Firebase Cloud Messaging;
- Firebase Functions;
- suporte a login social;
- suporte a redefinição de senha;
- paginação de tarefas;
- paginação de lembretes;
- ordenação via query no Firestore;
- tratamento especializado de erros Firebase;
- testes automatizados próprios;
- suporte offline customizado;
- camada de analytics.

## Próximas evoluções

As próximas evoluções recomendadas são:

1. Criar tratamento especializado para erros de autenticação.
2. Adicionar método de recuperação de senha.
3. Adicionar paginação ou ordenação nas tarefas.
4. Adicionar paginação ou ordenação nos lembretes.
5. Criar testes de integração com emuladores Firebase.
6. Avaliar uso futuro de Firebase Storage.
7. Avaliar uso futuro de Cloud Messaging para lembretes.
8. Avaliar uso futuro de Cloud Functions.
