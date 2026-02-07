import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask, type UpdateTaskInput } from "@/lib/tasks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json() as UpdateTaskInput;

  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim() === "")) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const validStatuses = ["todo", "in_progress", "done"];
  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const validPriorities = ["low", "medium", "high"];
  if (body.priority !== undefined && !validPriorities.includes(body.priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  const task = updateTask(id, body);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteTask(id);
  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
