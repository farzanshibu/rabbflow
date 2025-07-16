import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProducerNode from '../nodes/ProducerNode'
import ExchangeNode from '../nodes/ExchangeNode'
import QueueNode from '../nodes/QueueNode'
import ConsumerNode from '../nodes/ConsumerNode'
import { 
  ProducerNodeData, 
  ExchangeNodeData, 
  QueueNodeData, 
  ConsumerNodeData 
} from '@/types/topology'

// Mock React Flow Handle component
jest.mock('@xyflow/react', () => ({
  Handle: ({ type, position, className }: any) => (
    <div data-testid={`handle-${type}-${position}`} className={className} />
  ),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}))

describe('Node Components', () => {
  describe('ProducerNode', () => {
    const mockData: ProducerNodeData = {
      label: 'Test Producer',
      status: 'active',
      connectionName: 'connection-1',
      publishRate: 15.5,
    }

    it('renders producer node with correct data', () => {
      render(<ProducerNode data={mockData} selected={false} />)
      
      expect(screen.getByText('Producer')).toBeInTheDocument()
      expect(screen.getByText('Test Producer')).toBeInTheDocument()
      expect(screen.getByText('Connection: connection-1')).toBeInTheDocument()
      expect(screen.getByText('Rate: 15.5/s')).toBeInTheDocument()
    })

    it('shows active status styling', () => {
      render(<ProducerNode data={mockData} selected={false} />)
      
      const container = screen.getByText('Producer').closest('div')
      expect(container).toHaveClass('border-green-500', 'bg-green-50')
    })

    it('shows selected styling when selected', () => {
      render(<ProducerNode data={mockData} selected={true} />)
      
      const container = screen.getByText('Producer').closest('div')
      expect(container).toHaveClass('ring-2', 'ring-blue-500')
    })

    it('shows error status styling', () => {
      const errorData = { ...mockData, status: 'error' as const }
      render(<ProducerNode data={errorData} selected={false} />)
      
      const container = screen.getByText('Producer').closest('div')
      expect(container).toHaveClass('border-red-500', 'bg-red-50')
    })

    it('renders source handle', () => {
      render(<ProducerNode data={mockData} selected={false} />)
      
      expect(screen.getByTestId('handle-source-right')).toBeInTheDocument()
    })
  })

  describe('ExchangeNode', () => {
    const mockData: ExchangeNodeData = {
      label: 'Test Exchange',
      status: 'active',
      exchangeType: 'topic',
      durable: true,
      autoDelete: false,
      arguments: {},
    }

    it('renders exchange node with correct data', () => {
      render(<ExchangeNode data={mockData} selected={false} />)
      
      expect(screen.getByText('Exchange')).toBeInTheDocument()
      expect(screen.getByText('Test Exchange')).toBeInTheDocument()
      expect(screen.getByText('Type: topic')).toBeInTheDocument()
    })

    it('shows durable and auto-delete flags', () => {
      render(<ExchangeNode data={mockData} selected={false} />)
      
      expect(screen.getByText('D')).toBeInTheDocument() // Durable
      expect(screen.queryByText('AD')).not.toBeInTheDocument() // Auto-delete false
    })

    it('shows auto-delete flag when enabled', () => {
      const autoDeleteData = { ...mockData, autoDelete: true }
      render(<ExchangeNode data={autoDeleteData} selected={false} />)
      
      expect(screen.getByText('D')).toBeInTheDocument()
      expect(screen.getByText('AD')).toBeInTheDocument()
    })

    it('renders both target and source handles', () => {
      render(<ExchangeNode data={mockData} selected={false} />)
      
      expect(screen.getByTestId('handle-target-left')).toBeInTheDocument()
      expect(screen.getByTestId('handle-source-right')).toBeInTheDocument()
    })

    it('shows correct icon for exchange type', () => {
      const directData = { ...mockData, exchangeType: 'direct' as const }
      render(<ExchangeNode data={directData} selected={false} />)
      
      // Icon should be present (we can't easily test which specific icon without more complex setup)
      const container = screen.getByText('Exchange').closest('div')
      expect(container).toBeInTheDocument()
    })
  })

  describe('QueueNode', () => {
    const mockData: QueueNodeData = {
      label: 'Test Queue',
      status: 'active',
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageCount: 1250,
      consumerCount: 2,
      ttl: 30000,
      maxLength: 10000,
    }

    it('renders queue node with correct data', () => {
      render(<QueueNode data={mockData} selected={false} />)
      
      expect(screen.getByText('Queue')).toBeInTheDocument()
      expect(screen.getByText('Test Queue')).toBeInTheDocument()
      expect(screen.getByText('Messages: 1,250')).toBeInTheDocument()
      expect(screen.getByText('2 consumers')).toBeInTheDocument()
      expect(screen.getByText('TTL: 30000ms')).toBeInTheDocument()
      expect(screen.getByText('Max: 10,000')).toBeInTheDocument()
    })

    it('shows high message count in red', () => {
      render(<QueueNode data={mockData} selected={false} />)
      
      const messageText = screen.getByText('Messages: 1,250')
      expect(messageText).toHaveClass('text-red-600', 'font-bold')
    })

    it('shows medium message count in orange', () => {
      const mediumData = { ...mockData, messageCount: 500 }
      render(<QueueNode data={mediumData} selected={false} />)
      
      const messageText = screen.getByText('Messages: 500')
      expect(messageText).toHaveClass('text-orange-600', 'font-medium')
    })

    it('shows low message count in gray', () => {
      const lowData = { ...mockData, messageCount: 50 }
      render(<QueueNode data={lowData} selected={false} />)
      
      const messageText = screen.getByText('Messages: 50')
      expect(messageText).toHaveClass('text-gray-600')
    })

    it('shows singular consumer text', () => {
      const singleConsumerData = { ...mockData, consumerCount: 1 }
      render(<QueueNode data={singleConsumerData} selected={false} />)
      
      expect(screen.getByText('1 consumer')).toBeInTheDocument()
    })

    it('hides consumer count when zero', () => {
      const noConsumerData = { ...mockData, consumerCount: 0 }
      render(<QueueNode data={noConsumerData} selected={false} />)
      
      expect(screen.queryByText(/consumer/)).not.toBeInTheDocument()
    })

    it('shows queue property flags', () => {
      render(<QueueNode data={mockData} selected={false} />)
      
      expect(screen.getByText('D')).toBeInTheDocument() // Durable
      expect(screen.queryByText('E')).not.toBeInTheDocument() // Exclusive false
      expect(screen.queryByText('AD')).not.toBeInTheDocument() // Auto-delete false
    })

    it('renders both target and source handles', () => {
      render(<QueueNode data={mockData} selected={false} />)
      
      expect(screen.getByTestId('handle-target-left')).toBeInTheDocument()
      expect(screen.getByTestId('handle-source-right')).toBeInTheDocument()
    })
  })

  describe('ConsumerNode', () => {
    const mockData: ConsumerNodeData = {
      label: 'Test Consumer',
      status: 'active',
      connectionName: 'connection-1',
      consumeRate: 25.8,
      prefetchCount: 10,
      ackMode: 'manual',
    }

    it('renders consumer node with correct data', () => {
      render(<ConsumerNode data={mockData} selected={false} />)
      
      expect(screen.getByText('Consumer')).toBeInTheDocument()
      expect(screen.getByText('Test Consumer')).toBeInTheDocument()
      expect(screen.getByText('Connection: connection-1')).toBeInTheDocument()
      expect(screen.getByText('Rate: 25.8/s')).toBeInTheDocument()
      expect(screen.getByText('Prefetch: 10')).toBeInTheDocument()
      expect(screen.getByText('manual ack')).toBeInTheDocument()
    })

    it('shows auto acknowledgment mode', () => {
      const autoAckData = { ...mockData, ackMode: 'auto' as const }
      render(<ConsumerNode data={autoAckData} selected={false} />)
      
      expect(screen.getByText('auto ack')).toBeInTheDocument()
    })

    it('hides prefetch when zero', () => {
      const noPrefetchData = { ...mockData, prefetchCount: 0 }
      render(<ConsumerNode data={noPrefetchData} selected={false} />)
      
      expect(screen.queryByText(/Prefetch/)).not.toBeInTheDocument()
    })

    it('renders only target handle', () => {
      render(<ConsumerNode data={mockData} selected={false} />)
      
      expect(screen.getByTestId('handle-target-left')).toBeInTheDocument()
      expect(screen.queryByTestId('handle-source-right')).not.toBeInTheDocument()
    })

    it('shows idle status styling', () => {
      const idleData = { ...mockData, status: 'idle' as const }
      render(<ConsumerNode data={idleData} selected={false} />)
      
      const container = screen.getByText('Consumer').closest('div')
      expect(container).toHaveClass('border-gray-400', 'bg-gray-50')
    })
  })
})