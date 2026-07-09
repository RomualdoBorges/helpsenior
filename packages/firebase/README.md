# @helpsenior/firebase

Pacote de infraestrutura Firebase do HelpSenior.

Este pacote isola a comunicação com Firebase Authentication e Cloud Firestore. Ele implementa contratos definidos em `@helpsenior/core` e não concentra regra de negócio principal.

## Responsabilidades

- criar serviços Firebase;
- expor autenticação;
- enviar e-mail de recuperação de senha;
- observar estado de autenticação;
- implementar repositórios Firestore para tarefas, lembretes, preferências e perfil;
- mapear entidades do domínio para documentos do Firestore;
- mapear documentos do Firestore para entidades do domínio;
- remover campos opcionais `undefined` antes de salvar no Firestore.

## Relação com o monorepo

```txt
@helpsenior/core
        ↓
@helpsenior/firebase
        ↓
@helpsenior/web
```

## Estrutura

```txt
packages/firebase/src/
├── index.ts
├── config/
│   └── firebase.ts
├── auth/
│   ├── FirebaseAuthService.ts
│   └── index.ts
├── tasks/
│   ├── mappers/
│   ├── repositories/
│   └── index.ts
├── reminders/
│   ├── mappers/
│   ├── repositories/
│   └── index.ts
├── preferences/
│   ├── mappers/
│   ├── repositories/
│   └── index.ts
└── profile/
    ├── mappers/
    ├── repositories/
    └── index.ts
```

## Configuração Firebase

Arquivo:

```txt
src/config/firebase.ts
```

Exports principais:

```txt
createFirebaseApp
createFirebaseServices
createFirestoreDatabase
createFirebaseAuth
```

`createFirebaseServices` retorna:

```txt
app
auth
db
```

## Autenticação

Serviço:

```txt
FirebaseAuthService
```

Usuário retornado para a aplicação:

```ts
export interface AuthUser {
  id: string;
  email: string | null;
}
```

Métodos:

```txt
signUp
signIn
signOut
resetPassword
onAuthStateChanged
```

Implementação Firebase usada:

```txt
createUserWithEmailAndPassword
signInWithEmailAndPassword
signOut
sendPasswordResetEmail
onAuthStateChanged
```

O `id` do `AuthUser` é o `uid` do Firebase Authentication e é usado como `userId` nas coleções do Firestore.

## Coleções

```txt
tasks
reminders
userPreferences
userProfiles
```

## Tasks

Repositório:

```txt
FirebaseTaskRepository
```

Implementa:

```txt
create
findById
listByUserId
update
delete
```

Coleção:

```txt
tasks
```

Campos principais:

```txt
userId
title
description
status
completed
date
createdAt
updatedAt
completedAt
```

Tarefas não possuem recorrência.

Mapper:

```txt
TaskFirestoreMapper
```

## Reminders

Repositório:

```txt
FirebaseReminderRepository
```

Implementa:

```txt
create
findById
listByUserId
update
delete
```

Coleção:

```txt
reminders
```

Campos principais:

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

Recorrências:

```txt
none
daily
weekly
monthly
```

Mapper:

```txt
ReminderFirestoreMapper
```

## Preferences

Repositório:

```txt
FirebaseUserPreferencesRepository
```

Implementa:

```txt
findByUserId
save
```

Coleção:

```txt
userPreferences
```

Campos principais:

```txt
userId
fontSize
contrast
simpleMode
reduceMotion
increasedSpacing
updatedAt
```

Mapper:

```txt
UserPreferencesFirestoreMapper
```

## Profile

Repositório:

```txt
FirebaseUserProfileRepository
```

Implementa:

```txt
findByUserId
save
```

Coleção:

```txt
userProfiles
```

Campos principais:

```txt
userId
name
email
phone
birthDate
createdAt
updatedAt
```

Mapper:

```txt
UserProfileFirestoreMapper
```

## Consultas por usuário

As listagens de tarefas e lembretes usam filtro por `userId`:

```txt
where("userId", "==", userId)
```

Assim, o app carrega apenas dados pertencentes ao usuário autenticado.

## Scripts

```bash
pnpm --filter @helpsenior/firebase typecheck
```
