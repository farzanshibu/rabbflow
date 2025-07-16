import { NextRequest, NextResponse } from 'next/server'
import { RabbitMQApiClient } from '@/lib/rabbitmq'
import type { ApiResponse } from '@/types/api'

const DEFAULT_VHOST = process.env.RABBITMQ_VHOST || '/'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const queueName = decodeURIComponent(params.name)
    
    if (!queueName) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing queue name',
        message: 'Queue name is required',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await RabbitMQApiClient.deleteQueue(DEFAULT_VHOST, queueName)
    
    const response: ApiResponse = {
      success: true,
      message: `Queue '${queueName}' deleted successfully`,
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to delete queue:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete queue',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}