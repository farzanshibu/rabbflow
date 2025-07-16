import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Download, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { ConsumerNodeData } from '@/types/topology'

export default function ConsumerNode({ data, selected }: NodeProps<ConsumerNodeData>) {
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
        return <Download className="w-4 h-4 text-gray-600" />
    }
  }

  const getAckModeIcon = () => {
    return data.ackMode === 'auto' ? 
      <CheckCircle className="w-3 h-3 text-green-500" /> :
      <Clock className="w-3 h-3 text-orange-500" />
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
        <div className="font-medium text-sm text-gray-800">Consumer</div>
      </div>
      
      <div className="text-xs text-gray-600 mb-2 font-medium">
        {data.label}
      </div>
      
      {data.connectionName && (
        <div className="text-xs text-gray-500 mb-1">
          Connection: {data.connectionName}
        </div>
      )}
      
      <div className="space-y-1">
        {data.consumeRate !== undefined && (
          <div className="text-xs text-gray-500">
            Rate: {data.consumeRate.toFixed(1)}/s
          </div>
        )}
        
        {data.prefetchCount > 0 && (
          <div className="text-xs text-gray-500">
            Prefetch: {data.prefetchCount}
          </div>
        )}
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {getAckModeIcon()}
          <span>{data.ackMode} ack</span>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  )
}