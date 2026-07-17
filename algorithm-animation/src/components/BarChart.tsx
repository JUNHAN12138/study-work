import React from 'react'
import type { Frame } from '../algorithms'
import './BarChart.css'

interface BarChartProps {
  frame: Frame
}

/** 柱状图可视化组件 —— 只读当前帧，无算法逻辑 */
export const BarChart: React.FC<BarChartProps> = ({ frame }) => {
  const maxVal = Math.max(...frame.array)

  return (
    <div className="bar-chart">
      <div className="bars">
        {frame.array.map((v, i) => {
          const type = frame.colors[i] || 'default'
          return (
            <div
              key={i}
              className={`bar bar-${type}`}
              style={{ height: `${(v / maxVal) * 100}%` }}
            >
              <span className="bar-value">{v}</span>
              <span className="bar-index">{i}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
