export type Decision = {
  id: string;
  title: string;
  context: string;
  options: string[];
  outcome?: string;
  createdAt: string;
  decidedAt?: string;
};
