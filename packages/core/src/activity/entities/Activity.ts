export type NecessaryResources = {
  description: string;
};

export type Step = {
  order: number;
  description: string;
};

export interface Activity {
  id: string;
  userId: string;
  title: string;
  steps: Step[];
  resources?: NecessaryResources[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}