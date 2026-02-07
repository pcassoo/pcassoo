export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskInput = Pick<Task, "title" | "description" | "priority">;
export type UpdateTaskInput = Partial<Pick<Task, "title" | "description" | "status" | "priority">>;

// In-memory store (resets on cold start — suitable for demo/prototyping)
const tasks: Map<string, Task> = new Map();

let counter = 0;
function generateId(): string {
  counter++;
  return `task_${Date.now()}_${counter}`;
}

// Seed some example tasks
function seed() {
  const samples: CreateTaskInput[] = [
    { title: "Set up project repository", description: "Initialize the repo with Next.js and configure CI.", priority: "high" },
    { title: "Design database schema", description: "Define tables for users, tasks, and projects.", priority: "medium" },
    { title: "Write API documentation", description: "Document all REST endpoints with example requests.", priority: "low" },
  ];
  for (const s of samples) {
    createTask(s);
  }
  // Mark the first one as done for variety
  const first = Array.from(tasks.values())[0];
  if (first) {
    first.status = "done";
    first.updatedAt = new Date().toISOString();
  }
}

seed();

export function getAllTasks(): Task[] {
  return Array.from(tasks.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTaskById(id: string): Task | undefined {
  return tasks.get(id);
}

export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: generateId(),
    title: input.title,
    description: input.description,
    status: "todo",
    priority: input.priority,
    createdAt: now,
    updatedAt: now,
  };
  tasks.set(task.id, task);
  return task;
}

export function updateTask(id: string, input: UpdateTaskInput): Task | null {
  const task = tasks.get(id);
  if (!task) return null;
  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = input.description;
  if (input.status !== undefined) task.status = input.status;
  if (input.priority !== undefined) task.priority = input.priority;
  task.updatedAt = new Date().toISOString();
  return task;
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}
