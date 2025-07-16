import { NextResponse } from 'next/server'
import { RabbitMQApiClient } from '@/lib/rabbitmq'
import type { ApiResponse } from '@/types/api'

export async function GET() {
  try {
    const metrics = await RabbitMQApiClient.getMetrics()
    
    const response: ApiResponse = {
      success: true,
      data: metrics,
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch RabbitMQ overview:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch RabbitMQ overview',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}