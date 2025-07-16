import axios from 'axios'
import { RabbitMQApiClient } from '../rabbitmq'
import type { 
  CreateExchangeRequest, 
  CreateQueueRequest, 
  CreateBindingRequest,
  PublishMessageRequest 
} from '@/types/api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock axios.create to return the mocked axios instance
mockedAxios.create = jest.fn(() => mockedAxios)

describe('RabbitMQApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTopology', () => {
    it('should fetch topology data successfully', async () => {
      const mockExchanges = [
        { name: 'test-exchange', type: 'direct', durable: true }
      ]
      const mockQueues = [
        { name: 'test-queue', durable: true, messages: 0 }
      ]
      const mockBindings = [
        { source: 'test-exchange', destination: 'test-queue', routing_key: 'test' }
      ]

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockExchanges })
        .mockResolvedValueOnce({ data: mockQueues })
        .mockResolvedValueOnce({ data: mockBindings })

      const result = await RabbitMQApiClient.getTopology()

      expect(mockedAxios.get).toHaveBeenCalledTimes(3)
      expect(mockedAxios.get).toHaveBeenCalledWith('/exchanges')
      expect(mockedAxios.get).toHaveBeenCalledWith('/queues')
      expect(mockedAxios.get).toHaveBeenCalledWith('/bindings')
      
      expect(result).toEqual({
        exchanges: mockExchanges,
        queues: mockQueues,
        bindings: mockBindings,
        connections: []
      })
    })

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'))

      await expect(RabbitMQApiClient.getTopology()).rejects.toThrow('API Error')
    })
  })

  describe('createExchange', () => {
    it('should create exchange successfully', async () => {
      const exchangeData: CreateExchangeRequest = {
        name: 'test-exchange',
        type: 'direct',
        durable: true,
        auto_delete: false
      }

      mockedAxios.put.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.createExchange('/', exchangeData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/exchanges/%2F/test-exchange',
        {
          type: 'direct',
          durable: true,
          auto_delete: false,
          internal: false,
          arguments: {}
        }
      )
    })

    it('should handle URL encoding for exchange names', async () => {
      const exchangeData: CreateExchangeRequest = {
        name: 'test exchange with spaces',
        type: 'topic'
      }

      mockedAxios.put.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.createExchange('/', exchangeData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/exchanges/%2F/test%20exchange%20with%20spaces',
        expect.any(Object)
      )
    })

    it('should use default values when not provided', async () => {
      const exchangeData: CreateExchangeRequest = {
        name: 'minimal-exchange',
        type: 'fanout'
      }

      mockedAxios.put.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.createExchange('/', exchangeData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/exchanges/%2F/minimal-exchange',
        {
          type: 'fanout',
          durable: true,
          auto_delete: false,
          internal: false,
          arguments: {}
        }
      )
    })
  })

  describe('deleteExchange', () => {
    it('should delete exchange successfully', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.deleteExchange('/', 'test-exchange')

      expect(mockedAxios.delete).toHaveBeenCalledWith('/exchanges/%2F/test-exchange')
    })

    it('should handle URL encoding for exchange names', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.deleteExchange('/', 'test exchange with spaces')

      expect(mockedAxios.delete).toHaveBeenCalledWith('/exchanges/%2F/test%20exchange%20with%20spaces')
    })
  })

  describe('createQueue', () => {
    it('should create queue successfully', async () => {
      const queueData: CreateQueueRequest = {
        name: 'test-queue',
        durable: true,
        exclusive: false,
        auto_delete: false
      }

      mockedAxios.put.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.createQueue('/', queueData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/queues/%2F/test-queue',
        {
          durable: true,
          exclusive: false,
          auto_delete: false,
          arguments: {}
        }
      )
    })

    it('should use default values when not provided', async () => {
      const queueData: CreateQueueRequest = {
        name: 'minimal-queue'
      }

      mockedAxios.put.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.createQueue('/', queueData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/queues/%2F/minimal-queue',
        {
          durable: true,
          exclusive: false,
          auto_delete: false,
          arguments: {}
        }
      )
    })
  })

  describe('deleteQueue', () => {
    it('should delete queue successfully', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.deleteQueue('/', 'test-queue')

      expect(mockedAxios.delete).toHaveBeenCalledWith('/queues/%2F/test-queue')
    })
  })

  describe('createBinding', () => {
    it('should create queue binding successfully', async () => {
      const bindingData: CreateBindingRequest = {
        source: 'test-exchange',
        destination: 'test-queue',
        destination_type: 'queue',
        routing_key: 'test.key'
      }

      mockedAxios.post.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.createBinding('/', bindingData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/bindings/%2F/e/test-exchange/q/test-queue',
        {
          routing_key: 'test.key',
          arguments: {}
        }
      )
    })

    it('should create exchange binding successfully', async () => {
      const bindingData: CreateBindingRequest = {
        source: 'source-exchange',
        destination: 'dest-exchange',
        destination_type: 'exchange',
        routing_key: 'test.key'
      }

      mockedAxios.post.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.createBinding('/', bindingData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/bindings/%2F/e/source-exchange/e/dest-exchange',
        {
          routing_key: 'test.key',
          arguments: {}
        }
      )
    })
  })

  describe('publishMessage', () => {
    it('should publish string message successfully', async () => {
      const messageData: PublishMessageRequest = {
        exchange: 'test-exchange',
        routing_key: 'test.key',
        payload: 'Hello World'
      }

      mockedAxios.post.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.publishMessage('/', messageData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/exchanges/%2F/test-exchange/publish',
        {
          routing_key: 'test.key',
          payload: 'Hello World',
          payload_encoding: 'string',
          properties: {}
        }
      )
    })

    it('should publish object message successfully', async () => {
      const messageData: PublishMessageRequest = {
        exchange: 'test-exchange',
        routing_key: 'test.key',
        payload: { message: 'Hello World', timestamp: 123456 },
        properties: {
          content_type: 'application/json',
          headers: { 'x-custom': 'value' }
        }
      }

      mockedAxios.post.mockResolvedValue({ data: {} })

      await RabbitMQApiClient.publishMessage('/', messageData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/exchanges/%2F/test-exchange/publish',
        {
          routing_key: 'test.key',
          payload: JSON.stringify({ message: 'Hello World', timestamp: 123456 }),
          payload_encoding: 'string',
          properties: {
            content_type: 'application/json',
            headers: { 'x-custom': 'value' }
          }
        }
      )
    })
  })

  describe('getMetrics', () => {
    it('should fetch metrics successfully', async () => {
      const mockOverview = { message_stats: { publish: 100 } }
      const mockQueues = [{ name: 'test-queue', messages: 5 }]
      const mockExchanges = [{ name: 'test-exchange', type: 'direct' }]
      const mockConnections = [{ name: 'connection-1', state: 'running' }]

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockOverview })
        .mockResolvedValueOnce({ data: mockQueues })
        .mockResolvedValueOnce({ data: mockExchanges })
        .mockResolvedValueOnce({ data: mockConnections })

      const result = await RabbitMQApiClient.getMetrics()

      expect(mockedAxios.get).toHaveBeenCalledTimes(4)
      expect(mockedAxios.get).toHaveBeenCalledWith('/overview')
      expect(mockedAxios.get).toHaveBeenCalledWith('/queues')
      expect(mockedAxios.get).toHaveBeenCalledWith('/exchanges')
      expect(mockedAxios.get).toHaveBeenCalledWith('/connections')

      expect(result).toEqual({
        overview: mockOverview,
        queues: mockQueues,
        exchanges: mockExchanges,
        connections: mockConnections
      })
    })
  })
})