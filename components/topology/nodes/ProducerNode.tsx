import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Send, Activity, AlertCircle } from 'lucide-react'
import { ProducerNodeData } from '@/types/topology'

export default function ProducerNode({ data, selected }: NodeProps<ProducerNodeData>) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'active':
        return 'border-green-500 bg-green-50'
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
        return <Activity className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Send className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div
      className={`
        px-4 py-3 shadow-md rounded-lg border-2 min-w-[120px]
        ${getStatusColor()}
        ${selected ? 'ring-2 ring-blue-500' : ''}
        transition-all duration-200 hover:shadow-lg
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon()}
        <div className="font-medium text-sm text-gray-800">Producer</div>
      </div>
      
      <div className="text-xs text-gray-600 mb-2 font-medium">
        {data.label}
      </div>
      
      {data.connectionName && (
        <div className="text-xs text-gray-500 mb-1">
          Connection: {data.connectionName}
        </div>
      )}
      
      {data.publishRate !== undefined && (
        <div className="text-xs text-gray-500">
          Rate: {data.publishRate.toFixed(1)}/s
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  )
}