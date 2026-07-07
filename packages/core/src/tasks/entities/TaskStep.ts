export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}
