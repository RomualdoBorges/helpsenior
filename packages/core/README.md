# @helpsenior/core

Pacote de domínio do HelpSenior.

Este pacote concentra entidades, contratos de repositório, casos de uso, regras de negócio e testes unitários. Ele não depende de React, Firebase, Firestore, navegador, CSS ou Tailwind.

## Responsabilidades

- definir entidades de domínio;
- definir contratos de repositório;
- implementar casos de uso;
- manter regras de negócio independentes de infraestrutura;
- fornecer implementações em memória para testes;
- cobrir a lógica principal com Vitest.

## Módulos

```txt
tasks
reminders
preferences
profile
```

## Decisão de produto

```txt
Tarefa = o que precisa ser feito
Lembrete = quando avisar e repetir
```

Por isso, tarefas não possuem recorrência. Recorrência pertence somente aos lembretes.

## Estrutura

```txt
packages/core/src/
├── index.ts
├── tasks/
│   ├── entities/
│   ├── in-memory/
│   ├── repositories/
│   ├── use-cases/
│   └── index.ts
├── reminders/
│   ├── entities/
│   ├── in-memory/
│   ├── repositories/
│   ├── use-cases/
│   ├── utils/
│   └── index.ts
├── preferences/
│   ├── entities/
│   ├── in-memory/
│   ├── repositories/
│   ├── use-cases/
│   └── index.ts
└── profile/
    ├── entities/
    ├── in-memory/
    ├── repositories/
    ├── use-cases/
    └── index.ts
```

## Tasks

Entidade principal:

```ts
export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  completed: boolean;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

Contrato:

```ts
export interface TaskRepository {
  create(task: Task): Promise<void>;
  findById(taskId: string): Promise<Task | null>;
  listByUserId(userId: string): Promise<Task[]>;
  update(task: Task): Promise<void>;
  delete(taskId: string): Promise<void>;
}
```

Casos de uso:

```txt
CreateTaskUseCase
ListTasksUseCase
UpdateTaskUseCase
CompleteTaskUseCase
DeleteTaskUseCase
```

Regras principais:

- `userId` e `title` são obrigatórios na criação;
- tarefas nascem como `pending` e `completed: false`;
- `description` e `date` são opcionais;
- atualizar tarefa altera título, descrição, data e `updatedAt`;
- concluir tarefa preenche `completedAt`, marca `completed: true` e muda o status para `completed`;
- excluir tarefa remove pelo `taskId`.

## Reminders

Entidade principal:

```ts
export type ReminderRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface Reminder {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
  recurrence: ReminderRecurrence;
  recurrenceEndDate?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

Contrato:

```ts
export interface ReminderRepository {
  create(reminder: Reminder): Promise<void>;
  findById(reminderId: string): Promise<Reminder | null>;
  listByUserId(userId: string): Promise<Reminder[]>;
  update(reminder: Reminder): Promise<void>;
  delete(reminderId: string): Promise<void>;
}
```

Casos de uso:

```txt
CreateReminderUseCase
ListRemindersUseCase
UpdateReminderUseCase
CompleteReminderUseCase
DeleteReminderUseCase
```

Regras principais:

- `userId`, `title` e `date` são obrigatórios na criação;
- `description`, `time`, `taskId` e `recurrenceEndDate` são opcionais;
- a recorrência padrão é `none`;
- recorrências disponíveis: `none`, `daily`, `weekly`, `monthly`;
- concluir um lembrete marca o item atual como concluído;
- concluir um lembrete recorrente cria o próximo lembrete quando há próxima data válida;
- `calculateNextReminderDate` calcula a próxima data respeitando a data final da recorrência.

## Preferences

Entidade principal:

```ts
export type FontSizePreference = "small" | "medium" | "large" | "extra_large";
export type ContrastPreference = "default" | "high";

export interface UserPreferences {
  userId: string;
  fontSize: FontSizePreference;
  contrast: ContrastPreference;
  simpleMode: boolean;
  reduceMotion: boolean;
  increasedSpacing: boolean;
  updatedAt: Date;
}
```

Preferências padrão:

```txt
fontSize: medium
contrast: default
simpleMode: false
reduceMotion: false
increasedSpacing: false
```

Contrato:

```ts
export interface UserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  save(preferences: UserPreferences): Promise<void>;
}
```

Casos de uso:

```txt
GetUserPreferencesUseCase
UpdateUserPreferencesUseCase
```

## Profile

Entidade principal:

```ts
export interface UserProfile {
  userId: string;
  name: string;
  email: string | null;
  phone?: string;
  birthDate?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Contrato:

```ts
export interface UserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
```

Casos de uso:

```txt
GetUserProfileUseCase
UpdateUserProfileUseCase
```

## Testes

Os testes ficam em `src/**/use-cases/__tests__`.

Para rodar:

```bash
pnpm --filter @helpsenior/core test
```

Para checar tipos:

```bash
pnpm --filter @helpsenior/core typecheck
```
