// Data transformation utilities between RabbitMQ API and internal models
import {
  Exchange,
  Queue,
  Binding,
  Connection,
  Message,
  TopologyData,
  RawExchangeResponse,
  RawQueueResponse,
  RawBindingResponse,
  RawConnectionResponse,
  QueueState,
  ConnectionState,
  ExchangeType,
  DestinationType
} from '../types/rabbitmq'

import {
  RawExchangeResponseSchema,
  RawQueueResponseSchema,
  RawBindingResponseSchema,
  RawConnectionResponseSchema
} from './validation'

/**
 * Transform raw RabbitMQ exchange response to internal Exchange model
 */
export function transformExchange(raw: RawExchangeResponse): Exchange {
  // Validate the raw response
  const validated = RawExchangeResponseSchema.parse(raw)
  
  return {
    name: validated.name,
    type: validated.type as ExchangeType,
    durable: validated.durable,
    auto_delete: validated.auto_delete,
    internal: validated.internal,
    arguments: validated.arguments,
    vhost: validated.vhost,
    user_who_performed_action: validated.user_who_performed_action,
    message_stats: validated.message_stats ? {
      publish_in: validated.message_stats.publish_in,
      publish_in_details: validated.message_stats.publish_in_details,
      publish_out: validated.message_stats.publish_out,
      publish_out_details: validated.message_stats.publish_out_details
    } : undefined
  }
}

/**
 * Transform array of raw exchange responses
 */
export function transformExchanges(rawExchanges: RawExchangeResponse[]): Exchange[] {
  return rawExchanges.map(transformExchange)
}

/**
 * Transform raw RabbitMQ queue response to internal Queue model
 */
export function transformQueue(raw: RawQueueResponse): Queue {
  // Validate the raw response
  const validated = RawQueueResponseSchema.parse(raw)
  
  // Transform consumer details if present
  const consumerDetails = validated.consumer_details?.map(detail => ({
    consumer_tag: detail.consumer_tag || '',
    exclusive: detail.exclusive || false,
    ack_required: detail.ack_required || true,
    prefetch_count: detail.prefetch_count || 0,
    channel_details: {
      name: detail.channel_details?.name || '',
      number: detail.channel_details?.number || 0,
      user: detail.channel_details?.user || '',
      connection_name: detail.channel_details?.connection_name || '',
      peer_port: detail.channel_details?.peer_port || 0,
      peer_host: detail.channel_details?.peer_host || ''
    }
  }))

  // Transform message stats if present
  const messageStats = validated.message_stats ? {
    ack: validated.message_stats.ack,
    ack_details: validated.message_stats.ack_details,
    deliver: validated.message_stats.deliver,
    deliver_details: validated.message_stats.deliver_details,
    deliver_get: validated.message_stats.deliver_get,
    deliver_get_details: validated.message_stats.deliver_get_details,
    deliver_no_ack: validated.message_stats.deliver_no_ack,
    deliver_no_ack_details: validated.message_stats.deliver_no_ack_details,
    get: validated.message_stats.get,
    get_details: validated.message_stats.get_details,
    get_no_ack: validated.message_stats.get_no_ack,
    get_no_ack_details: validated.message_stats.get_no_ack_details,
    publish: validated.message_stats.publish,
    publish_details: validated.message_stats.publish_details,
    redeliver: validated.message_stats.redeliver,
    redeliver_details: validated.message_stats.redeliver_details
  } : undefined

  return {
    name: validated.name,
    durable: validated.durable,
    exclusive: validated.exclusive,
    auto_delete: validated.auto_delete,
    arguments: validated.arguments,
    node: validated.node,
    state: validated.state as QueueState,
    consumers: validated.consumers,
    messages: validated.messages,
    messages_ready: validated.messages_ready,
    messages_unacknowledged: validated.messages_unacknowledged,
    vhost: validated.vhost,
    policy: validated.policy,
    exclusive_consumer_tag: validated.exclusive_consumer_tag,
    message_stats: messageStats,
    consumer_details: consumerDetails
  }
}

/**
 * Transform array of raw queue responses
 */
export function transformQueues(rawQueues: RawQueueResponse[]): Queue[] {
  return rawQueues.map(transformQueue)
}

/**
 * Transform raw RabbitMQ binding response to internal Binding model
 */
export function transformBinding(raw: RawBindingResponse): Binding {
  // Validate the raw response
  const validated = RawBindingResponseSchema.parse(raw)
  
  return {
    source: validated.source,
    destination: validated.destination,
    destination_type: validated.destination_type as DestinationType,
    routing_key: validated.routing_key,
    arguments: validated.arguments,
    vhost: validated.vhost,
    properties_key: validated.properties_key
  }
}

/**
 * Transform array of raw binding responses
 */
export function transformBindings(rawBindings: RawBindingResponse[]): Binding[] {
  return rawBindings.map(transformBinding)
}

/**
 * Transform raw RabbitMQ connection response to internal Connection model
 */
export function transformConnection(raw: RawConnectionResponse): Connection {
  // Validate the raw response
  const validated = RawConnectionResponseSchema.parse(raw)
  
  return {
    name: validated.name,
    node: validated.node,
    state: validated.state as ConnectionState,
    channels: validated.channels,
    user: validated.user,
    vhost: validated.vhost,
    protocol: validated.protocol,
    auth_mechanism: validated.auth_mechanism,
    peer_cert_validity: validated.peer_cert_validity,
    peer_cert_issuer: validated.peer_cert_issuer,
    peer_cert_subject: validated.peer_cert_subject,
    ssl: validated.ssl,
    peer_host: validated.peer_host,
    peer_port: validated.peer_port,
    host: validated.host,
    port: validated.port,
    type: validated.type as 'network' | 'direct',
    timeout: validated.timeout,
    frame_max: validated.frame_max,
    channel_max: validated.channel_max,
    client_properties: validated.client_properties,
    recv_oct: validated.recv_oct,
    recv_oct_details: validated.recv_oct_details,
    send_oct: validated.send_oct,
    send_oct_details: validated.send_oct_details,
    recv_cnt: validated.recv_cnt,
    recv_cnt_details: validated.recv_cnt_details,
    send_cnt: validated.send_cnt,
    send_cnt_details: validated.send_cnt_details,
    connected_at: validated.connected_at
  }
}

/**
 * Transform array of raw connection responses
 */
export function transformConnections(rawConnections: RawConnectionResponse[]): Connection[] {
  return rawConnections.map(transformConnection)
}

/**
 * Transform complete topology data from raw RabbitMQ API responses
 */
export function transformTopologyData(rawData: {
  exchanges: RawExchangeResponse[]
  queues: RawQueueResponse[]
  bindings: RawBindingResponse[]
  connections: RawConnectionResponse[]
}): TopologyData {
  return {
    exchanges: transformExchanges(rawData.exchanges),
    queues: transformQueues(rawData.queues),
    bindings: transformBindings(rawData.bindings),
    connections: transformConnections(rawData.connections)
  }
}

/**
 * Transform internal Exchange model to RabbitMQ API request format
 */
export function exchangeToApiRequest(exchange: Partial<Exchange>) {
  return {
    type: exchange.type,
    durable: exchange.durable ?? true,
    auto_delete: exchange.auto_delete ?? false,
    internal: exchange.internal ?? false,
    arguments: exchange.arguments ?? {}
  }
}

/**
 * Transform internal Queue model to RabbitMQ API request format
 */
export function queueToApiRequest(queue: Partial<Queue>) {
  return {
    durable: queue.durable ?? true,
    exclusive: queue.exclusive ?? false,
    auto_delete: queue.auto_delete ?? false,
    arguments: queue.arguments ?? {}
  }
}

/**
 * Transform internal Binding model to RabbitMQ API request format
 */
export function bindingToApiRequest(binding: Partial<Binding>) {
  return {
    routing_key: binding.routing_key ?? '',
    arguments: binding.arguments ?? {}
  }
}

/**
 * Transform message payload for publishing
 */
export function transformMessagePayload(payload: string | object): string {
  if (typeof payload === 'string') {
    return payload
  }
  return JSON.stringify(payload)
}

/**
 * Parse message payload from RabbitMQ response
 */
export function parseMessagePayload(payload: string, contentType?: string): string | object {
  if (!contentType || contentType === 'text/plain') {
    return payload
  }
  
  if (contentType === 'application/json') {
    try {
      return JSON.parse(payload)
    } catch (error) {
      console.warn('Failed to parse JSON payload:', error)
      return payload
    }
  }
  
  return payload
}

/**
 * Normalize queue state from various possible values
 */
export function normalizeQueueState(state: string): QueueState {
  const normalizedState = state.toLowerCase()
  switch (normalizedState) {
    case 'running':
      return 'running'
    case 'idle':
      return 'idle'
    case 'flow':
      return 'flow'
    case 'down':
      return 'down'
    default:
      console.warn(`Unknown queue state: ${state}, defaulting to 'idle'`)
      return 'idle'
  }
}

/**
 * Normalize connection state from various possible values
 */
export function normalizeConnectionState(state: string): ConnectionState {
  const normalizedState = state.toLowerCase()
  switch (normalizedState) {
    case 'running':
      return 'running'
    case 'blocked':
      return 'blocked'
    case 'flow':
      return 'flow'
    case 'closing':
      return 'closing'
    case 'closed':
      return 'closed'
    default:
      console.warn(`Unknown connection state: ${state}, defaulting to 'running'`)
      return 'running'
  }
}

/**
 * Validate and normalize exchange type
 */
export function normalizeExchangeType(type: string): ExchangeType {
  const normalizedType = type.toLowerCase()
  switch (normalizedType) {
    case 'direct':
      return 'direct'
    case 'fanout':
      return 'fanout'
    case 'topic':
      return 'topic'
    case 'headers':
      return 'headers'
    default:
      throw new Error(`Invalid exchange type: ${type}`)
  }
}

/**
 * Error transformation utility for API responses
 */
export function transformApiError(error: any): { message: string; code?: string; details?: any } {
  if (error.response?.data) {
    return {
      message: error.response.data.reason || error.response.data.error || 'Unknown API error',
      code: error.response.status?.toString(),
      details: error.response.data
    }
  }
  
  if (error.message) {
    return {
      message: error.message,
      code: error.code,
      details: error
    }
  }
  
  return {
    message: 'Unknown error occurred',
    details: error
  }
}