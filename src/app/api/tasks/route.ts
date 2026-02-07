import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, createTask, type CreateTaskInput } from "@/lib/tasks";

export async function GET() {
  const tasks = getAllTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json() as CreateTaskInput;

  if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const validPriorities = ["low", "medium", "high"];
  if (!body.priority || !validPriorities.includes(body.priority)) {
    return NextResponse.json({ error: "Priority must be low, medium, or high" }, { status: 400 });
  }

  const task = createTask({
    title: body.title.trim(),
    description: (body.description ?? "").trim(),
    priority: body.priority,
  });

  return NextResponse.json(task, { status: 201 });
}
