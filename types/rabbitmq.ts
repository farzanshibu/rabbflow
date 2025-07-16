// Core RabbitMQ data models and interfaces

// Type aliases for better type safety
export type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers'
export type QueueState = 'running' | 'idle' | 'flow' | 'down'
export type ConnectionState = 'running' | 'blocked' | 'flow' | 'closing' | 'closed'
export type DestinationType = 'queue' | 'exchange'

export interface TopologyData {
  exchanges: Exchange[]
  queues: Queue[]
  bindings: Binding[]
  connections: Connection[]
}

// Enhanced Exchange interface with comprehensive properties
export interface Exchange {
  name: string
  type: 'direct' | 'fanout' | 'topic' | 'headers'
  durable: boolean
  auto_delete: boolean
  internal: boolean
  arguments: Record<string, any>
  vhost?: string
  user_who_performed_action?: string
  message_stats?: ExchangeMessageStats
}

export interface ExchangeMessageStats {
  publish_in?: number
  publish_in_details?: { rate: number }
  publish_out?: number
  publish_out_details?: { rate: number }
}

// Enhanced Queue interface with comprehensive properties
export interface Queue {
  name: string
  durable: boolean
  exclusive: boolean
  auto_delete: boolean
  arguments: Record<string, any>
  node: string
  state: 'running' | 'idle' | 'flow' | 'down'
  consumers: number
  messages: number
  messages_ready?: number
  messages_unacknowledged?: number
  vhost?: string
  policy?: string
  exclusive_consumer_tag?: string | null
  message_stats?: QueueMessageStats
  consumer_details?: ConsumerDetail[]
}

export interface QueueMessageStats {
  ack?: number
  ack_details?: { rate: number }
  deliver?: number
  deliver_details?: { rate: number }
  deliver_get?: number
  deliver_get_details?: { rate: number }
  deliver_no_ack?: number
  deliver_no_ack_details?: { rate: number }
  get?: number
  get_details?: { rate: number }
  get_no_ack?: number
  get_no_ack_details?: { rate: number }
  publish?: number
  publish_details?: { rate: number }
  redeliver?: number
  redeliver_details?: { rate: number }
}

export interface ConsumerDetail {
  consumer_tag: string
  exclusive: boolean
  ack_required: boolean
  prefetch_count: number
  channel_details: {
    name: string
    number: number
    user: string
    connection_name: string
    peer_port: number
    peer_host: string
  }
}

// Enhanced Binding interface
export interface Binding {
  source: string
  destination: string
  destination_type: 'queue' | 'exchange'
  routing_key: string
  arguments: Record<string, any>
  vhost?: string
  properties_key?: string
}

// Enhanced Connection interface
export interface Connection {
  name: string
  node: string
  state: 'running' | 'blocked' | 'flow' | 'closing' | 'closed'
  channels: number
  user: string
  vhost: string
  protocol: string
  auth_mechanism: string
  peer_cert_validity?: string
  peer_cert_issuer?: string
  peer_cert_subject?: string
  ssl: boolean
  peer_host: string
  peer_port: number
  host: string
  port: number
  type: 'network' | 'direct'
  timeout?: number
  frame_max?: number
  channel_max?: number
  client_properties?: Record<string, any>
  recv_oct?: number
  recv_oct_details?: { rate: number }
  send_oct?: number
  send_oct_details?: { rate: number }
  recv_cnt?: number
  recv_cnt_details?: { rate: number }
  send_cnt?: number
  send_cnt_details?: { rate: number }
  connected_at?: number
}

// Enhanced Message interface with comprehensive properties
export interface Message {
  payload: string | object
  properties: MessageProperties
  routing_key: string
  exchange: string
  redelivered: boolean
  payload_bytes?: number
  payload_encoding?: string
  message_count?: number
  consumer_tag?: string
  delivery_tag?: number
  ack_required?: boolean
}

export interface MessageProperties {
  content_type?: string
  content_encoding?: string
  headers?: Record<string, any>
  delivery_mode?: number
  priority?: number
  correlation_id?: string
  reply_to?: string
  expiration?: string
  message_id?: string
  timestamp?: number
  type?: string
  user_id?: string
  app_id?: string
  cluster_id?: string
}

// Raw RabbitMQ API response types (for transformation)
export interface RawExchangeResponse {
  name: string
  type: string
  durable: boolean
  auto_delete: boolean
  internal: boolean
  arguments: Record<string, any>
  vhost?: string
  user_who_performed_action?: string
  message_stats?: {
    publish_in?: number
    publish_in_details?: { rate: number }
    publish_out?: number
    publish_out_details?: { rate: number }
  }
}

export interface RawQueueResponse {
  name: string
  durable: boolean
  exclusive: boolean
  auto_delete: boolean
  arguments: Record<string, any>
  node: string
  state: string
  consumers: number
  messages: number
  messages_ready?: number
  messages_unacknowledged?: number
  vhost?: string
  policy?: string
  exclusive_consumer_tag?: string | null
  message_stats?: Record<string, any>
  consumer_details?: any[]
}

export interface RawBindingResponse {
  source: string
  destination: string
  destination_type: string
  routing_key: string
  arguments: Record<string, any>
  vhost?: string
  properties_key?: string
}

export interface RawConnectionResponse {
  name: string
  node: string
  state: string
  channels: number
  user: string
  vhost: string
  protocol: string
  auth_mechanism: string
  peer_cert_validity?: string
  peer_cert_issuer?: string
  peer_cert_subject?: string
  ssl: boolean
  peer_host: string
  peer_port: number
  host: string
  port: number
  type: string
  timeout?: number
  frame_max?: number
  channel_max?: number
  client_properties?: Record<string, any>
  recv_oct?: number
  recv_oct_details?: { rate: number }
  send_oct?: number
  send_oct_details?: { rate: number }
  recv_cnt?: number
  recv_cnt_details?: { rate: number }
  send_cnt?: number
  send_cnt_details?: { rate: number }
  connected_at?: number
}

export interface RabbitMQMetrics {
  queues: QueueMetrics[]
  exchanges: ExchangeMetrics[]
  connections: ConnectionMetrics[]
  overview: OverviewMetrics
}

export interface QueueMetrics {
  name: string
  messages: number
  messages_ready: number
  messages_unacknowledged: number
  consumers: number
  message_stats: {
    publish: number
    publish_details: { rate: number }
    deliver_get: number
    deliver_get_details: { rate: number }
  }
}

export interface ExchangeMetrics {
  name: string
  type: string
  message_stats: {
    publish_in: number
    publish_in_details: { rate: number }
    publish_out: number
    publish_out_details: { rate: number }
  }
}

export interface ConnectionMetrics {
  name: string
  state: string
  channels: number
  recv_oct: number
  recv_oct_details: { rate: number }
  send_oct: number
  send_oct_details: { rate: number }
}

export interface OverviewMetrics {
  message_stats: {
    publish: number
    publish_details: { rate: number }
    deliver_get: number
    deliver_get_details: { rate: number }
  }
  queue_totals: {
    messages: number
    messages_ready: number
    messages_unacknowledged: number
  }
  object_totals: {
    connections: number
    channels: number
    exchanges: number
    queues: number
    consumers: number
  }
}