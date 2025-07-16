// React Flow topology visualization types

import { Node, Edge, Position } from '@xyflow/react'

export type NodeType = 'producer' | 'exchange' | 'queue' | 'consumer'

export interface TopologyNode extends Node {
  type: NodeType
  data: NodeData
}

export interface TopologyEdge extends Edge {
  data?: EdgeData
}

export interface NodeData extends Record<string, unknown> {
  label: string
  status: 'active' | 'idle' | 'error'
  metrics?: NodeMetrics
}

export interface ExchangeNodeData extends NodeData {
  exchangeType: 'direct' | 'fanout' | 'topic' | 'headers'
  durable: boolean
  autoDelete: boolean
  arguments: Record<string, any>
}

export interface QueueNodeData extends NodeData {
  durable: boolean
  exclusive: boolean
  autoDelete: boolean
  ttl?: number
  maxLength?: number
  deadLetterExchange?: string
  messageCount: number
  consumerCount: number
}

export interface ProducerNodeData extends NodeData {
  connectionName: string
  publishRate: number
}

export interface ConsumerNodeData extends NodeData {
  connectionName: string
  consumeRate: number
  prefetchCount: number
  ackMode: 'auto' | 'manual'
}

export interface EdgeData extends Record<string, unknown> {
  routingKey?: string
  messageCount?: number
  messageRate?: number
}

export interface NodeMetrics {
  messageCount?: number
  messageRate?: number
  errorCount?: number
  lastActivity?: Date
}

export interface ActiveMessage {
  id: string
  sourceNodeId: string
  targetNodeId: string
  status: 'published' | 'routed' | 'consumed' | 'acknowledged' | 'dead-lettered'
  payload: any
  routingKey: string
  timestamp: number
  properties?: Record<string, any>
}

export interface TopologyCanvasProps {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  onNodeAdd: (type: NodeType, position: Position) => void
  onNodeDelete: (nodeId: string) => void
  onNodeUpdate: (nodeId: string, data: Partial<NodeData>) => void
  onEdgeAdd: (source: string, target: string, data?: EdgeData) => void
  onEdgeDelete: (edgeId: string) => void
  onNodeSelect: (nodeId: string | null) => void
  selectedNodeId?: string | null
}

export interface MessageFlowProps {
  messages: ActiveMessage[]
  edges: TopologyEdge[]
  onMessageComplete: (messageId: string) => void
}