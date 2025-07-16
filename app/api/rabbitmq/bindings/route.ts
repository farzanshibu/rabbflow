import { NextRequest, NextResponse } from 'next/server'
import { RabbitMQApiClient } from '@/lib/rabbitmq'
import type { CreateBindingRequest, ApiResponse } from '@/types/api'

const DEFAULT_VHOST = process.env.RABBITMQ_VHOST || '/'

export async function GET() {
  try {
    const topology = await RabbitMQApiClient.getTopology()
    
    const response: ApiResponse = {
      success: true,
      data: topology.bindings,
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch bindings:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch bindings',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBindingRequest = await request.json()
    
    // Validate required fields
    if (!body.source || !body.destination || !body.destination_type) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields',
        message: 'Source, destination, and destination_type are required',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Validate destination type
    if (!['queue', 'exchange'].includes(body.destination_type)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid destination type',
        message: 'Destination type must be either "queue" or "exchange"',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await RabbitMQApiClient.createBinding(DEFAULT_VHOST, body)
    
    const response: ApiResponse = {
      success: true,
      message: `Binding from '${body.source}' to '${body.destination}' created successfully`,
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Failed to create binding:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create binding',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}