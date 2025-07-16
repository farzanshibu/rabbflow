import { NextRequest } from 'next/server'
import { GET, POST } from '../exchanges/route'
import { RabbitMQApiClient } from '@/lib/rabbitmq'

// Mock the RabbitMQ API client
jest.mock('@/lib/rabbitmq')
const mockedRabbitMQApiClient = RabbitMQApiClient as jest.Mocked<typeof RabbitMQApiClient>

describe('/api/rabbitmq/exchanges', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return exchanges successfully', async () => {
      const mockTopology = {
        exchanges: [
          { name: 'test-exchange', type: 'direct', durable: true }
        ],
        queues: [],
        bindings: [],
        connections: []
      }

      mockedRabbitMQApiClient.getTopology.mockResolvedValue(mockTopology)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockTopology.exchanges)
    })

    it('should handle API errors', async () => {
      mockedRabbitMQApiClient.getTopology.mockRejectedValue(new Error('Connection failed'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch exchanges')
    })
  })

  describe('POST', () => {
    it('should create exchange successfully', async () => {
      const exchangeData = {
        name: 'test-exchange',
        type: 'direct' as const,
        durable: true
      }

      mockedRabbitMQApiClient.createExchange.mockResolvedValue()

      const request = new NextRequest('http://localhost/api/rabbitmq/exchanges', {
        method: 'POST',
        body: JSON.stringify(exchangeData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toContain('test-exchange')
      expect(mockedRabbitMQApiClient.createExchange).toHaveBeenCalledWith('/', exchangeData)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'test-exchange'
        // missing type
      }

      const request = new NextRequest('http://localhost/api/rabbitmq/exchanges', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required fields')
    })

    it('should validate exchange type', async () => {
      const invalidData = {
        name: 'test-exchange',
        type: 'invalid-type'
      }

      const request = new NextRequest('http://localhost/api/rabbitmq/exchanges', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid exchange type')
    })

    it('should handle creation errors', async () => {
      const exchangeData = {
        name: 'test-exchange',
        type: 'direct' as const
      }

      mockedRabbitMQApiClient.createExchange.mockRejectedValue(new Error('Exchange already exists'))

      const request = new NextRequest('http://localhost/api/rabbitmq/exchanges', {
        method: 'POST',
        body: JSON.stringify(exchangeData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create exchange')
    })
  })
})