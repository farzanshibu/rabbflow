// RabbitMQ API client utilities
import axios from 'axios'
import type { 
  TopologyData, 
  Exchange, 
  Queue, 
  Binding,
  RabbitMQMetrics 
} from '@/types/rabbitmq'
import type { 
  CreateExchangeRequest, 
  CreateQueueRequest, 
  CreateBindingRequest,
  PublishMessageRequest,
  ApiResponse 
} from '@/types/api'

const RABBITMQ_API_BASE = process.env.NEXT_PUBLIC_RABBITMQ_API_URL || 'http://localhost:15672/api'
const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME || 'guest'
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest'

// Create axios instance with default config
const rabbitmqApi = axios.create({
  baseURL: RABBITMQ_API_BASE,
  auth: {
    username: RABBITMQ_USERNAME,
    password: RABBITMQ_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
  },
})

export class RabbitMQApiClient {
  // Topology operations
  static async getTopology(): Promise<TopologyData> {
    const [exchanges, queues, bindings] = await Promise.all([
      rabbitmqApi.get('/exchanges'),
      rabbitmqApi.get('/queues'),
      rabbitmqApi.get('/bindings'),
    ])

    return {
      exchanges: exchanges.data,
      queues: queues.data,
      bindings: bindings.data,
      connections: [], // Will be populated later
    }
  }

  // Exchange operations
  static async createExchange(vhost: string, exchange: CreateExchangeRequest): Promise<void> {
    await rabbitmqApi.put(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(exchange.name)}`, {
      type: exchange.type,
      durable: exchange.durable ?? true,
      auto_delete: exchange.auto_delete ?? false,
      internal: exchange.internal ?? false,
      arguments: exchange.arguments ?? {},
    })
  }

  static async deleteExchange(vhost: string, name: string): Promise<void> {
    await rabbitmqApi.delete(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`)
  }

  // Queue operations
  static async createQueue(vhost: string, queue: CreateQueueRequest): Promise<void> {
    await rabbitmqApi.put(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queue.name)}`, {
      durable: queue.durable ?? true,
      exclusive: queue.exclusive ?? false,
      auto_delete: queue.auto_delete ?? false,
      arguments: queue.arguments ?? {},
    })
  }

  static async deleteQueue(vhost: string, name: string): Promise<void> {
    await rabbitmqApi.delete(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`)
  }

  // Binding operations
  static async createBinding(vhost: string, binding: CreateBindingRequest): Promise<void> {
    const endpoint = binding.destination_type === 'queue' 
      ? `/bindings/${encodeURIComponent(vhost)}/e/${encodeURIComponent(binding.source)}/q/${encodeURIComponent(binding.destination)}`
      : `/bindings/${encodeURIComponent(vhost)}/e/${encodeURIComponent(binding.source)}/e/${encodeURIComponent(binding.destination)}`
    
    await rabbitmqApi.post(endpoint, {
      routing_key: binding.routing_key,
      arguments: binding.arguments ?? {},
    })
  }

  // Message operations
  static async publishMessage(vhost: string, message: PublishMessageRequest): Promise<void> {
    await rabbitmqApi.post(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(message.exchange)}/publish`, {
      routing_key: message.routing_key,
      payload: typeof message.payload === 'string' ? message.payload : JSON.stringify(message.payload),
      payload_encoding: 'string',
      properties: message.properties ?? {},
    })
  }

  // Metrics operations
  static async getMetrics(): Promise<RabbitMQMetrics> {
    const [overview, queues, exchanges, connections] = await Promise.all([
      rabbitmqApi.get('/overview'),
      rabbitmqApi.get('/queues'),
      rabbitmqApi.get('/exchanges'),
      rabbitmqApi.get('/connections'),
    ])

    return {
      overview: overview.data,
      queues: queues.data,
      exchanges: exchanges.data,
      connections: connections.data,
    }
  }
}

export default RabbitMQApiClient