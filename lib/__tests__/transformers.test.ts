// Unit tests for data model transformations
import {
  transformExchange,
  transformExchanges,
  transformQueue,
  transformQueues,
  transformBinding,
  transformBindings,
  transformConnection,
  transformConnections,
  transformTopologyData,
  exchangeToApiRequest,
  queueToApiRequest,
  bindingToApiRequest,
  transformMessagePayload,
  parseMessagePayload,
  normalizeQueueState,
  normalizeConnectionState,
  normalizeExchangeType,
  transformApiError
} from '../transformers'

import {
  RawExchangeResponse,
  RawQueueResponse,
  RawBindingResponse,
  RawConnectionResponse,
  Exchange,
  Queue,
  Binding,
  Connection
} from '../../types/rabbitmq'

describe('Exchange Transformations', () => {
  const mockRawExchange: RawExchangeResponse = {
    name: 'test-exchange',
    type: 'direct',
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

  test('should transform raw exchange response to Exchange model', () => {
    const result = transformExchange(mockRawExchange)
    
    expect(result).toEqual({
      name: 'test-exchange',
      type: 'direct',
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
    })
  })

  test('should transform array of raw exchanges', () => {
    const rawExchanges = [mockRawExchange, { ...mockRawExchange, name: 'test-exchange-2' }]
    const result = transformExchanges(rawExchanges)
    
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('test-exchange')
    expect(result[1].name).toBe('test-exchange-2')
  })

  test('should handle exchange without message stats', () => {
    const rawExchange = { ...mockRawExchange, message_stats: undefined }
    const result = transformExchange(rawExchange)
    
    expect(result.message_stats).toBeUndefined()
  })

  test('should transform exchange to API request format', () => {
    const exchange: Partial<Exchange> = {
      type: 'topic',
      durable: false,
      auto_delete: true,
      internal: false,
      arguments: { 'x-custom': 'test' }
    }
    
    const result = exchangeToApiRequest(exchange)
    
    expect(result).toEqual({
      type: 'topic',
      durable: false,
      auto_delete: true,
      internal: false,
      arguments: { 'x-custom': 'test' }
    })
  })

  test('should use defaults when transforming exchange to API request', () => {
    const exchange: Partial<Exchange> = { type: 'fanout' }
    const result = exchangeToApiRequest(exchange)
    
    expect(result).toEqual({
      type: 'fanout',
      durable: true,
      auto_delete: false,
      internal: false,
      arguments: {}
    })
  })
})

describe('Queue Transformations', () => {
  const mockRawQueue: RawQueueResponse = {
    name: 'test-queue',
    durable: true,
    exclusive: false,
    auto_delete: false,
    arguments: { 'x-message-ttl': 60000 },
    node: 'rabbit@localhost',
    state: 'running',
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
      deliver_details: { rate: 2.8 },
      publish: 60,
      publish_details: { rate: 3.0 }
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

  test('should transform raw queue response to Queue model', () => {
    const result = transformQueue(mockRawQueue)
    
    expect(result).toEqual({
      name: 'test-queue',
      durable: true,
      exclusive: false,
      auto_delete: false,
      arguments: { 'x-message-ttl': 60000 },
      node: 'rabbit@localhost',
      state: 'running',
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
        deliver_details: { rate: 2.8 },
        publish: 60,
        publish_details: { rate: 3.0 }
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
    })
  })

  test('should transform array of raw queues', () => {
    const rawQueues = [mockRawQueue, { ...mockRawQueue, name: 'test-queue-2' }]
    const result = transformQueues(rawQueues)
    
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('test-queue')
    expect(result[1].name).toBe('test-queue-2')
  })

  test('should handle queue without optional fields', () => {
    const rawQueue = {
      ...mockRawQueue,
      message_stats: undefined,
      consumer_details: undefined,
      policy: undefined
    }
    const result = transformQueue(rawQueue)
    
    expect(result.message_stats).toBeUndefined()
    expect(result.consumer_details).toBeUndefined()
    expect(result.policy).toBeUndefined()
  })

  test('should transform queue to API request format', () => {
    const queue: Partial<Queue> = {
      durable: false,
      exclusive: true,
      auto_delete: true,
      arguments: { 'x-max-length': 1000 }
    }
    
    const result = queueToApiRequest(queue)
    
    expect(result).toEqual({
      durable: false,
      exclusive: true,
      auto_delete: true,
      arguments: { 'x-max-length': 1000 }
    })
  })
})

describe('Binding Transformations', () => {
  const mockRawBinding: RawBindingResponse = {
    source: 'test-exchange',
    destination: 'test-queue',
    destination_type: 'queue',
    routing_key: 'test.routing.key',
    arguments: { 'x-match': 'all' },
    vhost: '/',
    properties_key: 'test.routing.key'
  }

  test('should transform raw binding response to Binding model', () => {
    const result = transformBinding(mockRawBinding)
    
    expect(result).toEqual({
      source: 'test-exchange',
      destination: 'test-queue',
      destination_type: 'queue',
      routing_key: 'test.routing.key',
      arguments: { 'x-match': 'all' },
      vhost: '/',
      properties_key: 'test.routing.key'
    })
  })

  test('should transform array of raw bindings', () => {
    const rawBindings = [mockRawBinding, { ...mockRawBinding, destination: 'test-queue-2' }]
    const result = transformBindings(rawBindings)
    
    expect(result).toHaveLength(2)
    expect(result[0].destination).toBe('test-queue')
    expect(result[1].destination).toBe('test-queue-2')
  })

  test('should transform binding to API request format', () => {
    const binding: Partial<Binding> = {
      routing_key: 'custom.key',
      arguments: { 'x-custom': 'value' }
    }
    
    const result = bindingToApiRequest(binding)
    
    expect(result).toEqual({
      routing_key: 'custom.key',
      arguments: { 'x-custom': 'value' }
    })
  })
})

describe('Connection Transformations', () => {
  const mockRawConnection: RawConnectionResponse = {
    name: '127.0.0.1:5672 -> 127.0.0.1:54321',
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
    type: 'network',
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

  test('should transform raw connection response to Connection model', () => {
    const result = transformConnection(mockRawConnection)
    
    expect(result).toEqual({
      name: '127.0.0.1:5672 -> 127.0.0.1:54321',
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
      type: 'network',
      timeout: 60,
      frame_max: 131072,
      channel_max: 2047,
      client_properties: { product: 'test-client' },
      recv_oct: 1024,
      recv_oct_details: { rate: 10.5 },
      send_oct: 2048,
      send_oct_details: { rate: 20.5 },
      connected_at: 1640995200000
    })
  })

  test('should transform array of raw connections', () => {
    const rawConnections = [mockRawConnection, { ...mockRawConnection, name: 'connection-2' }]
    const result = transformConnections(rawConnections)
    
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('127.0.0.1:5672 -> 127.0.0.1:54321')
    expect(result[1].name).toBe('connection-2')
  })
})

describe('Topology Data Transformation', () => {
  test('should transform complete topology data', () => {
    const rawData = {
      exchanges: [{
        name: 'test-exchange',
        type: 'direct',
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
        state: 'running',
        consumers: 0,
        messages: 0
      }],
      bindings: [{
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'queue',
        routing_key: '',
        arguments: {}
      }],
      connections: [{
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
      }]
    }

    const result = transformTopologyData(rawData)
    
    expect(result.exchanges).toHaveLength(1)
    expect(result.queues).toHaveLength(1)
    expect(result.bindings).toHaveLength(1)
    expect(result.connections).toHaveLength(1)
    expect(result.exchanges[0].name).toBe('test-exchange')
    expect(result.queues[0].name).toBe('test-queue')
  })
})

describe('Message Payload Transformations', () => {
  test('should transform string payload', () => {
    const result = transformMessagePayload('test message')
    expect(result).toBe('test message')
  })

  test('should transform object payload to JSON string', () => {
    const payload = { message: 'test', count: 42 }
    const result = transformMessagePayload(payload)
    expect(result).toBe('{"message":"test","count":42}')
  })

  test('should parse plain text payload', () => {
    const result = parseMessagePayload('test message', 'text/plain')
    expect(result).toBe('test message')
  })

  test('should parse JSON payload', () => {
    const jsonString = '{"message":"test","count":42}'
    const result = parseMessagePayload(jsonString, 'application/json')
    expect(result).toEqual({ message: 'test', count: 42 })
  })

  test('should handle invalid JSON gracefully', () => {
    const invalidJson = '{"invalid": json}'
    const result = parseMessagePayload(invalidJson, 'application/json')
    expect(result).toBe(invalidJson)
  })

  test('should return string for unknown content type', () => {
    const result = parseMessagePayload('test', 'application/xml')
    expect(result).toBe('test')
  })
})

describe('State Normalization', () => {
  test('should normalize queue states', () => {
    expect(normalizeQueueState('RUNNING')).toBe('running')
    expect(normalizeQueueState('Idle')).toBe('idle')
    expect(normalizeQueueState('FLOW')).toBe('flow')
    expect(normalizeQueueState('DOWN')).toBe('down')
    expect(normalizeQueueState('unknown')).toBe('idle')
  })

  test('should normalize connection states', () => {
    expect(normalizeConnectionState('RUNNING')).toBe('running')
    expect(normalizeConnectionState('Blocked')).toBe('blocked')
    expect(normalizeConnectionState('FLOW')).toBe('flow')
    expect(normalizeConnectionState('CLOSING')).toBe('closing')
    expect(normalizeConnectionState('CLOSED')).toBe('closed')
    expect(normalizeConnectionState('unknown')).toBe('running')
  })

  test('should normalize exchange types', () => {
    expect(normalizeExchangeType('DIRECT')).toBe('direct')
    expect(normalizeExchangeType('Fanout')).toBe('fanout')
    expect(normalizeExchangeType('TOPIC')).toBe('topic')
    expect(normalizeExchangeType('HEADERS')).toBe('headers')
  })

  test('should throw error for invalid exchange type', () => {
    expect(() => normalizeExchangeType('invalid')).toThrow('Invalid exchange type: invalid')
  })
})

describe('API Error Transformation', () => {
  test('should transform API response error', () => {
    const error = {
      response: {
        status: 404,
        data: {
          reason: 'Not Found',
          error: 'Resource does not exist'
        }
      }
    }
    
    const result = transformApiError(error)
    
    expect(result).toEqual({
      message: 'Not Found',
      code: '404',
      details: {
        reason: 'Not Found',
        error: 'Resource does not exist'
      }
    })
  })

  test('should transform generic error', () => {
    const error = new Error('Connection failed')
    error.code = 'ECONNREFUSED'
    
    const result = transformApiError(error)
    
    expect(result).toEqual({
      message: 'Connection failed',
      code: 'ECONNREFUSED',
      details: error
    })
  })

  test('should handle unknown error', () => {
    const error = { unknown: 'error' }
    const result = transformApiError(error)
    
    expect(result).toEqual({
      message: 'Unknown error occurred',
      details: error
    })
  })
})