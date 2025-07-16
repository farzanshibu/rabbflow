import { NextRequest, NextResponse } from 'next/server'
import { RabbitMQApiClient } from '@/lib/rabbitmq'
import type { CreateExchangeRequest, ApiResponse } from '@/types/api'

const DEFAULT_VHOST = process.env.RABBITMQ_VHOST || '/'

export async function GET() {
  try {
    const topology = await RabbitMQApiClient.getTopology()
    
    const response: ApiResponse = {
      success: true,
      data: topology.exchanges,
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch exchanges:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch exchanges',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateExchangeRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.type) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields',
        message: 'Exchange name and type are required',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Validate exchange type
    const validTypes = ['direct', 'fanout', 'topic', 'headers']
    if (!validTypes.includes(body.type)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid exchange type',
        message: `Exchange type must be one of: ${validTypes.join(', ')}`,
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await RabbitMQApiClient.createExchange(DEFAULT_VHOST, body)
    
    const response: ApiResponse = {
      success: true,
      message: `Exchange '${body.name}' created successfully`,
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Failed to create exchange:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create exchange',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}