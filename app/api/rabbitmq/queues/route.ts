import { NextRequest, NextResponse } from 'next/server'
import { RabbitMQApiClient } from '@/lib/rabbitmq'
import type { CreateQueueRequest, ApiResponse } from '@/types/api'

const DEFAULT_VHOST = process.env.RABBITMQ_VHOST || '/'

export async function GET() {
  try {
    const topology = await RabbitMQApiClient.getTopology()
    
    const response: ApiResponse = {
      success: true,
      data: topology.queues,
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch queues:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch queues',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateQueueRequest = await request.json()
    
    // Validate required fields
    if (!body.name) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields',
        message: 'Queue name is required',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await RabbitMQApiClient.createQueue(DEFAULT_VHOST, body)
    
    const response: ApiResponse = {
      success: true,
      message: `Queue '${body.name}' created successfully`,
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Failed to create queue:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create queue',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}