// WebSocket client for real-time updates
import { io, Socket } from 'socket.io-client'
import type { 
  ClientToServerEvents, 
  ServerToClientEvents,
  ConnectionStatus,
  PublishMessageRequest 
} from '@/types/api'

export class WebSocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  constructor(private url: string = '/') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      })

      this.socket.on('connect', () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.emit('connection-status', { 
          connected: true, 
          rabbitmq_connected: true 
        })
        resolve()
      })

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        this.emit('connection-status', { 
          connected: false, 
          rabbitmq_connected: false,
          error: reason 
        })
        this.handleDisconnect()
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        this.emit('connection-error', error)
        reject(error)
      })

      // Forward all server events to local listeners
      this.socket.onAny((eventName, ...args) => {
        this.emit(eventName, ...args)
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
      setTimeout(() => {
        this.reconnectAttempts++
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect().catch(console.error)
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
      this.emit('connection-error', new Error('Max reconnection attempts reached'))
    }
  }

  // Event subscription methods
  on<K extends keyof ServerToClientEvents>(
    event: K, 
    callback: ServerToClientEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    // Type assertion to handle the complex union type
    this.listeners.get(event)!.push(callback as (...args: unknown[]) => void)
  }

  off<K extends keyof ServerToClientEvents>(
    event: K, 
    callback: ServerToClientEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback as (...args: unknown[]) => void)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Client-to-server event methods
  subscribeToTopology(): void {
    this.socket?.emit('subscribe-topology')
  }

  unsubscribeFromTopology(): void {
    this.socket?.emit('unsubscribe-topology')
  }

  subscribeToMessages(queueNames: string[]): void {
    this.socket?.emit('subscribe-messages', queueNames)
  }

  unsubscribeFromMessages(queueNames: string[]): void {
    this.socket?.emit('unsubscribe-messages', queueNames)
  }

  subscribeToMetrics(): void {
    this.socket?.emit('subscribe-metrics')
  }

  unsubscribeFromMetrics(): void {
    this.socket?.emit('unsubscribe-metrics')
  }

  publishMessage(message: PublishMessageRequest): void {
    this.socket?.emit('publish-message', message)
  }

  get connected(): boolean {
    return this.socket?.connected ?? false
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager()
  }
  return wsManager
}

export default WebSocketManager