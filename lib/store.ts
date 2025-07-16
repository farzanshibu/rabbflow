// Global state management with Zustand
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  TopologyData, 
  RabbitMQMetrics,
  Exchange,
  Queue,
  Binding 
} from '@/types/rabbitmq'
import type { 
  TopologyNode, 
  TopologyEdge, 
  ActiveMessage 
} from '@/types/topology'
import type { 
  Alert, 
  ConnectionStatus,
  VirtualConsumer 
} from '@/types/api'

// Topology store
interface TopologyStore {
  // State
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  selectedNodeId: string | null
  activeMessages: ActiveMessage[]
  
  // Actions
  setNodes: (nodes: TopologyNode[]) => void
  setEdges: (edges: TopologyEdge[]) => void
  addNode: (node: TopologyNode) => void
  updateNode: (nodeId: string, updates: Partial<TopologyNode>) => void
  removeNode: (nodeId: string) => void
  addEdge: (edge: TopologyEdge) => void
  removeEdge: (edgeId: string) => void
  setSelectedNode: (nodeId: string | null) => void
  addActiveMessage: (message: ActiveMessage) => void
  updateActiveMessage: (messageId: string, updates: Partial<ActiveMessage>) => void
  removeActiveMessage: (messageId: string) => void
  clearActiveMessages: () => void
}

export const useTopologyStore = create<TopologyStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodeId: null,
      activeMessages: [],

      // Actions
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      
      addNode: (node) => set((state) => ({
        nodes: [...state.nodes, node]
      })),
      
      updateNode: (nodeId, updates) => set((state) => ({
        nodes: state.nodes.map(node => 
          node.id === nodeId ? { ...node, ...updates } : node
        )
      })),
      
      removeNode: (nodeId) => set((state) => ({
        nodes: state.nodes.filter(node => node.id !== nodeId),
        edges: state.edges.filter(edge => 
          edge.source !== nodeId && edge.target !== nodeId
        ),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
      })),
      
      addEdge: (edge) => set((state) => ({
        edges: [...state.edges, edge]
      })),
      
      removeEdge: (edgeId) => set((state) => ({
        edges: state.edges.filter(edge => edge.id !== edgeId)
      })),
      
      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
      
      addActiveMessage: (message) => set((state) => ({
        activeMessages: [...state.activeMessages, message]
      })),
      
      updateActiveMessage: (messageId, updates) => set((state) => ({
        activeMessages: state.activeMessages.map(msg =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      })),
      
      removeActiveMessage: (messageId) => set((state) => ({
        activeMessages: state.activeMessages.filter(msg => msg.id !== messageId)
      })),
      
      clearActiveMessages: () => set({ activeMessages: [] }),
    }),
    { name: 'topology-store' }
  )
)

// RabbitMQ data store
interface RabbitMQStore {
  // State
  topology: TopologyData | null
  metrics: RabbitMQMetrics | null
  connectionStatus: ConnectionStatus
  loading: boolean
  error: string | null
  
  // Actions
  setTopology: (topology: TopologyData) => void
  setMetrics: (metrics: RabbitMQMetrics) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateExchange: (exchange: Exchange) => void
  updateQueue: (queue: Queue) => void
  addBinding: (binding: Binding) => void
  removeBinding: (source: string, destination: string, routingKey: string) => void
}

export const useRabbitMQStore = create<RabbitMQStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      topology: null,
      metrics: null,
      connectionStatus: { connected: false, rabbitmq_connected: false },
      loading: false,
      error: null,

      // Actions
      setTopology: (topology) => set({ topology }),
      setMetrics: (metrics) => set({ metrics }),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      updateExchange: (exchange) => set((state) => {
        if (!state.topology) return state
        return {
          topology: {
            ...state.topology,
            exchanges: state.topology.exchanges.map(ex =>
              ex.name === exchange.name ? exchange : ex
            )
          }
        }
      }),
      
      updateQueue: (queue) => set((state) => {
        if (!state.topology) return state
        return {
          topology: {
            ...state.topology,
            queues: state.topology.queues.map(q =>
              q.name === queue.name ? queue : q
            )
          }
        }
      }),
      
      addBinding: (binding) => set((state) => {
        if (!state.topology) return state
        return {
          topology: {
            ...state.topology,
            bindings: [...state.topology.bindings, binding]
          }
        }
      }),
      
      removeBinding: (source, destination, routingKey) => set((state) => {
        if (!state.topology) return state
        return {
          topology: {
            ...state.topology,
            bindings: state.topology.bindings.filter(binding =>
              !(binding.source === source && 
                binding.destination === destination && 
                binding.routing_key === routingKey)
            )
          }
        }
      }),
    }),
    { name: 'rabbitmq-store' }
  )
)

// Monitoring store
interface MonitoringStore {
  // State
  alerts: Alert[]
  consumers: VirtualConsumer[]
  
  // Actions
  addAlert: (alert: Alert) => void
  removeAlert: (alertId: string) => void
  acknowledgeAlert: (alertId: string) => void
  clearAlerts: () => void
  addConsumer: (consumer: VirtualConsumer) => void
  updateConsumer: (consumerId: string, updates: Partial<VirtualConsumer>) => void
  removeConsumer: (consumerId: string) => void
}

export const useMonitoringStore = create<MonitoringStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      alerts: [],
      consumers: [],

      // Actions
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, alert]
      })),
      
      removeAlert: (alertId) => set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      })),
      
      acknowledgeAlert: (alertId) => set((state) => ({
        alerts: state.alerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      })),
      
      clearAlerts: () => set({ alerts: [] }),
      
      addConsumer: (consumer) => set((state) => ({
        consumers: [...state.consumers, consumer]
      })),
      
      updateConsumer: (consumerId, updates) => set((state) => ({
        consumers: state.consumers.map(consumer =>
          consumer.id === consumerId ? { ...consumer, ...updates } : consumer
        )
      })),
      
      removeConsumer: (consumerId) => set((state) => ({
        consumers: state.consumers.filter(consumer => consumer.id !== consumerId)
      })),
    }),
    { name: 'monitoring-store' }
  )
)