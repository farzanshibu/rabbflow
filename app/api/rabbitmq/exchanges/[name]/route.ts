import { NextRequest, NextResponse } from 'next/server'
import { RabbitMQApiClient } from '@/lib/rabbitmq'
import type { ApiResponse } from '@/types/api'

const DEFAULT_VHOST = process.env.RABBITMQ_VHOST || '/'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const exchangeName = decodeURIComponent(params.name)
    
    if (!exchangeName) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing exchange name',
        message: 'Exchange name is required',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await RabbitMQApiClient.deleteExchange(DEFAULT_VHOST, exchangeName)
    
    const response: ApiResponse = {
      success: true,
      message: `Exchange '${exchangeName}' deleted successfully`,
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to delete exchange:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete exchange',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}