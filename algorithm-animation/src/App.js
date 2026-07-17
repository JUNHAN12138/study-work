import React, { useState, useMemo } from 'react'
import { usePlayer } from './hooks/usePlayer'
import { BarChart } from './components/BarChart'
import { PlayerControls } from './components/PlayerControls'
import { BSTAnimation } from './components/BSTAnimation'
import { bubbleSort } from './algorithms/bubbleSort'
import { selectionSort } from './algorithms/selectionSort'
import { insertionSort } from './algorithms/insertionSort'
import { quickSort } from './algorithms/quickSort'
import './App.css'

const algorithms = {
  bubble: { name: '冒泡排序', fn: bubbleSort },
  selection: { name: '选择排序', fn: selectionSort },
  insertion: { name: '插入排序', fn: insertionSort },
  quick: { name: '快速排序', fn: quickSort }
}

function generateArray(size = 8) {
  const arr = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10)
  }
  return arr
}

function SortingAnimation() {
  const [algo, setAlgo] = useState('bubble')
  const [inputArr, setInputArr] = useState(() => generateArray())
  const [customInput, setCustomInput] = useState('')

  const steps = useMemo(() => {
    return algorithms[algo].fn(inputArr)
  }, [algo, inputArr])

  const player = usePlayer(steps)

  const handleRandomize = () => {
    setInputArr(generateArray())
  }

  const handleCustomInput = () => {
    const arr = customInput.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n) && n > 0)
    if (arr.length >= 2) {
      setInputArr(arr)
      setCustomInput('')
    }
  }

  return (
    <div className="sorting-animation">
      <h2>排序算法动画（范式 A）</h2>

      <div className="algo-selector">
        {Object.entries(algorithms).map(([key, { name }]) => (
          <button
            key={key}
            className={algo === key ? 'active' : ''}
            onClick={() => setAlgo(key)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="input-controls">
        <button onClick={handleRandomize}>随机生成</button>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomInput()}
          placeholder="自定义数组（逗号分隔）"
        />
        <button onClick={handleCustomInput}>确定</button>
      </div>

      <BarChart frame={player.frame} />
      <PlayerControls player={player} />
    </div>
  )
}

function App() {
  const [tab, setTab] = useState('sorting')

  return (
    <div className="app">
      <h1>算法动画可视化</h1>
      <p className="subtitle">把算法的每一次"思考"翻译成看得见的高亮 + 听得懂的话</p>

      <div className="tab-bar">
        <button className={tab === 'sorting' ? 'active' : ''} onClick={() => setTab('sorting')}>
          排序算法
        </button>
        <button className={tab === 'bst' ? 'active' : ''} onClick={() => setTab('bst')}>
          二叉搜索树
        </button>
      </div>

      {tab === 'sorting' && <SortingAnimation />}
      {tab === 'bst' && <BSTAnimation />}
    </div>
  )
}

export default App
