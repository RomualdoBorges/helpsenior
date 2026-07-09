export type { Task, TaskStatus } from "./entities/Task";

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

export { DeleteTaskUseCase } from "./use-cases/DeleteTaskUseCase";
export type { DeleteTaskUseCaseInput } from "./use-cases/DeleteTaskUseCase";

export { UpdateTaskUseCase } from "./use-cases/UpdateTaskUseCase";
export type {
  UpdateTaskUseCaseInput,
  UpdateTaskUseCaseOutput,
} from "./use-cases/UpdateTaskUseCase";