import { NextRequest, NextResponse } from 'next/server'
import { subtaskRepository } from '@/mongodb/repositories/subtaskRepository'
import type { Subtask } from '@/types/task'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<Subtask> = await request.json()
    const subtask = await subtaskRepository.updateSubtask(params.id, updates)
    if (!subtask) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }
    return NextResponse.json(subtask)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update subtask' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await subtaskRepository.deleteSubtask(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete subtask' },
      { status: 500 }
    )
  }
}


