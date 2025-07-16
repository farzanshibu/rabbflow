import React from 'react'
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react'
import { EdgeData } from '@/types/topology'

export default function BindingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}: EdgeProps<EdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const getEdgeColor = () => {
    if (selected) return '#3b82f6' // blue-500
    if (data?.messageRate && data.messageRate > 0) return '#10b981' // green-500
    return '#6b7280' // gray-500
  }

  const getEdgeWidth = () => {
    if (data?.messageRate && data.messageRate > 100) return 3
    if (data?.messageRate && data.messageRate > 10) return 2
    return 1.5
  }

  const shouldShowLabel = () => {
    return data?.routingKey || (data?.messageRate && data.messageRate > 0)
  }

  return (
    <>
      <path
        id={id}
        style={{
          stroke: getEdgeColor(),
          strokeWidth: getEdgeWidth(),
          fill: 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrow)"
      />
      
      {shouldShowLabel() && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className={`
              px-2 py-1 bg-white border rounded shadow-sm text-xs
              ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            `}
          >
            <div className="space-y-1">
              {data?.routingKey && (
                <div className="font-medium text-gray-700">
                  {data.routingKey}
                </div>
              )}
              {data?.messageRate && data.messageRate > 0 && (
                <div className="text-green-600">
                  {data.messageRate.toFixed(1)}/s
                </div>
              )}
              {data?.messageCount && data.messageCount > 0 && (
                <div className="text-gray-500">
                  {data.messageCount.toLocaleString()} msgs
                </div>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}