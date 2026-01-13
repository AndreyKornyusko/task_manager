import { NextRequest, NextResponse } from 'next/server'
import { dataStoreAPI } from '@/lib/data'
import type { Subtask } from '@/types/task'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId parameter is required' },
        { status: 400 }
      )
    }

    const subtasks = dataStoreAPI.getSubtasksByTaskId(taskId)
    return NextResponse.json(subtasks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.taskId || !body.title) {
      return NextResponse.json(
        { error: 'taskId and title are required' },
        { status: 400 }
      )
    }

    const newSubtask: Omit<Subtask, 'id'> = {
      title: body.title,
      completed: false,
      taskId: body.taskId,
    }

    const subtask = dataStoreAPI.createSubtask(newSubtask)
    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    )
  }
}


