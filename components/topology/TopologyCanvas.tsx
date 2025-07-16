import React, { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  EdgeTypes,
  Panel,
  ReactFlowProvider
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { TopologyCanvasProps, TopologyNode, TopologyEdge } from '@/types/topology'
import ProducerNode from './nodes/ProducerNode'
import ExchangeNode from './nodes/ExchangeNode'
import QueueNode from './nodes/QueueNode'
import ConsumerNode from './nodes/ConsumerNode'
import BindingEdge from './edges/BindingEdge'

// Define custom node types
const nodeTypes: NodeTypes = {
  producer: ProducerNode,
  exchange: ExchangeNode,
  queue: QueueNode,
  consumer: ConsumerNode,
}

// Define custom edge types
const edgeTypes: EdgeTypes = {
  binding: BindingEdge,
}

// Default edge options
const defaultEdgeOptions = {
  type: 'binding',
  animated: false,
  style: { strokeWidth: 1.5 },
}

function TopologyCanvasInner({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeAdd,
  onNodeDelete,
  onNodeUpdate,
  onEdgeAdd,
  onEdgeDelete,
  onNodeSelect,
  selectedNodeId
}: TopologyCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when props change
  React.useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  // Update edges when props change
  React.useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      if (params.source && params.target) {
        onEdgeAdd(params.source, params.target)
        setEdges((eds) => addEdge({ ...params, type: 'binding' }, eds))
      }
    },
    [onEdgeAdd, setEdges]
  )

  // Handle node selection
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: TopologyNode) => {
      onNodeSelect(node.id)
    },
    [onNodeSelect]
  )

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    onNodeSelect(null)
  }, [onNodeSelect])

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deletedNodes: TopologyNode[]) => {
      deletedNodes.forEach((node) => {
        onNodeDelete(node.id)
      })
    },
    [onNodeDelete]
  )

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deletedEdges: TopologyEdge[]) => {
      deletedEdges.forEach((edge) => {
        onEdgeDelete(edge.id)
      })
    },
    [onEdgeDelete]
  )

  // Handle drag end to update node positions
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: TopologyNode) => {
      onNodeUpdate(node.id, { position: node.position })
    },
    [onNodeUpdate]
  )

  // Minimap node color function
  const getNodeColor = useCallback((node: TopologyNode) => {
    switch (node.type) {
      case 'producer':
        return '#10b981' // green-500
      case 'exchange':
        return '#3b82f6' // blue-500
      case 'queue':
        return '#8b5cf6' // purple-500
      case 'consumer':
        return '#f59e0b' // amber-500
      default:
        return '#6b7280' // gray-500
    }
  }, [])

  // Memoize the flow props for performance
  const flowProps = useMemo(() => ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
    onEdgesDelete,
    onNodeDragStop,
    nodeTypes,
    edgeTypes,
    defaultEdgeOptions,
    fitView: true,
    attributionPosition: 'bottom-left' as const,
    proOptions: { hideAttribution: true },
  }), [
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
    onEdgesDelete,
    onNodeDragStop
  ])

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow {...flowProps}>
        <Background color="#e5e7eb" gap={20} />
        <Controls 
          className="bg-white border border-gray-300 rounded-lg shadow-sm"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={getNodeColor}
          className="bg-white border border-gray-300 rounded-lg"
          pannable
          zoomable
        />
        
        {/* Empty state panel */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
            <div className="text-center text-gray-600">
              <div className="text-lg font-medium mb-2">No topology components</div>
              <div className="text-sm">
                Add producers, exchanges, queues, and consumers to visualize your RabbitMQ topology
              </div>
            </div>
          </Panel>
        )}

        {/* Selection info panel */}
        {selectedNodeId && (
          <Panel position="top-left" className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
            <div className="text-sm">
              <div className="font-medium text-gray-800 mb-1">Selected Node</div>
              <div className="text-gray-600">ID: {selectedNodeId}</div>
            </div>
          </Panel>
        )}

        {/* Legend panel */}
        <Panel position="bottom-right" className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
          <div className="text-xs space-y-2">
            <div className="font-medium text-gray-800 mb-2">Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Producer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Exchange</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Queue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span className="text-gray-600">Consumer</span>
            </div>
          </div>
        </Panel>

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
          </marker>
        </defs>
      </ReactFlow>
    </div>
  )
}

// Wrap with ReactFlowProvider
export default function TopologyCanvas(props: TopologyCanvasProps) {
  return (
    <ReactFlowProvider>
      <TopologyCanvasInner {...props} />
    </ReactFlowProvider>
  )
}