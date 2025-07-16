import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import BindingEdge from '../edges/BindingEdge'
import { Position } from '@xyflow/react'

// Mock React Flow functions
jest.mock('@xyflow/react', () => ({
  getBezierPath: jest.fn(() => ['M 0 0 L 100 100', 50, 50]),
  EdgeLabelRenderer: ({ children }: any) => <div data-testid="edge-label-renderer">{children}</div>,
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}))

describe('BindingEdge', () => {
  const mockProps = {
    id: 'edge-1',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: undefined,
    selected: false,
  }

  it('renders basic edge path', () => {
    const { container } = render(<BindingEdge {...mockProps} />)
    
    const path = container.querySelector('path')
    expect(path).toBeInTheDocument()
    expect(path).toHaveAttribute('id', 'edge-1')
    expect(path).toHaveAttribute('d', 'M 0 0 L 100 100')
  })

  it('applies default styling', () => {
    const { container } = render(<BindingEdge {...mockProps} />)
    
    const path = container.querySelector('path')
    expect(path).toHaveStyle({
      stroke: '#6b7280', // gray-500
      strokeWidth: '1.5',
      fill: 'none',
    })
  })

  it('applies selected styling', () => {
    const { container } = render(<BindingEdge {...mockProps} selected={true} />)
    
    const path = container.querySelector('path')
    expect(path).toHaveStyle({
      stroke: '#3b82f6', // blue-500
    })
  })

  it('applies active styling for high message rate', () => {
    const propsWithHighRate = {
      ...mockProps,
      data: { messageRate: 150 }
    }
    
    const { container } = render(<BindingEdge {...propsWithHighRate} />)
    
    const path = container.querySelector('path')
    expect(path).toHaveStyle({
      stroke: '#10b981', // green-500
      strokeWidth: '3',
    })
  })

  it('applies medium styling for medium message rate', () => {
    const propsWithMediumRate = {
      ...mockProps,
      data: { messageRate: 50 }
    }
    
    const { container } = render(<BindingEdge {...propsWithMediumRate} />)
    
    const path = container.querySelector('path')
    expect(path).toHaveStyle({
      stroke: '#10b981', // green-500
      strokeWidth: '2',
    })
  })

  it('shows label with routing key', () => {
    const propsWithRoutingKey = {
      ...mockProps,
      data: { routingKey: 'user.created' }
    }
    
    render(<BindingEdge {...propsWithRoutingKey} />)
    
    expect(screen.getByTestId('edge-label-renderer')).toBeInTheDocument()
    expect(screen.getByText('user.created')).toBeInTheDocument()
  })

  it('shows label with message rate', () => {
    const propsWithRate = {
      ...mockProps,
      data: { messageRate: 25.5 }
    }
    
    render(<BindingEdge {...propsWithRate} />)
    
    expect(screen.getByTestId('edge-label-renderer')).toBeInTheDocument()
    expect(screen.getByText('25.5/s')).toBeInTheDocument()
  })

  it('shows label with message count', () => {
    const propsWithCount = {
      ...mockProps,
      data: { messageCount: 1500, messageRate: 10 }
    }
    
    render(<BindingEdge {...propsWithCount} />)
    
    expect(screen.getByTestId('edge-label-renderer')).toBeInTheDocument()
    expect(screen.getByText('1,500 msgs')).toBeInTheDocument()
    expect(screen.getByText('10.0/s')).toBeInTheDocument()
  })

  it('shows complete label with all data', () => {
    const propsWithAllData = {
      ...mockProps,
      data: { 
        routingKey: 'order.processed',
        messageRate: 15.2,
        messageCount: 2500
      }
    }
    
    render(<BindingEdge {...propsWithAllData} />)
    
    expect(screen.getByText('order.processed')).toBeInTheDocument()
    expect(screen.getByText('15.2/s')).toBeInTheDocument()
    expect(screen.getByText('2,500 msgs')).toBeInTheDocument()
  })

  it('applies selected styling to label', () => {
    const propsWithData = {
      ...mockProps,
      data: { routingKey: 'test.key' },
      selected: true
    }
    
    render(<BindingEdge {...propsWithData} />)
    
    const labelContainer = screen.getByText('test.key').closest('div')
    expect(labelContainer).toHaveClass('border-blue-500', 'bg-blue-50')
  })

  it('does not show label when no relevant data', () => {
    const propsWithoutData = {
      ...mockProps,
      data: { someOtherProperty: 'value' }
    }
    
    render(<BindingEdge {...propsWithoutData} />)
    
    expect(screen.queryByTestId('edge-label-renderer')).not.toBeInTheDocument()
  })

  it('does not show label for zero message rate', () => {
    const propsWithZeroRate = {
      ...mockProps,
      data: { messageRate: 0 }
    }
    
    render(<BindingEdge {...propsWithZeroRate} />)
    
    expect(screen.queryByTestId('edge-label-renderer')).not.toBeInTheDocument()
  })
})