import { NextRequest } from 'next/server'
import { GET, POST } from '../queues/route'
import { RabbitMQApiClient } from '@/lib/rabbitmq'

// Mock the RabbitMQ API client
jest.mock('@/lib/rabbitmq')
const mockedRabbitMQApiClient = RabbitMQApiClient as jest.Mocked<typeof RabbitMQApiClient>

describe('/api/rabbitmq/queues', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return queues successfully', async () => {
      const mockTopology = {
        exchanges: [],
        queues: [
          { name: 'test-queue', durable: true, messages: 0 }
        ],
        bindings: [],
        connections: []
      }

      mockedRabbitMQApiClient.getTopology.mockResolvedValue(mockTopology)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockTopology.queues)
    })

    it('should handle API errors', async () => {
      mockedRabbitMQApiClient.getTopology.mockRejectedValue(new Error('Connection failed'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch queues')
    })
  })

  describe('POST', () => {
    it('should create queue successfully', async () => {
      const queueData = {
        name: 'test-queue',
        durable: true,
        exclusive: false
      }

      mockedRabbitMQApiClient.createQueue.mockResolvedValue()

      const request = new NextRequest('http://localhost/api/rabbitmq/queues', {
        method: 'POST',
        body: JSON.stringify(queueData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toContain('test-queue')
      expect(mockedRabbitMQApiClient.createQueue).toHaveBeenCalledWith('/', queueData)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        durable: true
        // missing name
      }

      const request = new NextRequest('http://localhost/api/rabbitmq/queues', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required fields')
    })

    it('should handle creation errors', async () => {
      const queueData = {
        name: 'test-queue'
      }

      mockedRabbitMQApiClient.createQueue.mockRejectedValue(new Error('Queue already exists'))

      const request = new NextRequest('http://localhost/api/rabbitmq/queues', {
        method: 'POST',
        body: JSON.stringify(queueData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create queue')
    })
  })
})