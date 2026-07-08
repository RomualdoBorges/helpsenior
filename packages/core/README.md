# @helpsenior/core

Pacote de domínio do HelpSenior.

Este pacote contém a lógica principal da aplicação: entidades, contratos de repositório, casos de uso, regras de negócio e testes automatizados.

O `@helpsenior/core` não depende de React, Firebase, banco de dados, CSS, Tailwind ou qualquer tecnologia de interface.

Ele representa o núcleo da aplicação.

## Objetivo

O objetivo do `@helpsenior/core` é concentrar as regras de negócio do HelpSenior em uma camada independente.

Essa separação permite que a mesma lógica seja usada em diferentes interfaces, como:

```txt
apps/web
apps/mobile
futuros painéis administrativos
outros clientes
```

O pacote define o que a aplicação faz, sem saber como os dados são exibidos ou persistidos.

## Responsabilidades

O `@helpsenior/core` é responsável por:

- definir entidades de domínio;
- definir contratos de repositório;
- implementar casos de uso;
- validar regras de negócio;
- manter regras independentes de infraestrutura;
- fornecer testes unitários da lógica principal.

## O que não fica no core

Este pacote não deve conter:

- componentes React;
- hooks React;
- código Firebase;
- código Firestore;
- código de autenticação Firebase;
- estilos CSS;
- Tailwind;
- regras de tela;
- chamadas HTTP diretas;
- lógica específica de navegador.

Essas responsabilidades pertencem a outros pacotes ou aplicações.

## Relação com outros pacotes

O monorepo do HelpSenior usa o `core` como base da aplicação.

```txt
@helpsenior/core
        ↓
@helpsenior/firebase
        ↓
apps/web
```

## Estrutura atual

```txt
packages/core/
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    │
    ├── tasks/
    │   ├── entities/
    │   │   └── Task.ts
    │   ├── repositories/
    │   │   └── TaskRepository.ts
    │   ├── in-memory/
    │   │   └── InMemoryTaskRepository.ts
    │   ├── use-cases/
    │   │   ├── CreateTaskUseCase.ts
    │   │   ├── ListTasksUseCase.ts
    │   │   ├── CompleteTaskUseCase.ts
    │   │   ├── CompleteTaskStepUseCase.ts
    │   │   └── __tests__/
    │   └── index.ts
    │
    ├── preferences/
    │   ├── entities/
    │   │   └── UserPreferences.ts
    │   ├── repositories/
    │   │   └── UserPreferencesRepository.ts
    │   ├── in-memory/
    │   │   └── InMemoryUserPreferencesRepository.ts
    │   ├── use-cases/
    │   │   ├── GetUserPreferencesUseCase.ts
    │   │   ├── UpdateUserPreferencesUseCase.ts
    │   │   └── __tests__/
    │   └── index.ts
    │
    ├── profile/
    │   ├── entities/
    │   │   └── UserProfile.ts
    │   ├── repositories/
    │   │   └── UserProfileRepository.ts
    │   ├── in-memory/
    │   │   └── InMemoryUserProfileRepository.ts
    │   ├── use-cases/
    │   │   ├── GetUserProfileUseCase.ts
    │   │   ├── UpdateUserProfileUseCase.ts
    │   │   └── __tests__/
    │   └── index.ts
    │
    └── reminders/
        ├── entities/
        │   └── Reminder.ts
        ├── repositories/
        │   └── ReminderRepository.ts
        ├── in-memory/
        │   └── InMemoryReminderRepository.ts
        ├── use-cases/
        │   ├── CreateReminderUseCase.ts
        │   ├── ListRemindersUseCase.ts
        │   ├── CompleteReminderUseCase.ts
        │   └── __tests__/
        ├── utils/
        │   └── calculateNextReminderDate.ts
        └── index.ts
```

## Módulos

Atualmente o `@helpsenior/core` possui quatro módulos principais:

```txt
tasks
preferences
profile
reminders
```

## Decisão de produto

O HelpSenior separa claramente tarefa e lembrete:

```txt
Tarefa = o que precisa ser feito
Etapas = como fazer
Lembrete = quando avisar e repetir
```

Por isso, tarefas **não possuem recorrência**.

A recorrência fica apenas no módulo de lembretes.

Essa decisão deixa a experiência mais simples para o usuário, principalmente no contexto de acessibilidade para pessoas idosas.

## Módulo tasks

O módulo `tasks` representa as tarefas do usuário.

Uma tarefa pode ser simples:

```txt
Tomar remédio
```

Pode ter uma data:

```txt
Ir ao médico
Data: 2026-07-10
```

Ou pode ser guiada por etapas:

```txt
Tomar remédio

1. Pegar o remédio
2. Conferir o horário
3. Tomar com água
```

As etapas são opcionais e servem para dividir uma tarefa em passos menores.

## Entidade Task

Arquivo:

```txt
src/tasks/entities/Task.ts
```

```ts
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  completed: boolean;
  completedAt?: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  steps: TaskStep[];
  status: TaskStatus;
  completed: boolean;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

## Campos principais de Task

```txt
id
```

Identificador único da tarefa.

```txt
userId
```

Identificador do usuário dono da tarefa.

```txt
title
```

Título da tarefa.

```txt
description
```

Descrição opcional da tarefa.

```txt
steps
```

Lista opcional de etapas da tarefa.

```txt
status
```

Status atual da tarefa:

```txt
pending
in_progress
completed
```

```txt
completed
```

Indica se a tarefa foi concluída.

```txt
date
```

Data opcional da tarefa no formato:

```txt
YYYY-MM-DD
```

```txt
createdAt
```

Data de criação da tarefa.

```txt
updatedAt
```

Data da última atualização.

```txt
completedAt
```

Data de conclusão, quando a tarefa estiver concluída.

## Entidade TaskStep

A etapa da tarefa faz parte da entidade `Task`.

Campos principais:

```txt
id
title
description
order
completed
completedAt
```

Exemplo de uso:

```txt
Tarefa: Preparar café

Etapas:
1. Colocar água
2. Colocar pó
3. Ligar a cafeteira
```

## Contrato TaskRepository

Arquivo:

```txt
src/tasks/repositories/TaskRepository.ts
```

```ts
import type { Task } from "../entities/Task";

export interface TaskRepository {
  create(task: Task): Promise<void>;
  findById(taskId: string): Promise<Task | null>;
  listByUserId(userId: string): Promise<Task[]>;
  update(task: Task): Promise<void>;
}
```

O `core` não sabe onde a tarefa será salva.

A persistência pode ser feita em:

```txt
Firestore
API REST
banco SQL
memória
outra infraestrutura
```

## Casos de uso de tarefas

O módulo `tasks` possui quatro casos de uso principais:

```txt
CreateTaskUseCase
ListTasksUseCase
CompleteTaskUseCase
CompleteTaskStepUseCase
```

## CreateTaskUseCase

Cria uma tarefa.

Valida:

- usuário obrigatório;
- título obrigatório;
- descrição opcional;
- etapas opcionais;
- data opcional;
- status inicial como `pending`;
- `completed` inicial como `false`.

Campos aceitos:

```txt
userId
title
description
steps
date
```

## ListTasksUseCase

Lista tarefas de um usuário.

Valida:

- usuário obrigatório.

## CompleteTaskUseCase

Conclui uma tarefa inteira.

Ao concluir:

- o status vira `completed`;
- `completed` vira `true`;
- todas as etapas também são concluídas;
- `updatedAt` é atualizado;
- `completedAt` é preenchido.

Saída:

```ts
{
  task: Task;
}
```

## CompleteTaskStepUseCase

Conclui uma etapa individual.

Ao concluir uma etapa:

- a etapa vira concluída;
- se ainda houver etapas pendentes, a tarefa fica `in_progress`;
- se todas forem concluídas, a tarefa vira `completed`;
- `updatedAt` é atualizado;
- `completedAt` é preenchido quando a tarefa inteira é concluída.

Saída:

```ts
{
  task: Task;
}
```

## Módulo preferences

O módulo `preferences` representa as preferências de acessibilidade do usuário.

As preferências atuais são:

```txt
fontSize
contrast
simpleMode
reduceMotion
increasedSpacing
```

## Entidade UserPreferences

Arquivo:

```txt
src/preferences/entities/UserPreferences.ts
```

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

## Preferências padrão

Quando um usuário ainda não possui preferências salvas, o core cria preferências padrão:

```txt
fontSize: medium
contrast: default
simpleMode: false
reduceMotion: false
increasedSpacing: false
```

## Contrato UserPreferencesRepository

Arquivo:

```txt
src/preferences/repositories/UserPreferencesRepository.ts
```

```ts
import type { UserPreferences } from "../entities/UserPreferences";

export interface UserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  save(preferences: UserPreferences): Promise<void>;
}
```

## Casos de uso de preferências

O módulo `preferences` possui dois casos de uso principais:

```txt
GetUserPreferencesUseCase
UpdateUserPreferencesUseCase
```

### GetUserPreferencesUseCase

Busca as preferências de um usuário.

Se ainda não existirem:

- cria preferências padrão;
- salva no repositório;
- retorna as preferências criadas.

### UpdateUserPreferencesUseCase

Atualiza preferências de acessibilidade.

A atualização é parcial. É possível atualizar apenas um campo sem alterar os demais.

## Módulo profile

O módulo `profile` representa o perfil básico do usuário.

Ele permite guardar informações como:

```txt
name
email
phone
birthDate
createdAt
updatedAt
```

## Entidade UserProfile

Arquivo:

```txt
src/profile/entities/UserProfile.ts
```

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

## Perfil padrão

Quando um usuário ainda não possui perfil salvo, o core cria um perfil padrão.

```ts
export function createDefaultUserProfile(input: {
  userId: string;
  email: string | null;
}): UserProfile {
  const now = new Date();

  return {
    userId: input.userId,
    name: "",
    email: input.email,
    createdAt: now,
    updatedAt: now,
  };
}
```

## Contrato UserProfileRepository

Arquivo:

```txt
src/profile/repositories/UserProfileRepository.ts
```

```ts
import type { UserProfile } from "../entities/UserProfile";

export interface UserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
```

## Casos de uso de perfil

O módulo `profile` possui dois casos de uso principais:

```txt
GetUserProfileUseCase
UpdateUserProfileUseCase
```

### GetUserProfileUseCase

Busca o perfil de um usuário.

Se ainda não existir:

- cria perfil padrão;
- salva no repositório;
- retorna o perfil criado.

### UpdateUserProfileUseCase

Atualiza o perfil do usuário.

A atualização é parcial. É possível atualizar apenas:

```txt
name
phone
birthDate
```

O e-mail vem do usuário autenticado.

## Módulo reminders

O módulo `reminders` representa os lembretes do usuário.

Ele permite criar lembretes com data, horário e recorrência para compromissos, tarefas e atividades importantes.

Exemplos:

```txt
Tomar remédio às 08:00
Consulta médica dia 20/07 às 14:30
Pagar conta todo mês no dia 10
Fazer caminhada toda semana
Medir pressão todos os dias
```

Um lembrete pode estar vinculado a uma tarefa por meio do campo opcional `taskId`, mas também pode existir de forma independente.

## Recorrência de lembretes

O módulo de lembretes suporta recorrência simples.

Os tipos atuais são:

```txt
none
daily
weekly
monthly
```

### none

Lembrete único, sem repetição.

### daily

Cria o próximo lembrete para o dia seguinte.

### weekly

Cria o próximo lembrete para 7 dias depois.

### monthly

Cria o próximo lembrete para o mês seguinte.

Quando o dia não existe no mês seguinte, o sistema usa o último dia válido do mês.

Exemplo:

```txt
2026-01-31
        ↓
2026-02-28
```

## Regra de criação do próximo lembrete

Ao concluir um lembrete recorrente:

```txt
1. o lembrete atual é marcado como concluído
2. o sistema calcula a próxima data
3. um novo lembrete é criado automaticamente
```

Exemplo:

```txt
Tomar remédio
Data: 2026-07-10
Horário: 08:00
Recorrência: daily
```

Ao concluir, o sistema cria:

```txt
Tomar remédio
Data: 2026-07-11
Horário: 08:00
Recorrência: daily
```

## Data final da recorrência

Um lembrete recorrente pode ter uma data final:

```txt
recurrenceEndDate
```

Se a próxima data calculada for maior que a data final, o próximo lembrete não é criado.

## Entidade Reminder

Arquivo:

```txt
src/reminders/entities/Reminder.ts
```

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

## Contrato ReminderRepository

Arquivo:

```txt
src/reminders/repositories/ReminderRepository.ts
```

```ts
import type { Reminder } from "../entities/Reminder";

export interface ReminderRepository {
  create(reminder: Reminder): Promise<void>;
  findById(reminderId: string): Promise<Reminder | null>;
  listByUserId(userId: string): Promise<Reminder[]>;
  update(reminder: Reminder): Promise<void>;
}
```

## Utilitário calculateNextReminderDate

Arquivo:

```txt
src/reminders/utils/calculateNextReminderDate.ts
```

Esse utilitário calcula a próxima data de um lembrete recorrente.

Regras:

```txt
none    → null
daily   → +1 dia
weekly  → +7 dias
monthly → +1 mês
```

## Casos de uso de lembretes

O módulo `reminders` possui três casos de uso principais:

```txt
CreateReminderUseCase
ListRemindersUseCase
CompleteReminderUseCase
```

### CreateReminderUseCase

Cria um novo lembrete.

Valida:

- usuário obrigatório;
- título obrigatório;
- data obrigatória.

Ao criar um lembrete:

- gera um `id`;
- define `completed` como `false`;
- define `recurrence` como `none` quando não for informado;
- preenche `createdAt`;
- preenche `updatedAt`.

### ListRemindersUseCase

Lista os lembretes de um usuário.

Valida:

- usuário obrigatório.

### CompleteReminderUseCase

Conclui um lembrete.

Valida:

- lembrete obrigatório;
- existência do lembrete.

Ao concluir:

- `completed` vira `true`;
- `updatedAt` é atualizado;
- `completedAt` é preenchido;
- se o lembrete for recorrente, cria o próximo lembrete automaticamente;
- se existir `recurrenceEndDate`, respeita a data final da recorrência.

Saída:

```ts
{
  reminder: Reminder;
  nextReminder: Reminder | null;
}
```

## Exports

O arquivo principal do pacote fica em:

```txt
src/index.ts
```

```ts
export * from "./tasks";
export * from "./preferences";
export * from "./profile";
export * from "./reminders";
```

## Exports do módulo tasks

Arquivo:

```txt
src/tasks/index.ts
```

```ts
export type { Task, TaskStatus, TaskStep } from "./entities/Task";

export type { TaskRepository } from "./repositories/TaskRepository";

export { InMemoryTaskRepository } from "./in-memory/InMemoryTaskRepository";

export { CreateTaskUseCase } from "./use-cases/CreateTaskUseCase";
export type {
  CreateTaskUseCaseInput,
  CreateTaskUseCaseOutput,
} from "./use-cases/CreateTaskUseCase";

export { ListTasksUseCase } from "./use-cases/ListTasksUseCase";

export { CompleteTaskUseCase } from "./use-cases/CompleteTaskUseCase";
export type {
  CompleteTaskUseCaseInput,
  CompleteTaskUseCaseOutput,
} from "./use-cases/CompleteTaskUseCase";

export { CompleteTaskStepUseCase } from "./use-cases/CompleteTaskStepUseCase";
export type {
  CompleteTaskStepUseCaseInput,
  CompleteTaskStepUseCaseOutput,
} from "./use-cases/CompleteTaskStepUseCase";
```

## Exports do módulo reminders

Arquivo:

```txt
src/reminders/index.ts
```

```ts
export type { Reminder, ReminderRecurrence } from "./entities/Reminder";

export type { ReminderRepository } from "./repositories/ReminderRepository";

export { InMemoryReminderRepository } from "./in-memory/InMemoryReminderRepository";

export { CreateReminderUseCase } from "./use-cases/CreateReminderUseCase";
export type {
  CreateReminderUseCaseInput,
  CreateReminderUseCaseOutput,
} from "./use-cases/CreateReminderUseCase";

export { ListRemindersUseCase } from "./use-cases/ListRemindersUseCase";

export { CompleteReminderUseCase } from "./use-cases/CompleteReminderUseCase";
export type {
  CompleteReminderUseCaseInput,
  CompleteReminderUseCaseOutput,
} from "./use-cases/CompleteReminderUseCase";

export { calculateNextReminderDate } from "./utils/calculateNextReminderDate";
```

## Testes

O pacote usa Vitest para testes unitários.

Os testes ficam próximos dos casos de uso:

```txt
src/tasks/use-cases/__tests__
src/preferences/use-cases/__tests__
src/profile/use-cases/__tests__
src/reminders/use-cases/__tests__
```

## Testes de tarefas

O módulo `tasks` possui testes para:

```txt
CreateTaskUseCase
ListTasksUseCase
CompleteTaskUseCase
CompleteTaskStepUseCase
```

Os testes verificam:

- criação de tarefa;
- criação de tarefa com descrição;
- criação de tarefa com data;
- criação de tarefa com etapas;
- validação de usuário obrigatório;
- validação de título obrigatório;
- listagem por usuário;
- conclusão de tarefa;
- conclusão de todas as etapas ao concluir tarefa;
- conclusão de etapa individual;
- tarefa em andamento quando apenas parte das etapas foi concluída;
- tarefa concluída quando todas as etapas foram concluídas;
- preservação da data da tarefa;
- erro quando a tarefa não existe;
- erro quando a etapa não existe.

## Testes de lembretes

O módulo `reminders` possui testes para:

```txt
CreateReminderUseCase
ListRemindersUseCase
CompleteReminderUseCase
```

Os testes verificam:

- criação de lembrete;
- criação de lembrete vinculado a uma tarefa;
- criação de lembrete sem recorrência;
- criação de lembrete diário;
- criação de lembrete semanal;
- criação de lembrete mensal;
- criação de lembrete com data final de recorrência;
- validação de usuário obrigatório;
- validação de título obrigatório;
- validação de data obrigatória;
- listagem por usuário;
- retorno vazio quando o usuário não tem lembretes;
- conclusão de lembrete;
- erro quando o lembrete não existe;
- criação automática do próximo lembrete diário;
- criação automática do próximo lembrete semanal;
- criação automática do próximo lembrete mensal;
- respeito ao último dia válido do mês;
- respeito à data final da recorrência;
- preservação do `taskId` no próximo lembrete recorrente.

## Rodando os testes

Na raiz do monorepo:

```bash
pnpm --filter @helpsenior/core test
```

Para rodar em modo watch:

```bash
pnpm --filter @helpsenior/core test:watch
```

## Typecheck

Rodar typecheck apenas do pacote core:

```bash
pnpm --filter @helpsenior/core typecheck
```

Rodar typecheck geral do monorepo:

```bash
pnpm typecheck
```

Rodar typecheck geral sem cache do Turbo:

```bash
pnpm typecheck --force
```

## Exemplo de uso com tarefa com etapas

```ts
import {
  CompleteTaskStepUseCase,
  CreateTaskUseCase,
  InMemoryTaskRepository,
  ListTasksUseCase,
} from "@helpsenior/core";

const repository = new InMemoryTaskRepository();

const createTaskUseCase = new CreateTaskUseCase(repository);
const listTasksUseCase = new ListTasksUseCase(repository);
const completeTaskStepUseCase = new CompleteTaskStepUseCase(repository);

const { task } = await createTaskUseCase.execute({
  userId: "user-1",
  title: "Tomar remédio",
  description: "Tomar o remédio da pressão após o café.",
  date: "2026-07-10",
  steps: [
    {
      title: "Pegar o remédio",
    },
    {
      title: "Conferir o nome",
    },
    {
      title: "Tomar com água",
    },
  ],
});

await completeTaskStepUseCase.execute({
  taskId: task.id,
  stepId: task.steps[0]!.id,
});

const { tasks } = await listTasksUseCase.execute({
  userId: "user-1",
});
```

## Exemplo de uso com lembrete recorrente

```ts
import {
  CompleteReminderUseCase,
  CreateReminderUseCase,
  InMemoryReminderRepository,
  ListRemindersUseCase,
} from "@helpsenior/core";

const repository = new InMemoryReminderRepository();

const createReminderUseCase = new CreateReminderUseCase(repository);
const listRemindersUseCase = new ListRemindersUseCase(repository);
const completeReminderUseCase = new CompleteReminderUseCase(repository);

const { reminder } = await createReminderUseCase.execute({
  userId: "user-1",
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

const { reminders } = await listRemindersUseCase.execute({
  userId: "user-1",
});
```

## Regras importantes

O `core` deve permanecer independente.

Evite adicionar dependências como:

```txt
react
react-dom
firebase
firebase-admin
axios
tailwindcss
vite
```

O `core` deve continuar podendo ser testado isoladamente.

## Estado atual

O pacote `@helpsenior/core` atualmente possui:

- TypeScript;
- Vitest;
- módulo de tarefas;
- tarefas com etapas opcionais;
- tarefas com data opcional;
- módulo de preferências de acessibilidade;
- módulo de perfil do usuário;
- módulo de lembretes;
- lembretes recorrentes;
- entidade `Task`;
- entidade `TaskStep`;
- tipo `TaskStatus`;
- entidade `UserPreferences`;
- entidade `UserProfile`;
- entidade `Reminder`;
- tipo `ReminderRecurrence`;
- contrato `TaskRepository`;
- contrato `UserPreferencesRepository`;
- contrato `UserProfileRepository`;
- contrato `ReminderRepository`;
- repositórios em memória para testes;
- casos de uso testáveis;
- utilitário `calculateNextReminderDate`;
- testes unitários;
- testes unitários para tarefas;
- testes unitários para recorrência de lembretes;
- exports públicos organizados por módulo;
- independência de React;
- independência de Firebase;
- independência de UI.

## Limitações atuais

O pacote ainda não possui:

- módulo de notificações externas;
- recorrência personalizada por dias da semana nos lembretes;
- recorrência anual nos lembretes;
- intervalos customizados nos lembretes;
- regras de compartilhamento de tarefas;
- validações avançadas de data e horário;
- internacionalização;
- value objects.

## Próximas evoluções

As próximas evoluções recomendadas são:

1. Criar recorrência personalizada por dias da semana nos lembretes.
2. Criar value objects para validações mais fortes.
3. Criar testes para regras avançadas de recorrência.
4. Preparar contratos para notificações futuras.
5. Reavaliar entidades conforme o app mobile evoluir.