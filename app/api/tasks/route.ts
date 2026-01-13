/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { dataStoreAPI } from '@/lib/data'
import type { Task, TaskFormData } from '@/types/task'

export async function GET() {
  try {
    const tasks = dataStoreAPI.getAllTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TaskFormData = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.priority || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newTask: Omit<Task, 'id' | 'createdAt' | 'subtasks'> = {
      title: body.title,
      description: body.description,
      priority: body.priority,
      dueDate: body.dueDate,
      status: 'todo',
      completed: false,
    }

    const task = dataStoreAPI.createTask(newTask)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

