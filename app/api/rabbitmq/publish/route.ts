import { NextRequest, NextResponse } from 'next/server'
import { RabbitMQApiClient } from '@/lib/rabbitmq'
import type { PublishMessageRequest, ApiResponse } from '@/types/api'

const DEFAULT_VHOST = process.env.RABBITMQ_VHOST || '/'

export async function POST(request: NextRequest) {
  try {
    const body: PublishMessageRequest = await request.json()
    
    // Validate required fields
    if (!body.exchange || !body.routing_key || body.payload === undefined) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields',
        message: 'Exchange, routing_key, and payload are required',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await RabbitMQApiClient.publishMessage(DEFAULT_VHOST, body)
    
    const response: ApiResponse = {
      success: true,
      message: `Message published to exchange '${body.exchange}' with routing key '${body.routing_key}'`,
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Failed to publish message:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to publish message',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}