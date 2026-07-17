import React, { useState, useRef, useCallback } from 'react'

/**
 * 交互式 BST 动画组件（范式 B）
 * 用户可以插入、删除、查找，动画即时播放
 */

let nodeIdCounter = 0

function createNode(val) {
  return { id: ++nodeIdCounter, val, left: null, right: null }
}

function clone(n) {
  if (!n) return null
  return { id: n.id, val: n.val, left: clone(n.left), right: clone(n.right) }
}

function layoutTree(root) {
  const nodes = []
  const edges = []
  const padX = 40, padY = 40, hGap = 52, vGap = 70
  let col = 0

  function dfs(node, depth) {
    if (!node) return
    dfs(node.left, depth + 1)
    const x = padX + col * hGap
    col++
    const y = padY + depth * vGap
    node._pos = { x, y }
    nodes.push({ id: node.id, val: node.val, x, y })
    dfs(node.right, depth + 1)
  }

  function collectEdges(node) {
    if (!node) return
    if (node.left) {
      edges.push({ x1: node._pos.x, y1: node._pos.y, x2: node.left._pos.x, y2: node.left._pos.y })
      collectEdges(node.left)
    }
    if (node.right) {
      edges.push({ x1: node._pos.x, y1: node._pos.y, x2: node.right._pos.x, y2: node.right._pos.y })
      collectEdges(node.right)
    }
  }

  dfs(root, 0)
  collectEdges(root)
  const width = Math.max(padX * 2, padX * 2 + Math.max(0, col - 1) * hGap)
  const height = Math.max(padY * 2, ...nodes.map(n => n.y + padY), 200)
  return { nodes, edges, width, height }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export function BSTAnimation() {
  const [display, setDisplay] = useState(null)
  const [highlight, setHighlight] = useState(new Set())
  const [msg, setMsg] = useState('BST 为空，请插入结点')
  const [inputVal, setInputVal] = useState('')
  const rootRef = useRef(null)
  const busy = useRef(false)

  const run = useCallback((fn) => {
    if (busy.current) return
    busy.current = true
    fn().finally(() => { busy.current = false })
  }, [])

  const doInsert = useCallback(async (val) => {
    const frames = []
    const snap = (message, hlIds) => {
      frames.push({ tree: clone(rootRef.current), msg: message, hl: hlIds })
    }

    const newNode = createNode(val)
    if (!rootRef.current) {
      rootRef.current = newNode
      snap(`插入根结点 ${val}`, [newNode.id])
    } else {
      let cur = rootRef.current
      const path = []
      while (cur) {
        path.push(cur.id)
        snap(`比较 ${val} 与结点 ${cur.val}`, [...path])
        if (val < cur.val) {
          if (!cur.left) {
            cur.left = newNode
            path.push(newNode.id)
            snap(`${val} < ${cur.val}，插入为左子结点`, [...path])
            break
          }
          cur = cur.left
        } else if (val > cur.val) {
          if (!cur.right) {
            cur.right = newNode
            path.push(newNode.id)
            snap(`${val} > ${cur.val}，插入为右子结点`, [...path])
            break
          }
          cur = cur.right
        } else {
          snap(`${val} 已存在，不重复插入`, path)
          break
        }
      }
    }

    for (const f of frames) {
      setDisplay(f.tree)
      setHighlight(new Set(f.hl))
      setMsg(f.msg)
      await sleep(600)
    }
    setHighlight(new Set())
  }, [])

  const insert = useCallback(() => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    setInputVal('')
    run(() => doInsert(val))
  }, [inputVal, run, doInsert])

  const search = useCallback(() => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    setInputVal('')
    run(async () => {
      let cur = rootRef.current
      const path = []
      while (cur) {
        path.push(cur.id)
        setHighlight(new Set(path))
        setMsg(`比较 ${val} 与结点 ${cur.val}`)
        setDisplay(clone(rootRef.current))
        await sleep(600)
        if (val === cur.val) {
          setMsg(`查找成功：命中结点 ${val}！`)
          return
        }
        cur = val < cur.val ? cur.left : cur.right
      }
      setMsg(`查找失败：不存在 ${val}`)
      setHighlight(new Set())
    })
  }, [inputVal, run])

  const autoDemo = useCallback(() => {
    run(async () => {
      rootRef.current = null
      nodeIdCounter = 0
      setDisplay(null)
      setMsg('开始自动演示...')
      await sleep(500)
      const values = [50, 30, 70, 20, 40, 60, 80, 10, 25]
      for (const v of values) {
        await doInsert(v)
        await sleep(300)
      }
      setMsg('自动演示完成！')
    })
  }, [run, doInsert])

  const layout = display ? layoutTree(clone(display)) : null

  return (
    <div className="bst-animation">
      <h2>交互式 BST（范式 B）</h2>
      <div className="bst-controls">
        <input
          type="number"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && insert()}
          placeholder="输入数值"
        />
        <button onClick={insert}>插入</button>
        <button onClick={search}>查找</button>
        <button onClick={autoDemo}>自动演示</button>
      </div>

      <div className="bst-message">{msg}</div>

      {layout && (
        <svg width={layout.width} height={layout.height} className="tree-svg">
          {layout.edges.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              className="tree-edge" />
          ))}
          {layout.nodes.map(node => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={20}
                className={`tree-node ${highlight.has(node.id) ? 'active' : ''}`} />
              <text x={node.x} y={node.y + 5} textAnchor="middle"
                className="tree-text">{node.val}</text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
