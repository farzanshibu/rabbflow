import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { ArrowRightLeft, Shuffle, Filter, Hash, AlertCircle, Activity } from 'lucide-react'
import { ExchangeNodeData } from '@/types/topology'

export default function ExchangeNode({ data, selected }: NodeProps<ExchangeNodeData>) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'active':
        return 'border-blue-500 bg-blue-50'
      case 'idle':
        return 'border-gray-400 bg-gray-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-400 bg-gray-50'
    }
  }

  const getExchangeIcon = () => {
    const iconClass = "w-4 h-4"
    const iconColor = data.status === 'active' ? 'text-blue-600' : 
                     data.status === 'error' ? 'text-red-600' : 'text-gray-600'
    
    switch (data.exchangeType) {
      case 'direct':
        return <ArrowRightLeft className={`${iconClass} ${iconColor}`} />
      case 'fanout':
        return <Shuffle className={`${iconClass} ${iconColor}`} />
      case 'topic':
        return <Filter className={`${iconClass} ${iconColor}`} />
      case 'headers':
        return <Hash className={`${iconClass} ${iconColor}`} />
      default:
        return <ArrowRightLeft className={`${iconClass} ${iconColor}`} />
    }
  }

  const getStatusIcon = () => {
    if (data.status === 'error') {
      return <AlertCircle className="w-3 h-3 text-red-600" />
    }
    if (data.status === 'active') {
      return <Activity className="w-3 h-3 text-blue-600" />
    }
    return null
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
        {getExchangeIcon()}
        <div className="font-medium text-sm text-gray-800">Exchange</div>
        {getStatusIcon()}
      </div>
      
      <div className="text-xs text-gray-600 mb-2 font-medium">
        {data.label}
      </div>
      
      <div className="text-xs text-gray-500 mb-1">
        Type: {data.exchangeType}
      </div>
      
      <div className="flex gap-2 text-xs text-gray-500">
        {data.durable && <span className="bg-gray-200 px-1 rounded">D</span>}
        {data.autoDelete && <span className="bg-gray-200 px-1 rounded">AD</span>}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  )
}