import {
  generateId,
  createNode,
  createEdge,
  autoLayoutNodes,
  findNodesByType,
  findNodeById,
  findConnectedEdges,
  isValidConnection,
  getTopologyStats,
  exportTopology,
  importTopology,
} from '../utils/topologyUtils'
import { TopologyNode, TopologyEdge } from '@/types/topology'

describe('topologyUtils', () => {
  describe('generateId', () => {
    it('generates unique IDs with prefix', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')
      
      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('uses default prefix when none provided', () => {
      const id = generateId()
      expect(id).toMatch(/^node_\d+_[a-z0-9]+$/)
    })
  })

  describe('createNode', () => {
    it('creates producer node with correct data', () => {
      const node = createNode('producer', { x: 100, y: 200 }, 'Test Producer')
      
      expect(node.type).toBe('producer')
      expect(node.position).toEqual({ x: 100, y: 200 })
      expect(node.data.label).toBe('Test Producer')
      expect(node.data.status).toBe('idle')
      expect(node.data).toHaveProperty('connectionName')
      expect(node.data).toHaveProperty('publishRate')
      expect(node.draggable).toBe(true)
      expect(node.selectable).toBe(true)
    })

    it('creates exchange node with correct data', () => {
      const node = createNode('exchange', { x: 100, y: 200 }, 'Test Exchange')
      
      expect(node.type).toBe('exchange')
      expect(node.data).toHaveProperty('exchangeType', 'direct')
      expect(node.data).toHaveProperty('durable', true)
      expect(node.data).toHaveProperty('autoDelete', false)
      expect(node.data).toHaveProperty('arguments', {})
    })

    it('creates queue node with correct data', () => {
      const node = createNode('queue', { x: 100, y: 200 }, 'Test Queue')
      
      expect(node.type).toBe('queue')
      expect(node.data).toHaveProperty('durable', true)
      expect(node.data).toHaveProperty('exclusive', false)
      expect(node.data).toHaveProperty('autoDelete', false)
      expect(node.data).toHaveProperty('messageCount', 0)
      expect(node.data).toHaveProperty('consumerCount', 0)
    })

    it('creates consumer node with correct data', () => {
      const node = createNode('consumer', { x: 100, y: 200 }, 'Test Consumer')
      
      expect(node.type).toBe('consumer')
      expect(node.data).toHaveProperty('connectionName')
      expect(node.data).toHaveProperty('consumeRate', 0)
      expect(node.data).toHaveProperty('prefetchCount', 1)
      expect(node.data).toHaveProperty('ackMode', 'auto')
    })

    it('merges additional data', () => {
      const node = createNode('producer', { x: 0, y: 0 }, 'Test', { 
        status: 'active',
        publishRate: 100 
      })
      
      expect(node.data.status).toBe('active')
      expect(node.data.publishRate).toBe(100)
    })

    it('throws error for unknown node type', () => {
      expect(() => {
        // @ts-ignore
        createNode('unknown', { x: 0, y: 0 }, 'Test')
      }).toThrow('Unknown node type: unknown')
    })
  })

  describe('createEdge', () => {
    it('creates edge with correct properties', () => {
      const edge = createEdge('source-1', 'target-1', { routingKey: 'test.key' })
      
      expect(edge.source).toBe('source-1')
      expect(edge.target).toBe('target-1')
      expect(edge.type).toBe('binding')
      expect(edge.data?.routingKey).toBe('test.key')
      expect(edge.animated).toBe(false)
      expect(edge.id).toMatch(/^edge_\d+_[a-z0-9]+$/)
    })

    it('creates edge without data', () => {
      const edge = createEdge('source-1', 'target-1')
      
      expect(edge.data).toEqual({})
    })
  })

  describe('autoLayoutNodes', () => {
    it('layouts nodes in correct order', () => {
      const nodes: TopologyNode[] = [
        createNode('consumer', { x: 0, y: 0 }, 'Consumer 1'),
        createNode('producer', { x: 0, y: 0 }, 'Producer 1'),
        createNode('queue', { x: 0, y: 0 }, 'Queue 1'),
        createNode('exchange', { x: 0, y: 0 }, 'Exchange 1'),
      ]

      const layouted = autoLayoutNodes(nodes)
      
      // Should be ordered: producer, exchange, queue, consumer
      expect(layouted[0].type).toBe('producer')
      expect(layouted[1].type).toBe('exchange')
      expect(layouted[2].type).toBe('queue')
      expect(layouted[3].type).toBe('consumer')
      
      // X positions should increase left to right
      expect(layouted[0].position.x).toBeLessThan(layouted[1].position.x)
      expect(layouted[1].position.x).toBeLessThan(layouted[2].position.x)
      expect(layouted[2].position.x).toBeLessThan(layouted[3].position.x)
    })

    it('handles multiple nodes of same type', () => {
      const nodes: TopologyNode[] = [
        createNode('producer', { x: 0, y: 0 }, 'Producer 1'),
        createNode('producer', { x: 0, y: 0 }, 'Producer 2'),
      ]

      const layouted = autoLayoutNodes(nodes)
      
      expect(layouted).toHaveLength(2)
      expect(layouted[0].position.x).toBe(layouted[1].position.x) // Same X
      expect(layouted[0].position.y).not.toBe(layouted[1].position.y) // Different Y
    })

    it('handles empty node array', () => {
      const layouted = autoLayoutNodes([])
      expect(layouted).toEqual([])
    })
  })

  describe('findNodesByType', () => {
    const nodes: TopologyNode[] = [
      createNode('producer', { x: 0, y: 0 }, 'Producer 1'),
      createNode('producer', { x: 0, y: 0 }, 'Producer 2'),
      createNode('exchange', { x: 0, y: 0 }, 'Exchange 1'),
    ]

    it('finds nodes by type', () => {
      const producers = findNodesByType(nodes, 'producer')
      expect(producers).toHaveLength(2)
      expect(producers.every(n => n.type === 'producer')).toBe(true)
    })

    it('returns empty array for non-existent type', () => {
      const consumers = findNodesByType(nodes, 'consumer')
      expect(consumers).toHaveLength(0)
    })
  })

  describe('findNodeById', () => {
    const nodes: TopologyNode[] = [
      { ...createNode('producer', { x: 0, y: 0 }, 'Producer 1'), id: 'prod-1' },
      { ...createNode('exchange', { x: 0, y: 0 }, 'Exchange 1'), id: 'exch-1' },
    ]

    it('finds node by ID', () => {
      const node = findNodeById(nodes, 'prod-1')
      expect(node?.id).toBe('prod-1')
      expect(node?.type).toBe('producer')
    })

    it('returns undefined for non-existent ID', () => {
      const node = findNodeById(nodes, 'non-existent')
      expect(node).toBeUndefined()
    })
  })

  describe('findConnectedEdges', () => {
    const edges: TopologyEdge[] = [
      createEdge('node-1', 'node-2'),
      createEdge('node-2', 'node-3'),
      createEdge('node-3', 'node-4'),
    ]

    it('finds edges connected to node as source or target', () => {
      const connected = findConnectedEdges(edges, 'node-2')
      expect(connected).toHaveLength(2)
      expect(connected.some(e => e.source === 'node-2')).toBe(true)
      expect(connected.some(e => e.target === 'node-2')).toBe(true)
    })

    it('returns empty array for unconnected node', () => {
      const connected = findConnectedEdges(edges, 'node-5')
      expect(connected).toHaveLength(0)
    })
  })

  describe('isValidConnection', () => {
    const producer = createNode('producer', { x: 0, y: 0 }, 'Producer')
    const exchange = createNode('exchange', { x: 0, y: 0 }, 'Exchange')
    const queue = createNode('queue', { x: 0, y: 0 }, 'Queue')
    const consumer = createNode('consumer', { x: 0, y: 0 }, 'Consumer')

    it('allows producer to exchange connection', () => {
      expect(isValidConnection(producer, exchange)).toBe(true)
    })

    it('allows exchange to queue connection', () => {
      expect(isValidConnection(exchange, queue)).toBe(true)
    })

    it('allows exchange to exchange connection', () => {
      expect(isValidConnection(exchange, exchange)).toBe(true)
    })

    it('allows queue to consumer connection', () => {
      expect(isValidConnection(queue, consumer)).toBe(true)
    })

    it('disallows producer to queue connection', () => {
      expect(isValidConnection(producer, queue)).toBe(false)
    })

    it('disallows producer to consumer connection', () => {
      expect(isValidConnection(producer, consumer)).toBe(false)
    })

    it('disallows consumer as source', () => {
      expect(isValidConnection(consumer, queue)).toBe(false)
    })

    it('disallows exchange to consumer connection', () => {
      expect(isValidConnection(exchange, consumer)).toBe(false)
    })
  })

  describe('getTopologyStats', () => {
    const nodes: TopologyNode[] = [
      { ...createNode('producer', { x: 0, y: 0 }, 'Producer'), data: { ...createNode('producer', { x: 0, y: 0 }, 'Producer').data, status: 'active' } },
      { ...createNode('exchange', { x: 0, y: 0 }, 'Exchange'), data: { ...createNode('exchange', { x: 0, y: 0 }, 'Exchange').data, status: 'idle' } },
      { ...createNode('queue', { x: 0, y: 0 }, 'Queue'), data: { ...createNode('queue', { x: 0, y: 0 }, 'Queue').data, messageCount: 100, status: 'active' } },
      { ...createNode('consumer', { x: 0, y: 0 }, 'Consumer'), data: { ...createNode('consumer', { x: 0, y: 0 }, 'Consumer').data, status: 'active' } },
    ]

    const edges: TopologyEdge[] = [
      createEdge('prod-1', 'exch-1'),
      createEdge('exch-1', 'queue-1'),
    ]

    it('calculates correct statistics', () => {
      const stats = getTopologyStats(nodes, edges)
      
      expect(stats.producers).toBe(1)
      expect(stats.exchanges).toBe(1)
      expect(stats.queues).toBe(1)
      expect(stats.consumers).toBe(1)
      expect(stats.bindings).toBe(2)
      expect(stats.totalMessages).toBe(100)
      expect(stats.activeNodes).toBe(3)
    })
  })

  describe('exportTopology', () => {
    it('exports topology with correct structure', () => {
      const nodes: TopologyNode[] = [createNode('producer', { x: 0, y: 0 }, 'Producer')]
      const edges: TopologyEdge[] = []

      const exported = exportTopology(nodes, edges)
      
      expect(exported.version).toBe('1.0')
      expect(exported.timestamp).toBeDefined()
      expect(exported.nodes).toHaveLength(1)
      expect(exported.edges).toHaveLength(0)
      expect(exported.stats).toBeDefined()
      expect(exported.nodes[0]).toHaveProperty('id')
      expect(exported.nodes[0]).toHaveProperty('type')
      expect(exported.nodes[0]).toHaveProperty('position')
      expect(exported.nodes[0]).toHaveProperty('data')
    })
  })

  describe('importTopology', () => {
    it('imports topology correctly', () => {
      const topologyData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        nodes: [
          {
            id: 'prod-1',
            type: 'producer',
            position: { x: 0, y: 0 },
            data: { label: 'Producer', status: 'active' }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'prod-1',
            target: 'exch-1',
            data: { routingKey: 'test' }
          }
        ]
      }

      const { nodes, edges } = importTopology(topologyData)
      
      expect(nodes).toHaveLength(1)
      expect(edges).toHaveLength(1)
      expect(nodes[0].draggable).toBe(true)
      expect(nodes[0].selectable).toBe(true)
      expect(edges[0].type).toBe('binding')
      expect(edges[0].animated).toBe(false)
    })
  })
})