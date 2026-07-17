import React from 'react'

/**
 * 柱状图可视化组件 —— 把帧画出来
 * 视图只读当前帧，无任何算法逻辑
 */
export function BarChart({ frame }) {
  if (!frame) return null
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
      <div className="desc-bar">
        <span className="desc-text">{frame.desc}</span>
        <span className="stats-text">
          比较 {frame.stats.comparisons} · 交换 {frame.stats.swaps}
        </span>
      </div>
    </div>
  )
}
