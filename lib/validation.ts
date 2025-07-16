// Zod validation schemas for RabbitMQ API requests and responses
import { z } from 'zod'

// Base schemas for common types
const RecordSchema = z.record(z.string(), z.any())
const RateDetailsSchema = z.object({
  rate: z.number()
})

// Exchange validation schemas
export const ExchangeTypeSchema = z.enum(['direct', 'fanout', 'topic', 'headers'])

export const CreateExchangeRequestSchema = z.object({
  name: z.string().min(1, 'Exchange name is required').max(255, 'Exchange name too long'),
  type: ExchangeTypeSchema,
  durable: z.boolean().optional(),
  auto_delete: z.boolean().optional(),
  internal: z.boolean().optional(),
  arguments: RecordSchema.optional()
}).transform(data => ({
  name: data.name,
  type: data.type,
  durable: data.durable ?? true,
  auto_delete: data.auto_delete ?? false,
  internal: data.internal ?? false,
  arguments: data.arguments ?? {}
}))

export const ExchangeMessageStatsSchema = z.object({
  publish_in: z.number().optional(),
  publish_in_details: RateDetailsSchema.optional(),
  publish_out: z.number().optional(),
  publish_out_details: RateDetailsSchema.optional()
})

export const ExchangeSchema = z.object({
  name: z.string(),
  type: ExchangeTypeSchema,
  durable: z.boolean(),
  auto_delete: z.boolean(),
  internal: z.boolean(),
  arguments: RecordSchema,
  vhost: z.string().optional(),
  user_who_performed_action: z.string().optional(),
  message_stats: ExchangeMessageStatsSchema.optional()
})

// Queue validation schemas
export const QueueStateSchema = z.enum(['running', 'idle', 'flow', 'down'])

export const CreateQueueRequestSchema = z.object({
  name: z.string().min(1, 'Queue name is required').max(255, 'Queue name too long'),
  durable: z.boolean().optional(),
  exclusive: z.boolean().optional(),
  auto_delete: z.boolean().optional(),
  arguments: RecordSchema.optional()
}).transform(data => ({
  name: data.name,
  durable: data.durable ?? true,
  exclusive: data.exclusive ?? false,
  auto_delete: data.auto_delete ?? false,
  arguments: data.arguments ?? {}
}))

export const ConsumerDetailSchema = z.object({
  consumer_tag: z.string(),
  exclusive: z.boolean(),
  ack_required: z.boolean(),
  prefetch_count: z.number(),
  channel_details: z.object({
    name: z.string(),
    number: z.number(),
    user: z.string(),
    connection_name: z.string(),
    peer_port: z.number(),
    peer_host: z.string()
  })
})

export const QueueMessageStatsSchema = z.object({
  ack: z.number().optional(),
  ack_details: RateDetailsSchema.optional(),
  deliver: z.number().optional(),
  deliver_details: RateDetailsSchema.optional(),
  deliver_get: z.number().optional(),
  deliver_get_details: RateDetailsSchema.optional(),
  deliver_no_ack: z.number().optional(),
  deliver_no_ack_details: RateDetailsSchema.optional(),
  get: z.number().optional(),
  get_details: RateDetailsSchema.optional(),
  get_no_ack: z.number().optional(),
  get_no_ack_details: RateDetailsSchema.optional(),
  publish: z.number().optional(),
  publish_details: RateDetailsSchema.optional(),
  redeliver: z.number().optional(),
  redeliver_details: RateDetailsSchema.optional()
})

export const QueueSchema = z.object({
  name: z.string(),
  durable: z.boolean(),
  exclusive: z.boolean(),
  auto_delete: z.boolean(),
  arguments: RecordSchema,
  node: z.string(),
  state: QueueStateSchema,
  consumers: z.number(),
  messages: z.number(),
  messages_ready: z.number().optional(),
  messages_unacknowledged: z.number().optional(),
  vhost: z.string().optional(),
  policy: z.string().optional(),
  exclusive_consumer_tag: z.string().nullable().optional(),
  message_stats: QueueMessageStatsSchema.optional(),
  consumer_details: z.array(ConsumerDetailSchema).optional()
})

// Binding validation schemas
export const DestinationTypeSchema = z.enum(['queue', 'exchange'])

export const CreateBindingRequestSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  destination_type: DestinationTypeSchema,
  routing_key: z.string().optional(),
  arguments: RecordSchema.optional()
}).transform(data => ({
  source: data.source,
  destination: data.destination,
  destination_type: data.destination_type,
  routing_key: data.routing_key ?? '',
  arguments: data.arguments ?? {}
}))

export const BindingSchema = z.object({
  source: z.string(),
  destination: z.string(),
  destination_type: DestinationTypeSchema,
  routing_key: z.string(),
  arguments: RecordSchema,
  vhost: z.string().optional(),
  properties_key: z.string().optional()
})

// Connection validation schemas
export const ConnectionStateSchema = z.enum(['running', 'blocked', 'flow', 'closing', 'closed'])
export const ConnectionTypeSchema = z.enum(['network', 'direct'])

export const ConnectionSchema = z.object({
  name: z.string(),
  node: z.string(),
  state: ConnectionStateSchema,
  channels: z.number(),
  user: z.string(),
  vhost: z.string(),
  protocol: z.string(),
  auth_mechanism: z.string(),
  peer_cert_validity: z.string().optional(),
  peer_cert_issuer: z.string().optional(),
  peer_cert_subject: z.string().optional(),
  ssl: z.boolean(),
  peer_host: z.string(),
  peer_port: z.number(),
  host: z.string(),
  port: z.number(),
  type: ConnectionTypeSchema,
  timeout: z.number().optional(),
  frame_max: z.number().optional(),
  channel_max: z.number().optional(),
  client_properties: RecordSchema.optional(),
  recv_oct: z.number().optional(),
  recv_oct_details: RateDetailsSchema.optional(),
  send_oct: z.number().optional(),
  send_oct_details: RateDetailsSchema.optional(),
  recv_cnt: z.number().optional(),
  recv_cnt_details: RateDetailsSchema.optional(),
  send_cnt: z.number().optional(),
  send_cnt_details: RateDetailsSchema.optional(),
  connected_at: z.number().optional()
})

// Message validation schemas
export const MessagePropertiesSchema = z.object({
  content_type: z.string().optional(),
  content_encoding: z.string().optional(),
  headers: RecordSchema.optional(),
  delivery_mode: z.number().min(1).max(2).optional(),
  priority: z.number().min(0).max(255).optional(),
  correlation_id: z.string().optional(),
  reply_to: z.string().optional(),
  expiration: z.string().optional(),
  message_id: z.string().optional(),
  timestamp: z.number().optional(),
  type: z.string().optional(),
  user_id: z.string().optional(),
  app_id: z.string().optional(),
  cluster_id: z.string().optional()
})

export const PublishMessageRequestSchema = z.object({
  exchange: z.string().min(1, 'Exchange is required'),
  routing_key: z.string().optional(),
  payload: z.union([z.string(), z.record(z.string(), z.any())]),
  properties: MessagePropertiesSchema.optional()
}).transform(data => ({
  exchange: data.exchange,
  routing_key: data.routing_key ?? '',
  payload: data.payload,
  properties: data.properties
}))

export const MessageSchema = z.object({
  payload: z.union([z.string(), z.record(z.string(), z.any())]),
  properties: MessagePropertiesSchema,
  routing_key: z.string(),
  exchange: z.string(),
  redelivered: z.boolean(),
  payload_bytes: z.number().optional(),
  payload_encoding: z.string().optional(),
  message_count: z.number().optional(),
  consumer_tag: z.string().optional(),
  delivery_tag: z.number().optional(),
  ack_required: z.boolean().optional()
})

// Topology validation schema
export const TopologyDataSchema = z.object({
  exchanges: z.array(ExchangeSchema),
  queues: z.array(QueueSchema),
  bindings: z.array(BindingSchema),
  connections: z.array(ConnectionSchema)
})

// API Response validation schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

// Raw RabbitMQ API response schemas (for transformation validation)
export const RawExchangeResponseSchema = z.object({
  name: z.string(),
  type: z.string(),
  durable: z.boolean(),
  auto_delete: z.boolean(),
  internal: z.boolean(),
  arguments: RecordSchema,
  vhost: z.string().optional(),
  user_who_performed_action: z.string().optional(),
  message_stats: z.object({
    publish_in: z.number().optional(),
    publish_in_details: RateDetailsSchema.optional(),
    publish_out: z.number().optional(),
    publish_out_details: RateDetailsSchema.optional()
  }).optional()
})

export const RawQueueResponseSchema = z.object({
  name: z.string(),
  durable: z.boolean(),
  exclusive: z.boolean(),
  auto_delete: z.boolean(),
  arguments: RecordSchema,
  node: z.string(),
  state: z.string(),
  consumers: z.number(),
  messages: z.number(),
  messages_ready: z.number().optional(),
  messages_unacknowledged: z.number().optional(),
  vhost: z.string().optional(),
  policy: z.string().optional(),
  exclusive_consumer_tag: z.string().nullable().optional(),
  message_stats: RecordSchema.optional(),
  consumer_details: z.array(z.any()).optional()
})

export const RawBindingResponseSchema = z.object({
  source: z.string(),
  destination: z.string(),
  destination_type: z.string(),
  routing_key: z.string(),
  arguments: RecordSchema,
  vhost: z.string().optional(),
  properties_key: z.string().optional()
})

export const RawConnectionResponseSchema = z.object({
  name: z.string(),
  node: z.string(),
  state: z.string(),
  channels: z.number(),
  user: z.string(),
  vhost: z.string(),
  protocol: z.string(),
  auth_mechanism: z.string(),
  peer_cert_validity: z.string().optional(),
  peer_cert_issuer: z.string().optional(),
  peer_cert_subject: z.string().optional(),
  ssl: z.boolean(),
  peer_host: z.string(),
  peer_port: z.number(),
  host: z.string(),
  port: z.number(),
  type: z.string(),
  timeout: z.number().optional(),
  frame_max: z.number().optional(),
  channel_max: z.number().optional(),
  client_properties: RecordSchema.optional(),
  recv_oct: z.number().optional(),
  recv_oct_details: RateDetailsSchema.optional(),
  send_oct: z.number().optional(),
  send_oct_details: RateDetailsSchema.optional(),
  recv_cnt: z.number().optional(),
  recv_cnt_details: RateDetailsSchema.optional(),
  send_cnt: z.number().optional(),
  send_cnt_details: RateDetailsSchema.optional(),
  connected_at: z.number().optional()
})

// Export type inference helpers
export type CreateExchangeRequest = z.infer<typeof CreateExchangeRequestSchema>
export type CreateQueueRequest = z.infer<typeof CreateQueueRequestSchema>
export type CreateBindingRequest = z.infer<typeof CreateBindingRequestSchema>
export type PublishMessageRequest = z.infer<typeof PublishMessageRequestSchema>
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T }