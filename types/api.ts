// API and WebSocket communication types

import { RabbitMQMetrics, TopologyData } from './rabbitmq'

// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CreateExchangeRequest {
  name: string
  type: 'direct' | 'fanout' | 'topic' | 'headers'
  durable?: boolean
  auto_delete?: boolean
  internal?: boolean
  arguments?: Record<string, any>
}

export interface CreateQueueRequest {
  name: string
  durable?: boolean
  exclusive?: boolean
  auto_delete?: boolean
  arguments?: Record<string, any>
}

export interface CreateBindingRequest {
  source: string
  destination: string
  destination_type: 'queue' | 'exchange'
  routing_key: string
  arguments?: Record<string, any>
}

export interface PublishMessageRequest {
  exchange: string
  routing_key: string
  payload: string | object
  properties?: {
    content_type?: string
    headers?: Record<string, any>
    delivery_mode?: number
    priority?: number
    correlation_id?: string
    reply_to?: string
    expiration?: string
    message_id?: string
    user_id?: string
    app_id?: string
  }
}

export interface MessageTemplate {
  id: string
  name: string
  exchange: string
  routing_key: string
  payload: string | object
  properties?: Record<string, any>
  created_at: Date
}

// WebSocket Event types
export interface ClientToServerEvents {
  'subscribe-topology': () => void
  'unsubscribe-topology': () => void
  'subscribe-messages': (queueNames: string[]) => void
  'unsubscribe-messages': (queueNames: string[]) => void
  'subscribe-metrics': () => void
  'unsubscribe-metrics': () => void
  'publish-message': (message: PublishMessageRequest) => void
}

export interface ServerToClientEvents {
  'topology-update': (topology: TopologyData) => void
  'message-published': (message: MessageEvent) => void
  'message-consumed': (message: MessageEvent) => void
  'message-acknowledged': (message: MessageEvent) => void
  'message-rejected': (message: MessageEvent) => void
  'metrics-update': (metrics: RabbitMQMetrics) => void
  'connection-status': (status: ConnectionStatus) => void
  'error': (error: SocketError) => void
}

export interface MessageEvent {
  id: string
  exchange: string
  queue?: string
  routing_key: string
  payload: any
  properties: Record<string, any>
  timestamp: number
  status: 'published' | 'routed' | 'consumed' | 'acknowledged' | 'rejected' | 'dead-lettered'
}

export interface ConnectionStatus {
  connected: boolean
  rabbitmq_connected: boolean
  last_heartbeat?: Date
  error?: string
}

export interface SocketError {
  code: string
  message: string
  details?: any
}

// Virtual Consumer types
export interface VirtualConsumer {
  id: string
  queue: string
  prefetch_count: number
  ack_mode: 'auto' | 'manual'
  processing_delay: number
  active: boolean
  statistics: ConsumerStatistics
}

export interface ConsumerStatistics {
  messages_consumed: number
  messages_acknowledged: number
  messages_rejected: number
  errors: number
  last_activity?: Date
  consume_rate: number
}

export interface CreateConsumerRequest {
  queue: string
  prefetch_count?: number
  ack_mode?: 'auto' | 'manual'
  processing_delay?: number
}

// Alert and Monitoring types
export interface Alert {
  id: string
  type: 'queue_length' | 'message_rate' | 'consumer_count' | 'connection_error'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  resource: string
  threshold?: number
  current_value?: number
  timestamp: Date
  acknowledged: boolean
}

export interface AlertThreshold {
  metric: string
  resource: string
  warning_threshold?: number
  error_threshold?: number
  critical_threshold?: number
}

// Authentication types
export interface User {
  id: string
  username: string
  email: string
  role: 'viewer' | 'operator' | 'admin'
  permissions: Permission[]
}

export interface Permission {
  resource: string
  actions: ('read' | 'write' | 'delete')[]
}

export interface AuthSession {
  user: User
  expires: string
  accessToken: string
}