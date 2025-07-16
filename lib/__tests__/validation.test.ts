// Unit tests for Zod validation schemas
import {
  CreateExchangeRequestSchema,
  CreateQueueRequestSchema,
  CreateBindingRequestSchema,
  PublishMessageRequestSchema,
  ExchangeSchema,
  QueueSchema,
  BindingSchema,
  ConnectionSchema,
  MessageSchema,
  TopologyDataSchema,
  ApiResponseSchema,
  RawExchangeResponseSchema,
  RawQueueResponseSchema,
  RawBindingResponseSchema,
  RawConnectionResponseSchema
} from '../validation'

describe('Request Validation Schemas', () => {
  describe('CreateExchangeRequestSchema', () => {
    test('should validate valid exchange request', () => {
      const validRequest = {
        name: 'test-exchange',
        type: 'direct' as const,
        durable: true,
        auto_delete: false,
        internal: false,
        arguments: { 'x-test': 'value' }
      }
      
      const result = CreateExchangeRequestSchema.parse(validRequest)
      expect(result).toEqual(validRequest)
    })

    test('should apply defaults for optional fields', () => {
      const minimalRequest = {
        name: 'test-exchange',
        type: 'fanout' as const
      }
      
      const result = CreateExchangeRequestSchema.parse(minimalRequest)
      expect(result).toEqual({
        name: 'test-exchange',
        type: 'fanout',
        durable: true,
        auto_delete: false,
        internal: false,
        arguments: {}
      })
    })

    test('should reject invalid exchange type', () => {
      const invalidRequest = {
        name: 'test-exchange',
        type: 'invalid'
      }
      
      expect(() => CreateExchangeRequestSchema.parse(invalidRequest)).toThrow()
    })

    test('should reject empty name', () => {
      const invalidRequest = {
        name: '',
        type: 'direct' as const
      }
      
      expect(() => CreateExchangeRequestSchema.parse(invalidRequest)).toThrow()
    })

    test('should reject name that is too long', () => {
      const invalidRequest = {
        name: 'a'.repeat(256),
        type: 'direct' as const
      }
      
      expect(() => CreateExchangeRequestSchema.parse(invalidRequest)).toThrow()
    })
  })

  describe('CreateQueueRequestSchema', () => {
    test('should validate valid queue request', () => {
      const validRequest = {
        name: 'test-queue',
        durable: false,
        exclusive: true,
        auto_delete: true,
        arguments: { 'x-message-ttl': 60000 }
      }
      
      const result = CreateQueueRequestSchema.parse(validRequest)
      expect(result).toEqual(validRequest)
    })

    test('should apply defaults for optional fields', () => {
      const minimalRequest = {
        name: 'test-queue'
      }
      
      const result = CreateQueueRequestSchema.parse(minimalRequest)
      expect(result).toEqual({
        name: 'test-queue',
        durable: true,
        exclusive: false,
        auto_delete: false,
        arguments: {}
      })
    })

    test('should reject empty name', () => {
      const invalidRequest = {
        name: ''
      }
      
      expect(() => CreateQueueRequestSchema.parse(invalidRequest)).toThrow()
    })
  })

  describe('CreateBindingRequestSchema', () => {
    test('should validate valid binding request', () => {
      const validRequest = {
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'queue' as const,
        routing_key: 'test.key',
        arguments: { 'x-match': 'all' }
      }
      
      const result = CreateBindingRequestSchema.parse(validRequest)
      expect(result).toEqual(validRequest)
    })

    test('should apply defaults for optional fields', () => {
      const minimalRequest = {
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'queue' as const
      }
      
      const result = CreateBindingRequestSchema.parse(minimalRequest)
      expect(result).toEqual({
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'queue',
        routing_key: '',
        arguments: {}
      })
    })

    test('should reject invalid destination type', () => {
      const invalidRequest = {
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'invalid'
      }
      
      expect(() => CreateBindingRequestSchema.parse(invalidRequest)).toThrow()
    })
  })

  describe('PublishMessageRequestSchema', () => {
    test('should validate valid message request with string payload', () => {
      const validRequest = {
        exchange: 'test-exchange',
        routing_key: 'test.key',
        payload: 'test message',
        properties: {
          content_type: 'text/plain',
          delivery_mode: 2,
          priority: 5
        }
      }
      
      const result = PublishMessageRequestSchema.parse(validRequest)
      expect(result).toEqual(validRequest)
    })

    test('should validate valid message request with object payload', () => {
      const validRequest = {
        exchange: 'test-exchange',
        routing_key: 'test.key',
        payload: { message: 'test', count: 42 }
      }
      
      const result = PublishMessageRequestSchema.parse(validRequest)
      expect(result).toEqual(validRequest)
    })

    test('should apply defaults for optional fields', () => {
      const minimalRequest = {
        exchange: 'test-exchange',
        payload: 'test message'
      }
      
      const result = PublishMessageRequestSchema.parse(minimalRequest)
      expect(result).toEqual({
        exchange: 'test-exchange',
        routing_key: '',
        payload: 'test message'
      })
    })

    test('should reject invalid delivery mode', () => {
      const invalidRequest = {
        exchange: 'test-exchange',
        payload: 'test',
        properties: {
          delivery_mode: 3
        }
      }
      
      expect(() => PublishMessageRequestSchema.parse(invalidRequest)).toThrow()
    })

    test('should reject invalid priority', () => {
      const invalidRequest = {
        exchange: 'test-exchange',
        payload: 'test',
        properties: {
          priority: 256
        }
      }
      
      expect(() => PublishMessageRequestSchema.parse(invalidRequest)).toThrow()
    })
  })
})

describe('Model Validation Schemas', () => {
  describe('ExchangeSchema', () => {
    test('should validate complete exchange model', () => {
      const validExchange = {
        name: 'test-exchange',
        type: 'topic' as const,
        durable: true,
        auto_delete: false,
        internal: false,
        arguments: { 'x-test': 'value' },
        vhost: '/',
        user_who_performed_action: 'admin',
        message_stats: {
          publish_in: 100,
          publish_in_details: { rate: 5.0 },
          publish_out: 95,
          publish_out_details: { rate: 4.8 }
        }
      }
      
      const result = ExchangeSchema.parse(validExchange)
      expect(result).toEqual(validExchange)
    })

    test('should validate minimal exchange model', () => {
      const minimalExchange = {
        name: 'test-exchange',
        type: 'direct' as const,
        durable: true,
        auto_delete: false,
        internal: false,
        arguments: {}
      }
      
      const result = ExchangeSchema.parse(minimalExchange)
      expect(result).toEqual(minimalExchange)
    })
  })

  describe('QueueSchema', () => {
    test('should validate complete queue model', () => {
      const validQueue = {
        name: 'test-queue',
        durable: true,
        exclusive: false,
        auto_delete: false,
        arguments: { 'x-message-ttl': 60000 },
        node: 'rabbit@localhost',
        state: 'running' as const,
        consumers: 2,
        messages: 10,
        messages_ready: 8,
        messages_unacknowledged: 2,
        vhost: '/',
        policy: 'test-policy',
        exclusive_consumer_tag: null,
        message_stats: {
          ack: 50,
          ack_details: { rate: 2.5 },
          deliver: 55,
          deliver_details: { rate: 2.8 }
        },
        consumer_details: [{
          consumer_tag: 'ctag-1',
          exclusive: false,
          ack_required: true,
          prefetch_count: 10,
          channel_details: {
            name: '127.0.0.1:5672 -> 127.0.0.1:54321 (1)',
            number: 1,
            user: 'guest',
            connection_name: '127.0.0.1:5672 -> 127.0.0.1:54321',
            peer_port: 54321,
            peer_host: '127.0.0.1'
          }
        }]
      }
      
      const result = QueueSchema.parse(validQueue)
      expect(result).toEqual(validQueue)
    })
  })

  describe('BindingSchema', () => {
    test('should validate complete binding model', () => {
      const validBinding = {
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'queue' as const,
        routing_key: 'test.routing.key',
        arguments: { 'x-match': 'all' },
        vhost: '/',
        properties_key: 'test.routing.key'
      }
      
      const result = BindingSchema.parse(validBinding)
      expect(result).toEqual(validBinding)
    })
  })

  describe('ConnectionSchema', () => {
    test('should validate complete connection model', () => {
      const validConnection = {
        name: '127.0.0.1:5672 -> 127.0.0.1:54321',
        node: 'rabbit@localhost',
        state: 'running' as const,
        channels: 1,
        user: 'guest',
        vhost: '/',
        protocol: 'AMQP 0-9-1',
        auth_mechanism: 'PLAIN',
        ssl: false,
        peer_host: '127.0.0.1',
        peer_port: 54321,
        host: '127.0.0.1',
        port: 5672,
        type: 'network' as const,
        timeout: 60,
        frame_max: 131072,
        channel_max: 2047,
        client_properties: { product: 'test-client' },
        recv_oct: 1024,
        recv_oct_details: { rate: 10.5 },
        send_oct: 2048,
        send_oct_details: { rate: 20.5 },
        connected_at: 1640995200000
      }
      
      const result = ConnectionSchema.parse(validConnection)
      expect(result).toEqual(validConnection)
    })
  })

  describe('MessageSchema', () => {
    test('should validate complete message model', () => {
      const validMessage = {
        payload: { message: 'test', count: 42 },
        properties: {
          content_type: 'application/json',
          delivery_mode: 2,
          priority: 5,
          correlation_id: 'test-correlation',
          headers: { 'x-custom': 'value' }
        },
        routing_key: 'test.key',
        exchange: 'test-exchange',
        redelivered: false,
        payload_bytes: 1024,
        payload_encoding: 'utf-8',
        message_count: 1,
        consumer_tag: 'ctag-1',
        delivery_tag: 1,
        ack_required: true
      }
      
      const result = MessageSchema.parse(validMessage)
      expect(result).toEqual(validMessage)
    })
  })
})

describe('Topology Data Schema', () => {
  test('should validate complete topology data', () => {
    const validTopology = {
      exchanges: [{
        name: 'test-exchange',
        type: 'direct' as const,
        durable: true,
        auto_delete: false,
        internal: false,
        arguments: {}
      }],
      queues: [{
        name: 'test-queue',
        durable: true,
        exclusive: false,
        auto_delete: false,
        arguments: {},
        node: 'rabbit@localhost',
        state: 'running' as const,
        consumers: 0,
        messages: 0
      }],
      bindings: [{
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'queue' as const,
        routing_key: '',
        arguments: {}
      }],
      connections: [{
        name: 'test-connection',
        node: 'rabbit@localhost',
        state: 'running' as const,
        channels: 1,
        user: 'guest',
        vhost: '/',
        protocol: 'AMQP 0-9-1',
        auth_mechanism: 'PLAIN',
        ssl: false,
        peer_host: '127.0.0.1',
        peer_port: 54321,
        host: '127.0.0.1',
        port: 5672,
        type: 'network' as const
      }]
    }
    
    const result = TopologyDataSchema.parse(validTopology)
    expect(result).toEqual(validTopology)
  })

  test('should validate empty topology data', () => {
    const emptyTopology = {
      exchanges: [],
      queues: [],
      bindings: [],
      connections: []
    }
    
    const result = TopologyDataSchema.parse(emptyTopology)
    expect(result).toEqual(emptyTopology)
  })
})

describe('API Response Schema', () => {
  test('should validate successful API response', () => {
    const successResponse = {
      success: true,
      data: { message: 'Operation completed' },
      message: 'Success'
    }
    
    const result = ApiResponseSchema.parse(successResponse)
    expect(result).toEqual(successResponse)
  })

  test('should validate error API response', () => {
    const errorResponse = {
      success: false,
      error: 'Something went wrong',
      message: 'Error occurred'
    }
    
    const result = ApiResponseSchema.parse(errorResponse)
    expect(result).toEqual(errorResponse)
  })

  test('should validate minimal API response', () => {
    const minimalResponse = {
      success: true
    }
    
    const result = ApiResponseSchema.parse(minimalResponse)
    expect(result).toEqual(minimalResponse)
  })
})

describe('Raw Response Schemas', () => {
  test('should validate raw exchange response', () => {
    const rawExchange = {
      name: 'test-exchange',
      type: 'direct',
      durable: true,
      auto_delete: false,
      internal: false,
      arguments: {},
      vhost: '/',
      message_stats: {
        publish_in: 100,
        publish_in_details: { rate: 5.0 }
      }
    }
    
    const result = RawExchangeResponseSchema.parse(rawExchange)
    expect(result).toEqual(rawExchange)
  })

  test('should validate raw queue response', () => {
    const rawQueue = {
      name: 'test-queue',
      durable: true,
      exclusive: false,
      auto_delete: false,
      arguments: {},
      node: 'rabbit@localhost',
      state: 'running',
      consumers: 0,
      messages: 0,
      vhost: '/'
    }
    
    const result = RawQueueResponseSchema.parse(rawQueue)
    expect(result).toEqual(rawQueue)
  })

  test('should validate raw binding response', () => {
    const rawBinding = {
      source: 'test-exchange',
      destination: 'test-queue',
      destination_type: 'queue',
      routing_key: '',
      arguments: {},
      vhost: '/'
    }
    
    const result = RawBindingResponseSchema.parse(rawBinding)
    expect(result).toEqual(rawBinding)
  })

  test('should validate raw connection response', () => {
    const rawConnection = {
      name: 'test-connection',
      node: 'rabbit@localhost',
      state: 'running',
      channels: 1,
      user: 'guest',
      vhost: '/',
      protocol: 'AMQP 0-9-1',
      auth_mechanism: 'PLAIN',
      ssl: false,
      peer_host: '127.0.0.1',
      peer_port: 54321,
      host: '127.0.0.1',
      port: 5672,
      type: 'network'
    }
    
    const result = RawConnectionResponseSchema.parse(rawConnection)
    expect(result).toEqual(rawConnection)
  })
})