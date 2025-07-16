import { Position } from '@xyflow/react'
import { 
  TopologyNode, 
  TopologyEdge, 
  NodeType, 
  ProducerNodeData, 
  ExchangeNodeData, 
  QueueNodeData, 
  ConsumerNodeData,
  EdgeData
} from '@/types/topology'

// Auto-layout constants
const NODE_SPACING = 200
const LAYER_SPACING = 300

// Generate unique ID for nodes and edges
export function generateId(prefix: string = 'node'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create a new node with default properties
export function createNode(
  type: NodeType,
  position: Position,
  label: string,
  additionalData: Partial<any> = {}
): TopologyNode {
  let nodeData
  switch (type) {
    case 'producer':
      nodeData = {
        label,
        status: 'idle' as const,
        connectionName: '',
        publishRate: 0,
        ...additionalData,
      } as ProducerNodeData
      break
    case 'exchange':
      nodeData = {
        label,
        status: 'idle' as const,
        exchangeType: 'direct' as const,
        durable: true,
        autoDelete: false,
        arguments: {},
        ...additionalData,
      } as ExchangeNodeData
      break
    case 'queue':
      nodeData = {
        label,
        status: 'idle' as const,
        durable: true,
        exclusive: false,
        autoDelete: false,
        messageCount: 0,
        consumerCount: 0,
        ...additionalData,
      } as QueueNodeData
      break
    case 'consumer':
      nodeData = {
        label,
        status: 'idle' as const,
        connectionName: '',
        consumeRate: 0,
        prefetchCount: 1,
        ackMode: 'auto' as const,
        ...additionalData,
      } as ConsumerNodeData
      break
    default:
      throw new Error(`Unknown node type: ${type}`)
  }

  return {
    id: generateId(type),
    type,
    position,
    data: nodeData,
    draggable: true,
    selectable: true,
  }
}

// Create a new edge between two nodes
export function createEdge(
  sourceId: string,
  targetId: string,
  data: EdgeData = {}
): TopologyEdge {
  return {
    id: generateId('edge'),
    source: sourceId,
    target: targetId,
    type: 'binding',
    data,
    animated: false,
  }
}

// Auto-layout nodes in a left-to-right flow
export function autoLayoutNodes(nodes: TopologyNode[]): TopologyNode[] {
  const nodesByType = {
    producer: nodes.filter(n => n.type === 'producer'),
    exchange: nodes.filter(n => n.type === 'exchange'),
    queue: nodes.filter(n => n.type === 'queue'),
    consumer: nodes.filter(n => n.type === 'consumer'),
  }

  const layoutNodes: TopologyNode[] = []
  let currentX = 100

  // Layout producers
  if (nodesByType.producer.length > 0) {
    nodesByType.producer.forEach((node, index) => {
      layoutNodes.push({
        ...node,
        position: {
          x: currentX,
          y: 100 + (index * NODE_SPACING)
        }
      })
    })
    currentX += LAYER_SPACING
  }

  // Layout exchanges
  if (nodesByType.exchange.length > 0) {
    nodesByType.exchange.forEach((node, index) => {
      layoutNodes.push({
        ...node,
        position: {
          x: currentX,
          y: 100 + (index * NODE_SPACING)
        }
      })
    })
    currentX += LAYER_SPACING
  }

  // Layout queues
  if (nodesByType.queue.length > 0) {
    nodesByType.queue.forEach((node, index) => {
      layoutNodes.push({
        ...node,
        position: {
          x: currentX,
          y: 100 + (index * NODE_SPACING)
        }
      })
    })
    currentX += LAYER_SPACING
  }

  // Layout consumers
  if (nodesByType.consumer.length > 0) {
    nodesByType.consumer.forEach((node, index) => {
      layoutNodes.push({
        ...node,
        position: {
          x: currentX,
          y: 100 + (index * NODE_SPACING)
        }
      })
    })
  }

  return layoutNodes
}

// Find nodes by type
export function findNodesByType(nodes: TopologyNode[], type: NodeType): TopologyNode[] {
  return nodes.filter(node => node.type === type)
}

// Find node by ID
export function findNodeById(nodes: TopologyNode[], id: string): TopologyNode | undefined {
  return nodes.find(node => node.id === id)
}

// Find edges connected to a node
export function findConnectedEdges(edges: TopologyEdge[], nodeId: string): TopologyEdge[] {
  return edges.filter(edge => edge.source === nodeId || edge.target === nodeId)
}

// Validate edge connection (business logic)
export function isValidConnection(
  sourceNode: TopologyNode,
  targetNode: TopologyNode
): boolean {
  // Producer can only connect to exchanges
  if (sourceNode.type === 'producer' && targetNode.type !== 'exchange') {
    return false
  }

  // Exchange can connect to queues or other exchanges
  if (sourceNode.type === 'exchange' && 
      !['queue', 'exchange'].includes(targetNode.type)) {
    return false
  }

  // Queue can only connect to consumers
  if (sourceNode.type === 'queue' && targetNode.type !== 'consumer') {
    return false
  }

  // Consumer cannot be a source
  if (sourceNode.type === 'consumer') {
    return false
  }

  return true
}

// Get node statistics summary
export function getTopologyStats(nodes: TopologyNode[], edges: TopologyEdge[]) {
  const stats = {
    producers: findNodesByType(nodes, 'producer').length,
    exchanges: findNodesByType(nodes, 'exchange').length,
    queues: findNodesByType(nodes, 'queue').length,
    consumers: findNodesByType(nodes, 'consumer').length,
    bindings: edges.length,
    totalMessages: 0,
    activeNodes: 0,
  }

  // Calculate total messages and active nodes
  nodes.forEach(node => {
    if (node.data.status === 'active') {
      stats.activeNodes++
    }
    
    if (node.type === 'queue' && 'messageCount' in node.data) {
      stats.totalMessages += (node.data as QueueNodeData).messageCount
    }
  })

  return stats
}

// Export topology to JSON
export function exportTopology(nodes: TopologyNode[], edges: TopologyEdge[]) {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: edge.data,
    })),
    stats: getTopologyStats(nodes, edges),
  }
}

// Import topology from JSON
export function importTopology(topologyData: any): { nodes: TopologyNode[], edges: TopologyEdge[] } {
  const nodes: TopologyNode[] = topologyData.nodes.map((nodeData: any) => ({
    ...nodeData,
    draggable: true,
    selectable: true,
  }))

  const edges: TopologyEdge[] = topologyData.edges.map((edgeData: any) => ({
    ...edgeData,
    type: 'binding',
    animated: false,
  }))

  return { nodes, edges }
}