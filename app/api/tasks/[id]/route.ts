import { NextRequest, NextResponse } from 'next/server'
import { dataStoreAPI } from '@/lib/data'
import type { Task } from '@/types/task'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = dataStoreAPI.getTaskById(params.id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<Task> = await request.json()
    const task = dataStoreAPI.updateTask(params.id, updates)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = dataStoreAPI.deleteTask(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}

