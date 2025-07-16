import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TopologyCanvas from '../TopologyCanvas'
import { TopologyNode, TopologyEdge, NodeType } from '@/types/topology'
import { Position } from '@xyflow/react'

// Mock React Flow
jest.mock('@xyflow/react', () => ({
  ...jest.requireActual('@xyflow/react'),
  ReactFlow: ({ children, onNodeClick, onPaneClick, nodes, edges }: any) => (
    <div data-testid="react-flow">
      <div data-testid="nodes-count">{nodes.length}</div>
      <div data-testid="edges-count">{edges.length}</div>
      <button 
        data-testid="node-click" 
        onClick={() => onNodeClick({}, { id: 'test-node', type: 'producer' })}
      >
        Click Node
      </button>
      <button 
        data-testid="pane-click" 
        onClick={() => onPaneClick()}
      >
        Click Pane
      </button>
      {children}
    </div>
  ),
  ReactFlowProvider: ({ children }: any) => <div>{children}</div>,
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Panel: ({ children, position }: any) => (
    <div data-testid={`panel-${position}`}>{children}</div>
  ),
  useNodesState: (initialNodes: any) => [
    initialNodes,
    jest.fn(),
    jest.fn()
  ],
  useEdgesState: (initialEdges: any) => [
    initialEdges,
    jest.fn(),
    jest.fn()
  ],
  addEdge: jest.fn(),
}))

describe('TopologyCanvas', () => {
  const mockProps = {
    nodes: [] as TopologyNode[],
    edges: [] as TopologyEdge[],
    onNodeAdd: jest.fn(),
    onNodeDelete: jest.fn(),
    onNodeUpdate: jest.fn(),
    onEdgeAdd: jest.fn(),
    onEdgeDelete: jest.fn(),
    onNodeSelect: jest.fn(),
    selectedNodeId: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty topology canvas', () => {
    render(<TopologyCanvas {...mockProps} />)
    
    expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    expect(screen.getByTestId('background')).toBeInTheDocument()
    expect(screen.getByTestId('controls')).toBeInTheDocument()
    expect(screen.getByTestId('minimap')).toBeInTheDocument()
  })

  it('displays empty state message when no nodes', () => {
    render(<TopologyCanvas {...mockProps} />)
    
    expect(screen.getByText('No topology components')).toBeInTheDocument()
    expect(screen.getByText(/Add producers, exchanges, queues/)).toBeInTheDocument()
  })

  it('displays correct node and edge counts', () => {
    const nodes: TopologyNode[] = [
      {
        id: 'producer-1',
        type: 'producer',
        position: { x: 0, y: 0 },
        data: { label: 'Producer 1', status: 'active', connectionName: 'conn1', publishRate: 10 }
      },
      {
        id: 'exchange-1',
        type: 'exchange',
        position: { x: 200, y: 0 },
        data: { 
          label: 'Exchange 1', 
          status: 'active', 
          exchangeType: 'direct', 
          durable: true, 
          autoDelete: false, 
          arguments: {} 
        }
      }
    ]

    const edges: TopologyEdge[] = [
      {
        id: 'edge-1',
        source: 'producer-1',
        target: 'exchange-1',
        type: 'binding',
        data: { routingKey: 'test.key' }
      }
    ]

    render(<TopologyCanvas {...mockProps} nodes={nodes} edges={edges} />)
    
    expect(screen.getByTestId('nodes-count')).toHaveTextContent('2')
    expect(screen.getByTestId('edges-count')).toHaveTextContent('1')
  })

  it('handles node selection', () => {
    render(<TopologyCanvas {...mockProps} />)
    
    fireEvent.click(screen.getByTestId('node-click'))
    
    expect(mockProps.onNodeSelect).toHaveBeenCalledWith('test-node')
  })

  it('handles pane click for deselection', () => {
    render(<TopologyCanvas {...mockProps} />)
    
    fireEvent.click(screen.getByTestId('pane-click'))
    
    expect(mockProps.onNodeSelect).toHaveBeenCalledWith(null)
  })

  it('displays selection info when node is selected', () => {
    render(<TopologyCanvas {...mockProps} selectedNodeId="test-node-123" />)
    
    expect(screen.getByText('Selected Node')).toBeInTheDocument()
    expect(screen.getByText('ID: test-node-123')).toBeInTheDocument()
  })

  it('displays legend with all node types', () => {
    render(<TopologyCanvas {...mockProps} />)
    
    expect(screen.getByText('Legend')).toBeInTheDocument()
    expect(screen.getByText('Producer')).toBeInTheDocument()
    expect(screen.getByText('Exchange')).toBeInTheDocument()
    expect(screen.getByText('Queue')).toBeInTheDocument()
    expect(screen.getByText('Consumer')).toBeInTheDocument()
  })

  it('does not display empty state when nodes exist', () => {
    const nodes: TopologyNode[] = [
      {
        id: 'producer-1',
        type: 'producer',
        position: { x: 0, y: 0 },
        data: { label: 'Producer 1', status: 'active', connectionName: 'conn1', publishRate: 10 }
      }
    ]

    render(<TopologyCanvas {...mockProps} nodes={nodes} />)
    
    expect(screen.queryByText('No topology components')).not.toBeInTheDocument()
  })
})