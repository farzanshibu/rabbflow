import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Inbox, Users, AlertCircle, Activity } from 'lucide-react'
import { QueueNodeData } from '@/types/topology'

export default function QueueNode({ data, selected }: NodeProps<QueueNodeData>) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'active':
        return 'border-purple-500 bg-purple-50'
      case 'idle':
        return 'border-gray-400 bg-gray-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-400 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch (data.status) {
      case 'active':
        return <Activity className="w-3 h-3 text-purple-600" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-600" />
      default:
        return null
    }
  }

  const getMessageCountColor = () => {
    if (data.messageCount > 1000) return 'text-red-600 font-bold'
    if (data.messageCount > 100) return 'text-orange-600 font-medium'
    return 'text-gray-600'
  }

  return (
    <div
      className={`
        px-4 py-3 shadow-md rounded-lg border-2 min-w-[140px]
        ${getStatusColor()}
        ${selected ? 'ring-2 ring-blue-500' : ''}
        transition-all duration-200 hover:shadow-lg
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <Inbox className={`w-4 h-4 ${data.status === 'active' ? 'text-purple-600' : 
                          data.status === 'error' ? 'text-red-600' : 'text-gray-600'}`} />
        <div className="font-medium text-sm text-gray-800">Queue</div>
        {getStatusIcon()}
      </div>
      
      <div className="text-xs text-gray-600 mb-2 font-medium">
        {data.label}
      </div>
      
      <div className="space-y-1">
        <div className={`text-xs ${getMessageCountColor()}`}>
          Messages: {data.messageCount.toLocaleString()}
        </div>
        
        {data.consumerCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            {data.consumerCount} consumer{data.consumerCount !== 1 ? 's' : ''}
          </div>
        )}
        
        <div className="flex gap-1 text-xs text-gray-500">
          {data.durable && <span className="bg-gray-200 px-1 rounded">D</span>}
          {data.exclusive && <span className="bg-gray-200 px-1 rounded">E</span>}
          {data.autoDelete && <span className="bg-gray-200 px-1 rounded">AD</span>}
        </div>
        
        {data.ttl && (
          <div className="text-xs text-gray-500">
            TTL: {data.ttl}ms
          </div>
        )}
        
        {data.maxLength && (
          <div className="text-xs text-gray-500">
            Max: {data.maxLength.toLocaleString()}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  )
}